"""Parser for Kiel Ukraine Support Tracker XLSX.

Skjelett - dekker bare det som trengs for å validere at strukturen ligner
det vi forventer fra kartleggingsnotatet. Faktiske kolonnenavn bekreftes
først når ekte fil er lastet ned; oppdaterer KONTRAKT da.

Designprinsipp: eksplisitt kontrakt. Hvis en forventet kolonne mangler,
kastes `KolonneKontraktFeil` slik at pipelinen feiler synlig og en
datakilde-Issue kan opprettes (jf. risikomatrise R1).
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from openpyxl import load_workbook

# Forventede kolonner i bilateral-arket. Verifiseres mot ekte fil i M2.
# Navnene er dokumentert fra Kiels metodenotater; reelle kolonner kan
# avvike i presis formulering.
FORVENTET_BILATERAL_KOLONNER: tuple[str, ...] = (
    "Country",
    "Military",
    "Financial",
    "Humanitarian",
)


class KolonneKontraktFeil(ValueError):
    """Kolonnestruktur i Kiel-XLSX matcher ikke forventet kontrakt."""


@dataclass(frozen=True)
class Stotterad:
    """Én rad med støtte fra ett giverland. Verdier er i EUR mrd."""

    giver: str
    militaer: float
    finansiell: float
    humanitaer: float

    @property
    def total(self) -> float:
        return self.militaer + self.finansiell + self.humanitaer


def _finn_bilateral_ark(xlsx_path: Path):
    wb = load_workbook(filename=str(xlsx_path), data_only=True, read_only=True)
    for navn in wb.sheetnames:
        if "bilateral" in navn.lower():
            return wb[navn]
    # Fallback: første ark hvis "bilateral" ikke finnes i arknavnet.
    return wb[wb.sheetnames[0]]


def _hent_header(ark) -> tuple[str, ...]:
    for row in ark.iter_rows(min_row=1, max_row=1, values_only=True):
        return tuple(str(c).strip() if c is not None else "" for c in row)
    return ()


def _sjekk_kontrakt(header: tuple[str, ...]) -> None:
    mangler = [k for k in FORVENTET_BILATERAL_KOLONNER if k not in header]
    if mangler:
        raise KolonneKontraktFeil(
            f"Mangler forventede kolonner: {mangler}. Funnet: {header}"
        )


def _til_float(verdi) -> float:
    if verdi is None or verdi == "":
        return 0.0
    try:
        return float(verdi)
    except (TypeError, ValueError):
        return 0.0


def parse_bilateral(xlsx_path: Path) -> list[Stotterad]:
    """Parse bilateral-arket og returner liste med giverland-rader.

    Kaster `KolonneKontraktFeil` ved strukturavvik.
    """
    ark = _finn_bilateral_ark(xlsx_path)
    header = _hent_header(ark)
    _sjekk_kontrakt(header)
    idx = {navn: header.index(navn) for navn in FORVENTET_BILATERAL_KOLONNER}
    rader: list[Stotterad] = []
    for row in ark.iter_rows(min_row=2, values_only=True):
        giver = row[idx["Country"]]
        if giver is None or str(giver).strip() == "":
            continue
        rader.append(
            Stotterad(
                giver=str(giver).strip(),
                militaer=_til_float(row[idx["Military"]]),
                finansiell=_til_float(row[idx["Financial"]]),
                humanitaer=_til_float(row[idx["Humanitarian"]]),
            )
        )
    return rader
