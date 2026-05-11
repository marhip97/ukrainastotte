"""Normaliserer Kiel-rådata til analyseklare CSV-filer.

Leser siste XLSX i `data/raw/kiel/` (eller en angitt sti) og produserer:

- `data/processed/country_summary.csv` - aggregat per land (€ mrd).
- `data/processed/bilateral_activities.csv` - én rad per sub-aktivitet.
- `data/processed/metadata.json` - kildefilnavn, sha256, radtall, dato.

Brukes både lokalt og fra GitHub Actions (`.github/workflows/fetch-kiel.yml`)
etter at ny rådata er lagret. Fail-fast: kolonne-kontraktfeil fra
`parse_kiel` propagerer, slik at workflow kan opprette Issue (R1).
"""

from __future__ import annotations

import csv
import hashlib
import json
import sys
from dataclasses import asdict, fields
from datetime import date
from pathlib import Path

from src.ingest.parse_kiel import (
    Aktivitet,
    FinanciellUtbetaling,
    LandSummary,
    parse_bilateral,
    parse_country_summary,
    parse_financial_disbursements,
    parse_gdp,
)
from src.analyze.aarlig import AarligLandTotal, aggreger_per_aar
from src.analyze.endring import beregn_endring
from src.analyze.endringstekst import generer_for_alle
from src.analyze.eu_fordeling import (
    LandSummaryEu,
    fordelEuStotte,
    parse_inkl_eu_totaler,
)
from src.analyze.noekkeltall_relative import beregn_relative_noekkeltall
from src.analyze.tidsserier import MaanedsAggregat, aggreger_per_maaned
from src.analyze.valutakonvertering import eur_til_nok, last_kurser

# Hvilke kalenderår vi aggregerer i country_summary_aar.csv. Excel-metoden
# starter ved 2022 (første år med Ukraine-støttedata). 2026 inkluderes selv
# om data så langt kun dekker jan-feb, fordi månedsfilter på `maaned_finnes`
# gjør resten av året tomt naturlig.
AARLIG_AAR_LISTE = [2022, 2023, 2024, 2025, 2026]

REPO_ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = REPO_ROOT / "data" / "raw" / "kiel"
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
# Etter M7.3 leses folketall fra folketall.json. Hvis filen mangler (gammel
# workflow har ikke kjørt enda), faller vi tilbake til legacy wdi.json som
# fortsatt har folketall-feltet.
FOLKETALL_PATH = REPO_ROOT / "data" / "reference" / "folketall.json"
LEGACY_WDI_PATH = REPO_ROOT / "data" / "reference" / "wdi.json"
VALUTAKURSER_PATH = REPO_ROOT / "data" / "reference" / "valutakurser.json"


def _aktiv_folketall_sti() -> Path | None:
    """Returner stien til folketalldata, eller None hvis ingen finnes."""
    if FOLKETALL_PATH.exists():
        return FOLKETALL_PATH
    if LEGACY_WDI_PATH.exists():
        return LEGACY_WDI_PATH
    return None


def _finn_nyeste_xlsx() -> Path:
    filer = sorted(RAW_DIR.glob("*.xlsx"))
    if not filer:
        raise FileNotFoundError(f"Ingen XLSX i {RAW_DIR}")
    return filer[-1]


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def skriv_country_summary(rader: list[LandSummary], path: Path) -> None:
    feltnavn = [f.name for f in fields(LandSummary)]
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=feltnavn)
        writer.writeheader()
        for rad in rader:
            writer.writerow(asdict(rad))


def skriv_bilateral(rader: list[Aktivitet], path: Path) -> None:
    feltnavn = [f.name for f in fields(Aktivitet)] + ["verdi_eur_mrd"]
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=feltnavn)
        writer.writeheader()
        for rad in rader:
            d = asdict(rad)
            d["dato"] = rad.dato.isoformat() if rad.dato else ""
            d["verdi_eur_mrd"] = rad.verdi_eur / 1_000_000_000
            writer.writerow(d)


def skriv_disbursements(rader: list[FinanciellUtbetaling], path: Path) -> None:
    feltnavn = [f.name for f in fields(FinanciellUtbetaling)]
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=feltnavn)
        writer.writeheader()
        for rad in rader:
            writer.writerow(asdict(rad))


