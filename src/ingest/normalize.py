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
)
from src.analyze.noekkeltall_relative import beregn_relative_noekkeltall

REPO_ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = REPO_ROOT / "data" / "raw" / "kiel"
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
WDI_PATH = REPO_ROOT / "data" / "reference" / "wdi.json"


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


def skriv_country_summary_relative(
    summary: list[LandSummary], wdi_path: Path, out_path: Path
) -> int:
    """Skriv CSV med BNP-andel og per capita per land.

    Returnerer antall rader med komplette relative tall. Hvis `wdi_path`
    mangler, skrives ingen fil.
    """
    if not wdi_path.exists():
        return 0
    rader = beregn_relative_noekkeltall(summary, wdi_path)
    feltnavn = [
        "land",
        "total_allocation_eur_mrd",
        "andel_bnp_pct",
        "per_capita_eur",
        "bnp_usd",
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
                "bnp_usd": r.bnp_usd if r.bnp_usd is not None else "",
                "folketall": r.folketall if r.folketall is not None else "",
                "referanseaar_bnp": r.referanseaar_bnp if r.referanseaar_bnp is not None else "",
                "referanseaar_folketall": r.referanseaar_folketall if r.referanseaar_folketall is not None else "",
            })
    return komplett


def normalize(xlsx_path: Path, out_dir: Path = PROCESSED_DIR) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    summary = parse_country_summary(xlsx_path)
    bilateral = parse_bilateral(xlsx_path)
    disbursements = parse_financial_disbursements(xlsx_path)
    skriv_country_summary(summary, out_dir / "country_summary.csv")
    skriv_bilateral(bilateral, out_dir / "bilateral_activities.csv")
    skriv_disbursements(disbursements, out_dir / "financial_disbursements.csv")
    antall_relative = skriv_country_summary_relative(
        summary, WDI_PATH, out_dir / "country_summary_relative.csv"
    )
    metadata = {
        "kildefil": xlsx_path.name,
        "sha256": _sha256(xlsx_path),
        "antall_land_summary": len(summary),
        "antall_bilateral_rader": len(bilateral),
        "antall_disbursement_rader": len(disbursements),
        "antall_land_med_relative_tall": antall_relative,
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
