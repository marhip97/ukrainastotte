"""Enhetstester for Kiel-parser.

Fixture-baserte tester replikerer strukturen i Release 28:
bilateral-arket (header på rad 1) og Country Summary (header på rad 8,
preamble over).

En integrasjonstest nederst kjører kun hvis ekte Kiel-fil finnes under
`data/raw/kiel/`, og krysssjekker Norges total-allocation mot kjent verdi.
"""

from __future__ import annotations

from datetime import date
from pathlib import Path

import pytest
from openpyxl import Workbook

from src.ingest.parse_kiel import (
    BILATERAL_ARK,
    COUNTRY_SUMMARY_ARK,
    FORVENTEDE_BILATERAL_KOLONNER,
    FORVENTEDE_SUMMARY_KOLONNER,
    KolonneKontraktFeil,
    parse_bilateral,
    parse_country_summary,
)


def _lag_fixture(tmp_path: Path) -> Path:
    wb = Workbook()
    wb.remove(wb.active)

    bil = wb.create_sheet(BILATERAL_ARK)
    bil.append(list(FORVENTEDE_BILATERAL_KOLONNER))
    bil.append(["Norway", date(2024, 1, 15), "Military", "Allocation", 100_000_000])
    bil.append(["Norway", date(2024, 2, 10), "Military", "Commitment", 500_000_000])
    bil.append(["Norway", date(2024, 3, 1), "Humanitarian", "Allocation", 20_000_000])
    # Trailing whitespace i kategori - skal normaliseres bort.
    bil.append(["Germany", date(2024, 4, 1), "Humanitarian ", "Allocation", 50_000_000])

    cs = wb.create_sheet(COUNTRY_SUMMARY_ARK)
    for _ in range(7):
        cs.append([])
    cs.append(list(FORVENTEDE_SUMMARY_KOLONNER))
    cs.append(["Norway", 0, 1, 2.03, 1.78, 6.19, 10.00, 5.03, 1.66, 18.03, 24.72])
    cs.append(["Germany", 1, 1, 1.0, 2.0, 15.0, 18.0, 2.0, 3.0, 20.0, 25.0])

    path = tmp_path / "fixture.xlsx"
    wb.save(str(path))
    return path


def test_bilateral_parser_leser_rader(tmp_path: Path) -> None:
    rader = parse_bilateral(_lag_fixture(tmp_path))
    # Rader med trailing whitespace i kategori skal normaliseres og komme med.
    assert [(r.giver, r.kategori, r.maal) for r in rader] == [
        ("Norway", "Military", "Allocation"),
        ("Norway", "Military", "Commitment"),
        ("Norway", "Humanitarian", "Allocation"),
        ("Germany", "Humanitarian", "Allocation"),
    ]
    assert rader[0].dato == date(2024, 1, 15)
    assert rader[0].verdi_eur == pytest.approx(100_000_000)


def test_country_summary_parser_leser_rader(tmp_path: Path) -> None:
    rader = parse_country_summary(_lag_fixture(tmp_path))
    assert [r.land for r in rader] == ["Norway", "Germany"]
    norge = rader[0]
    assert norge.er_eu_medlem is False
    assert norge.er_geografisk_europa is True
    assert norge.total_allocation == pytest.approx(10.00)
    assert norge.total_commitment == pytest.approx(24.72)


def test_parser_kaster_ved_kolonneavvik(tmp_path: Path) -> None:
    wb = Workbook()
    wb.remove(wb.active)
    bil = wb.create_sheet(BILATERAL_ARK)
    bil.append(["donor", "announcement_date", "aid_type_general"])  # mangler to
    bil.append(["Norway", date(2024, 1, 1), "Military"])
    path = tmp_path / "trunkert.xlsx"
    wb.save(str(path))
    with pytest.raises(KolonneKontraktFeil):
        parse_bilateral(path)


def _finn_ekte_fil() -> Path | None:
    repo_root = Path(__file__).resolve().parents[1]
    filer = sorted((repo_root / "data" / "raw" / "kiel").glob("*.xlsx"))
    return filer[-1] if filer else None


@pytest.mark.skipif(
    _finn_ekte_fil() is None, reason="ingen ekte Kiel-fil i data/raw/kiel/"
)
def test_krysssjekk_norges_total_allocation() -> None:
    """Kryssjekk: Norges total-allocation i Country Summary matcher
    summen av sub-aktiviteter med measure=Allocation i bilateral-arket.

    Kiel-verdier i summary er i € mrd; bilateral er i EUR. Vi tillater
    1 % toleranse fordi summary kan inkludere justeringer.
    """
    fil = _finn_ekte_fil()
    assert fil is not None
    summary = {r.land: r for r in parse_country_summary(fil)}
    bilateral = parse_bilateral(fil)
    norge_sum_eur = sum(
        r.verdi_eur for r in bilateral if r.giver == "Norway" and r.maal == "Allocation"
    )
    norge_sum_mrd = norge_sum_eur / 1_000_000_000
    expected = summary["Norway"].total_allocation
    assert norge_sum_mrd == pytest.approx(expected, rel=0.01)