def skriv_country_summary_endring(
    ny_xlsx: Path, raw_dir: Path, out_path: Path
) -> tuple[int, str | None]:
    """Skriv delta-CSV basert på nest-nyeste release.

    Returnerer `(antall_rader, forrige_release_filnavn)`. Hvis det bare
    finnes én release, skrives ingen fil og `(0, None)` returneres.
    """
    kandidater = sorted(raw_dir.glob("*.xlsx"))
    if len(kandidater) < 2:
        return (0, None)
    if kandidater[-1] != ny_xlsx:
        # Bruk faktisk nyeste hvis den angitte ikke er siste.
        return (0, None)
    forrige = kandidater[-2]
    ny_sum = parse_country_summary(ny_xlsx)
    gml_sum = parse_country_summary(forrige)
    deltaer = beregn_endring(ny_sum, gml_sum)
    feltnavn = [
        "land",
        "delta_total_allocation",
        "delta_total_commitment",
        "delta_military_allocation",
        "delta_financial_allocation",
        "delta_humanitarian_allocation",
    ]
    with out_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=feltnavn)
        writer.writeheader()
        for d in deltaer:
            writer.writerow(asdict(d))
    return (len(deltaer), forrige.name)


def skriv_endringstekst(
    ny_xlsx: Path, raw_dir: Path, out_path: Path
) -> tuple[int, str | None]:
    """Skriv `endringstekst.json` med automatisk generert tekst per land.

    Krever minst to releaser i `raw_dir`. Returnerer
    `(antall_land, forrige_release_filnavn)`. Hvis det bare finnes
    én release, skrives ingen fil og `(0, None)` returneres.
    """
    kandidater = sorted(raw_dir.glob("*.xlsx"))
    if len(kandidater) < 2:
        return (0, None)
    if kandidater[-1] != ny_xlsx:
        return (0, None)
    forrige = kandidater[-2]
    ny_sum = parse_country_summary(ny_xlsx)
    gml_sum = parse_country_summary(forrige)
    tekster = generer_for_alle(ny_sum, gml_sum)
    output = {
        "generert_dato": date.today().isoformat(),
        "ny_release": ny_xlsx.name,
        "forrige_release": forrige.name,
        "tekster": {
            land: {
                "tekst": e.tekst,
                "delta_total_allocation_mrd": e.delta_total_allocation_mrd,
                "delta_total_allocation_pct": e.delta_total_allocation_pct,
                "rangering_ny": e.rangering_ny,
                "rangering_gammel": e.rangering_gammel,
            }
            for land, e in tekster.items()
        },
    }
    out_path.write_text(
        json.dumps(output, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return (len(tekster), forrige.name)


def skriv_country_summary_relative(
    summary: list[LandSummary],
    folketall_path: Path,
    out_path: Path,
    bnp_eur_mrd: dict[str, float],
) -> int:
    """Skriv CSV med BNP-andel og per capita per land (excel-metoden).

    `bnp_eur_mrd` er Kiels GDP 2021 per land i EUR. `folketall_path` peker
    på `folketall.json` (eller legacy `wdi.json` i overgangsperioden).
    """
    if not folketall_path.exists():
        return 0
    rader = beregn_relative_noekkeltall(summary, folketall_path, bnp_eur_mrd=bnp_eur_mrd)
    feltnavn = [
        "land",
        "total_allocation_eur_mrd",
        "andel_bnp_pct",
        "per_capita_eur",
        "bnp_eur_mrd",
        "folketall",
        "referanseaar_bnp",
        "referanseaar_folketall",
    ]
    summary_idx = {s.land: s for s in summary}
    komplett = 0
    with out_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=feltnavn)
        writer.writeheader()
        for r in rader:
            s = summary_idx.get(r.land)
            if s is None:
                continue
            if r.andel_bnp_pct is not None and r.per_capita_eur is not None:
                komplett += 1
            writer.writerow({
                "land": r.land,
                "total_allocation_eur_mrd": s.total_allocation,
                "andel_bnp_pct": r.andel_bnp_pct if r.andel_bnp_pct is not None else "",
                "per_capita_eur": r.per_capita_eur if r.per_capita_eur is not None else "",
                "bnp_eur_mrd": r.bnp_eur_mrd if r.bnp_eur_mrd is not None else "",
                "folketall": r.folketall if r.folketall is not None else "",
                "referanseaar_bnp": r.referanseaar_bnp if r.referanseaar_bnp is not None else "",
                "referanseaar_folketall": r.referanseaar_folketall if r.referanseaar_folketall is not None else "",
            })
    return komplett


def skriv_country_summary_eu(rader: list[LandSummaryEu], path: Path) -> int:
    """Skriv CSV med EKSKL og INKL EU-totaler per land (excel-metoden).

    Header inkluderer både EKSKL-felter (uendret fra LandSummary) og to
    nye INKL EU-felter. Brukes som hovedkilde i dashboardets EU-bryter.
    """
    feltnavn = [f.name for f in fields(LandSummaryEu)]
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=feltnavn)
        writer.writeheader()
        for r in rader:
            writer.writerow(asdict(r))
    return len(rader)


