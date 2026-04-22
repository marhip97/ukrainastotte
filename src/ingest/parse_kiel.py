"""Parser for Kiel Ukraine Support Tracker XLSX (Release 28-struktur).

Leser to ark:

- **Bilateral Assistance, MAIN DATA** (langformat, én rad per sub-aktivitet).
  Har kolonner `donor`, `aid_type_general` (Financial/Humanitarian/Military),
  `measure` (Allocation eller Commitment), `tot_sub_activity_value_EUR`,
  m.fl. Se `docs/kartlegging-kiel.md` for full oversikt.
- **Country Summary (€)** (pre-aggregert per land, verdier i € mrd).
  Header ligger på rad 8. Kolonner: Country, EU member, Geographic Europe,
  Financial/Humanitarian/Military allocations og commitments,
  Total bilateral allocations/commitments.

Begge kan leses uavhengig. `parse_country_summary` gir raskt aggregerte
tall for hovedvisninger i dashboardet; `parse_bilateral` brukes når
analysemodulen trenger detaljer (f.eks. splitt på type_specific eller
månedlig tidsserie).

Designprinsipp: eksplisitte kolonnekontrakter. Hvis forventede kolonner
mangler, kastes `KolonneKontraktFeil` slik at workflow kan opprette
datakilde-Issue (R1).
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path

from openpyxl import load_workbook

BILATERAL_ARK = "Bilateral Assistance, MAIN DATA"
COUNTRY_SUMMARY_ARK = "Country Summary (€)"
COUNTRY_SUMMARY_HEADER_RAD = 8

FORVENTEDE_BILATERAL_KOLONNER: tuple[str, ...] = (
    "donor",
    "announcement_date",
    "aid_type_general",
    "measure",
    "tot_sub_activity_value_EUR",
)

FORVENTEDE_SUMMARY_KOLONNER: tuple[str, ...] = (
    "Country",
    "EU member",
    "Geographic Europe",
    "Financial allocations",
    "Humanitarian allocations",
    "Military allocations",
    "Total bilateral allocations",
    "Financial commitments",
    "Humanitarian commitments",
    "Military commitments",
    "Total bilateral commitments",
)

KATEGORIER = ("Financial", "Humanitarian", "Military")
MAAL = ("Allocation", "Commitment")


class KolonneKontraktFeil(ValueError):
    """Kolonnestruktur i Kiel-XLSX matcher ikke forventet kontrakt."""


@dataclass(frozen=True)
class Aktivitet:
    """Én sub-aktivitet fra bilateral-arket."""

    giver: str
    dato: date | None
    kategori: str
    maal: str
    verdi_eur: float


@dataclass(frozen=True)
class LandSummary:
    """Aggregat per land fra Country Summary (€). Verdier i € mrd."""

    land: str
    er_eu_medlem: bool
    er_geografisk_europa: bool
    financial_allocation: float
    humanitarian_allocation: float
    military_allocation: float
    total_allocation: float
    financial_commitment: float
    humanitarian_commitment: float
    military_commitment: float
    total_commitment: float


def _til_float(verdi) -> float:
    if verdi is None or verdi == "":
        return 0.0
    try:
        return float(verdi)
    except (TypeError, ValueError):
        return 0.0


def _til_bool(verdi) -> bool:
    return _til_float(verdi) > 0.5


def _til_dato(verdi) -> date | None:
    if isinstance(verdi, datetime):
        return verdi.date()
    if isinstance(verdi, date):
        return verdi
    return None


def _hent_header(ark, radnummer: int = 1) -> tuple[str, ...]:
    for i, row in enumerate(ark.iter_rows(values_only=True), 1):
        if i == radnummer:
            return tuple(
                str(c).strip() if c is not None else "" for c in row
            )
    return ()


def _sjekk_kontrakt(header: tuple[str, ...], forventet: tuple[str, ...]) -> None:
    mangler = [k for k in forventet if k not in header]
    if mangler:
        raise KolonneKontraktFeil(
            f"Mangler forventede kolonner: {mangler}"
        )


def parse_bilateral(xlsx_path: Path) -> list[Aktivitet]:
    """Parse bilateral-arket og returner liste over sub-aktiviteter."""
    wb = load_workbook(filename=str(xlsx_path), data_only=True, read_only=True)
    ark = wb[BILATERAL_ARK]
    header = _hent_header(ark, radnummer=1)
    _sjekk_kontrakt(header, FORVENTEDE_BILATERAL_KOLONNER)
    idx = {navn: header.index(navn) for navn in FORVENTEDE_BILATERAL_KOLONNER}
    resultat: list[Aktivitet] = []
    for i, row in enumerate(ark.iter_rows(values_only=True), 1):
        if i == 1:
            continue
        giver = row[idx["donor"]]
        if giver is None or str(giver).strip() == "":
            continue
        kategori = str(row[idx["aid_type_general"]] or "").strip()
        maal = str(row[idx["measure"]] or "").strip()
        if kategori not in KATEGORIER or maal not in MAAL:
            continue
        resultat.append(
            Aktivitet(
                giver=str(giver).strip(),
                dato=_til_dato(row[idx["announcement_date"]]),
                kategori=kategori,
                maal=maal,
                verdi_eur=_til_float(row[idx["tot_sub_activity_value_EUR"]]),
            )
        )
    return resultat


def validate_summary(
    rader: list[LandSummary],
    komponent_toleranse: float = 0.01,
    rimelig_maks_mrd: float = 200.0,
) -> list[str]:
    """Returner liste med advarsler for mistenkelige rader.

    Regler:
    - `total_allocation` skal være sum av tre komponent-allokeringer
      (tillatt avvik: `komponent_toleranse`, default 1 %).
    - `total_commitment` skal være sum av tre komponent-commitments.
    - `total_commitment >= total_allocation` (allocation er delmengde
      av commitment).
    - Ingen verdi skal være negativ.
    - Ingen verdi skal overstige `rimelig_maks_mrd` (default 200 mrd EUR).

    Tom liste betyr at alle rader passerte. Brukes av `qa`-rollen og av
    fetch-workflow for å oppdage strukturelle feil tidlig.
    """
    advarsler: list[str] = []
    for r in rader:
        alloc_komponenter = (
            r.financial_allocation
            + r.humanitarian_allocation
            + r.military_allocation
        )
        if r.total_allocation and abs(alloc_komponenter - r.total_allocation) > (
            komponent_toleranse * r.total_allocation
        ):
            advarsler.append(
                f"{r.land}: total_allocation ({r.total_allocation:.3f}) avviker "
                f"fra sum komponenter ({alloc_komponenter:.3f})"
            )
        comm_komponenter = (
            r.financial_commitment
            + r.humanitarian_commitment
            + r.military_commitment
        )
        if r.total_commitment and abs(comm_komponenter - r.total_commitment) > (
            komponent_toleranse * r.total_commitment
        ):
            advarsler.append(
                f"{r.land}: total_commitment ({r.total_commitment:.3f}) avviker "
                f"fra sum komponenter ({comm_komponenter:.3f})"
            )
        if r.total_commitment + komponent_toleranse < r.total_allocation:
            advarsler.append(
                f"{r.land}: total_commitment ({r.total_commitment:.3f}) "
                f"< total_allocation ({r.total_allocation:.3f})"
            )
        for navn, verdi in (
            ("financial_allocation", r.financial_allocation),
            ("humanitarian_allocation", r.humanitarian_allocation),
            ("military_allocation", r.military_allocation),
            ("total_allocation", r.total_allocation),
            ("financial_commitment", r.financial_commitment),
            ("humanitarian_commitment", r.humanitarian_commitment),
            ("military_commitment", r.military_commitment),
            ("total_commitment", r.total_commitment),
        ):
            if verdi < 0:
                advarsler.append(f"{r.land}: negativ {navn} = {verdi}")
            if verdi > rimelig_maks_mrd:
                advarsler.append(
                    f"{r.land}: urimelig høy {navn} = {verdi} (> {rimelig_maks_mrd})"
                )
    return advarsler


def parse_country_summary(xlsx_path: Path) -> list[LandSummary]:
    """Parse Country Summary (€) og returner aggregat per land."""
    wb = load_workbook(filename=str(xlsx_path), data_only=True, read_only=True)
    ark = wb[COUNTRY_SUMMARY_ARK]
    header = _hent_header(ark, radnummer=COUNTRY_SUMMARY_HEADER_RAD)
    _sjekk_kontrakt(header, FORVENTEDE_SUMMARY_KOLONNER)
    idx = {navn: header.index(navn) for navn in FORVENTEDE_SUMMARY_KOLONNER}
    resultat: list[LandSummary] = []
    for i, row in enumerate(ark.iter_rows(values_only=True), 1):
        if i <= COUNTRY_SUMMARY_HEADER_RAD:
            continue
        land = row[idx["Country"]]
        if land is None or str(land).strip() == "":
            continue
        # "Total"-raden og eventuelle EU-aggregater filtreres - de er
        # ikke enkeltland og gir falske advarsler i validate_summary.
        if str(land).strip().lower() in {"total", "eu"}:
            continue
        resultat.append(
            LandSummary(
                land=str(land).strip(),
                er_eu_medlem=_til_bool(row[idx["EU member"]]),
                er_geografisk_europa=_til_bool(row[idx["Geographic Europe"]]),
                financial_allocation=_til_float(row[idx["Financial allocations"]]),
                humanitarian_allocation=_til_float(
                    row[idx["Humanitarian allocations"]]
                ),
                military_allocation=_til_float(row[idx["Military allocations"]]),
                total_allocation=_til_float(row[idx["Total bilateral allocations"]]),
                financial_commitment=_til_float(
                    row[idx["Financial commitments"]]
                ),
                humanitarian_commitment=_til_float(
                    row[idx["Humanitarian commitments"]]
                ),
                military_commitment=_til_float(row[idx["Military commitments"]]),
                total_commitment=_til_float(row[idx["Total bilateral commitments"]]),
            )
        )
    return resultat