def skriv_country_summary_aar(rader: list[AarligLandTotal], path: Path) -> int:
    """Skriv country_summary_aar.csv (land × år × målepunkter).

    Brukes til dashboardets enkeltårs-visning (M7.4). Filter på
    `maaned_finnes=True` og kalenderår er allerede anvendt i
    `aggreger_per_aar`.
    """
    feltnavn = [f.name for f in fields(AarligLandTotal)]
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=feltnavn)
        writer.writeheader()
        for r in rader:
            d = asdict(r)
            # Skriv None som tom streng for CSV-vennlighet
            for k, v in list(d.items()):
                if v is None:
                    d[k] = ""
            writer.writerow(d)
    return len(rader)


def skriv_tidsserier_maanedlig(
    rader: list[MaanedsAggregat], path: Path
) -> None:
    feltnavn = [
        "land",
        "aar",
        "maaned",
        "kategori",
        "maal",
        "sum_eur",
        "sum_nok",
    ]
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=feltnavn)
        writer.writeheader()
        for r in rader:
            writer.writerow({
                "land": r.land,
                "aar": r.aar,
                "maaned": r.maaned,
                "kategori": r.kategori,
                "maal": r.maal,
                "sum_eur": r.sum_eur,
                "sum_nok": r.sum_nok,
            })


def skriv_country_summary_nok(
    bilateral: list[Aktivitet],
    summary: list[LandSummary],
    kurser: dict,
    path: Path,
) -> int:
    """Skriv country_summary_nok.csv med NOK-konverterte aggregater per land.

    Strategi: summer NOK-konverterte beløp fra hver bilateral-aktivitet
    per land (S8: dynamisk historisk EUR/NOK-kurs på utbetalingsdato,
    forrige bankdag som fallback). Aktiviteter uten dato bruker siste
    tilgjengelige kurs som fallback - de er fortsatt med i totalen,
    bare ikke i tidsserien (`tidsserier.aggreger_per_maaned` filtrerer
    dem ut der). Strukturen speiler `country_summary.csv`, men i NOK.
    """
    bucket: dict[str, dict[str, float]] = {}
    for a in bilateral:
        nok, _ = eur_til_nok(a.verdi_eur, a.dato, kurser)
        rad = bucket.setdefault(
            a.giver,
            {
                "financial_allocation": 0.0,
                "humanitarian_allocation": 0.0,
                "military_allocation": 0.0,
                "total_allocation": 0.0,
                "financial_commitment": 0.0,
                "humanitarian_commitment": 0.0,
                "military_commitment": 0.0,
                "total_commitment": 0.0,
            },
        )
        if a.maal == "Allocation":
            rad["total_allocation"] += nok
            if a.kategori == "Financial":
                rad["financial_allocation"] += nok
            elif a.kategori == "Humanitarian":
                rad["humanitarian_allocation"] += nok
            elif a.kategori == "Military":
                rad["military_allocation"] += nok
        elif a.maal == "Commitment":
            rad["total_commitment"] += nok
            if a.kategori == "Financial":
                rad["financial_commitment"] += nok
            elif a.kategori == "Humanitarian":
                rad["humanitarian_commitment"] += nok
            elif a.kategori == "Military":
                rad["military_commitment"] += nok

    summary_idx = {s.land: s for s in summary}
    feltnavn = [
        "land",
        "er_eu_medlem",
        "er_geografisk_europa",
        "financial_allocation_nok",
        "humanitarian_allocation_nok",
        "military_allocation_nok",
        "total_allocation_nok",
        "financial_commitment_nok",
        "humanitarian_commitment_nok",
        "military_commitment_nok",
        "total_commitment_nok",
    ]
    skrevet = 0
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=feltnavn)
        writer.writeheader()
        for land in sorted(bucket):
            s = summary_idx.get(land)
            v = bucket[land]
            writer.writerow({
                "land": land,
                "er_eu_medlem": s.er_eu_medlem if s else "",
                "er_geografisk_europa": s.er_geografisk_europa if s else "",
                "financial_allocation_nok": v["financial_allocation"],
                "humanitarian_allocation_nok": v["humanitarian_allocation"],
                "military_allocation_nok": v["military_allocation"],
                "total_allocation_nok": v["total_allocation"],
                "financial_commitment_nok": v["financial_commitment"],
                "humanitarian_commitment_nok": v["humanitarian_commitment"],
                "military_commitment_nok": v["military_commitment"],
                "total_commitment_nok": v["total_commitment"],
            })
            skrevet += 1
    return skrevet


def normalize(xlsx_path: Path, out_dir: Path = PROCESSED_DIR) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    summary = parse_country_summary(xlsx_path)
    bilateral = parse_bilateral(xlsx_path)
    disbursements = parse_financial_disbursements(xlsx_path)
    # M7.2: Kiel-BNP og INKL EU-totaler hentes direkte fra XLSX.
    gdp_rader = parse_gdp(xlsx_path)
    bnp_eur_mrd = {r.land: r.bnp_2021_eur_mrd for r in gdp_rader}
    inkl_eu_totaler = parse_inkl_eu_totaler(xlsx_path)

    skriv_country_summary(summary, out_dir / "country_summary.csv")
    skriv_bilateral(bilateral, out_dir / "bilateral_activities.csv")
    skriv_disbursements(disbursements, out_dir / "financial_disbursements.csv")
    folketall_sti = _aktiv_folketall_sti()
    antall_relative = 0
    if folketall_sti is not None:
        antall_relative = skriv_country_summary_relative(
            summary, folketall_sti, out_dir / "country_summary_relative.csv",
            bnp_eur_mrd=bnp_eur_mrd,
        )
    eu_rader = fordelEuStotte(summary, inkl_eu_totaler)
    antall_eu = skriv_country_summary_eu(
        eu_rader, out_dir / "country_summary_eu.csv"
    )
    # WDI folketall for per capita-beregning i årlig CSV. Per S24 beholdes
    # WDI MRV-strategi (kun SP.POP.TOTL etter M7.3-slanking).
    folketall: dict[str, int] = {}
    if folketall_sti is not None:
        data = json.loads(folketall_sti.read_text())
        for land, info in data.get("land", {}).items():
            if info.get("folketall"):
                folketall[land] = info["folketall"]
    aarlig = aggreger_per_aar(
        bilateral, AARLIG_AAR_LISTE, bnp_eur_mrd, folketall
    )
    antall_aar = skriv_country_summary_aar(
        aarlig, out_dir / "country_summary_aar.csv"
    )
    antall_endring, forrige_release = skriv_country_summary_endring(
        xlsx_path, RAW_DIR, out_dir / "country_summary_endring.csv"
    )
    antall_endringstekst, _ = skriv_endringstekst(
        xlsx_path, RAW_DIR, out_dir / "endringstekst.json"
    )

    antall_tidsserie_rader = 0
    antall_land_nok = 0
    if VALUTAKURSER_PATH.exists():
        kurser = last_kurser(VALUTAKURSER_PATH)
        if kurser:
            tidsserie = aggreger_per_maaned(bilateral, kurser)
            skriv_tidsserier_maanedlig(
                tidsserie, out_dir / "tidsserier_maanedlig.csv"
            )
            antall_tidsserie_rader = len(tidsserie)
            antall_land_nok = skriv_country_summary_nok(
                bilateral, summary, kurser, out_dir / "country_summary_nok.csv"
            )

    metadata = {
        "kildefil": xlsx_path.name,
        "sha256": _sha256(xlsx_path),
        "antall_land_summary": len(summary),
        "antall_bilateral_rader": len(bilateral),
        "antall_disbursement_rader": len(disbursements),
        "antall_land_med_relative_tall": antall_relative,
        "antall_land_eu": antall_eu,
        "antall_land_aar_rader": antall_aar,
        "forrige_release": forrige_release,
        "antall_land_med_endring": antall_endring,
        "antall_land_med_endringstekst": antall_endringstekst,
        "antall_tidsserie_rader": antall_tidsserie_rader,
        "antall_land_nok": antall_land_nok,
        "prosessert_dato": date.today().isoformat(),
    }
    (out_dir / "metadata.json").write_text(
        json.dumps(metadata, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return metadata


def main(argv: list[str]) -> int:
    if len(argv) > 1:
        xlsx_path = Path(argv[1])
    else:
        xlsx_path = _finn_nyeste_xlsx()
    metadata = normalize(xlsx_path)
    print(json.dumps(metadata, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
