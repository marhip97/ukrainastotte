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
    DISBURSEMENT_ARK,
    FORVENTEDE_BILATERAL_KOLONNER,
    FORVENTEDE_SUMMARY_KOLONNER,
    KolonneKontraktFeil,
    LandSummary,
    parse_bilateral,
    parse_country_summary,
    parse_financial_disbursements,
    validate_summary,
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


def _lag_disbursement_fixture(tmp_path: Path) -> Path:
    wb = Workbook()
    wb.remove(wb.active)
    ark = wb.create_sheet(DISBURSEMENT_ARK)
    # Rad 1-9 kan være blanke/tittel
    for _ in range(9):
        ark.append([])
    # Rad 10: månedsetiketter
    ark.append(
        ["", "", "", "January", "February", "March", "January (2023)", "February (2023)"]
    )
    # Rad 11: header
    ark.append(["", "Country", "EU member", "1", "2", "3", "4", "5"])
    # Rad 12: tom
    ark.append([])
    # Data
    ark.append(["", "Norway", 0, 0.0, 0.5, 0.0, 0.0, 0.3])
    ark.append(["", "Germany", 1, 1.0, 0.0, 0.0, 2.0, 0.0])
    ark.append(["", "Total per month", 0, 1.0, 0.5, 0.0, 2.0, 0.3])
    path = tmp_path / "disbursement.xlsx"
    wb.save(str(path))
    return path


def test_disbursement_parser_leser_og_filtrerer(tmp_path: Path) -> None:
    rader = parse_financial_disbursements(_lag_disbursement_fixture(tmp_path))
    # "Total per month" skal filtreres. 0-verdier hoppes over.
    # Norway: (2022-02, 0.5), (2023-02, 0.3)
    # Germany: (2022-01, 1.0), (2023-01, 2.0)
    assert [(r.giver, r.aar, r.maaned, r.verdi_eur_mrd) for r in rader] == [
        ("Norway", 2022, 2, 0.5),
        ("Norway", 2023, 2, 0.3),
        ("Germany", 2022, 1, 1.0),
        ("Germany", 2023, 1, 2.0),
    ]
    assert rader[2].er_eu_medlem is True
    assert rader[0].er_eu_medlem is False


def _finn_ekte_fil() -> Path | None:
    repo_root = Path(__file__).resolve().parents[1]
    filer = sorted((repo_root / "data" / "raw" / "kiel").glob("*.xlsx"))
    return filer[-1] if filer else None


def _land(**endringer) -> LandSummary:
    base = dict(
        land="Test",
        er_eu_medlem=False,
        er_geografisk_europa=True,
        financial_allocation=1.0,
        humanitarian_allocation=2.0,
        military_allocation=3.0,
        total_allocation=6.0,
        financial_commitment=2.0,
        humanitarian_commitment=3.0,
        military_commitment=5.0,
        total_commitment=10.0,
    )
    base.update(endringer)
    return LandSummary(**base)


def test_validate_gyldig_rad_gir_ingen_advarsler() -> None:
    assert validate_summary([_land()]) == []


def test_validate_fanger_komponent_avvik() -> None:
    # total_allocation er 6.0 men komponenter summerer til 7.0
    rad = _land(military_allocation=4.0)
    advarsler = validate_summary([rad])
    assert any("total_allocation" in a for a in advarsler)


def test_validate_fanger_commitment_under_allocation() -> None:
    rad = _land(total_commitment=5.0, military_commitment=0.0)  # 5 < 6
    advarsler = validate_summary([rad])
    assert any("total_commitment" in a and "< total_allocation" in a for a in advarsler)


def test_validate_fanger_negativ_og_urimelig_hoeg() -> None:
    neg = _land(
        financial_allocation=-1.0,
        total_allocation=4.0,
    )
    hoey = _land(
        military_allocation=500.0,
        total_allocation=503.0,
        military_commitment=500.0,
        total_commitment=505.0,
    )
    advarsler = validate_summary([neg, hoey])
    assert any("negativ" in a for a in advarsler)
    assert any("urimelig høy" in a for a in advarsler)


@pytest.mark.skipif(
    _finn_ekte_fil() is None, reason="ingen ekte Kiel-fil i data/raw/kiel/"
)
def test_validate_ekte_fil_kjente_avvik() -> None:
    """Validerer at ekte fil kun har kjente, lavsignaturs advarsler.

    Release 28 har små commitment<allocation-avvik for noen få land
    (sannsynligvis fordi allocation-tall er oppdatert nyere enn
    commitment). Vi aksepterer inntil 5 slike advarsler og ingen andre
    typer. Vekker testen oppmerksomhet hvis nye avvik dukker opp ved
    neste release.
    """
    fil = _finn_ekte_fil()
    assert fil is not None
    advarsler = validate_summary(parse_country_summary(fil))
    assert len(advarsler) <= 5
    for a in advarsler:
        assert "total_commitment" in a and "< total_allocation" in a, (
            f"Uventet advarselstype: {a}"
        )


@pytest.mark.skipif(
    _finn_ekte_fil() is None, reason="ingen ekte Kiel-fil i data/raw/kiel/"
)
def test_disbursement_ekte_fil_norges_sum_under_commitment() -> None:
    """Sum av Norges månedlige utbetalinger <= Norges total_commitment.

    Dette er den logiske kryssjekken: faktiske utbetalinger kan ikke
    overstige det som er committed. Gir rask sanity-check på tidsseriene.
    """
    fil = _finn_ekte_fil()
    assert fil is not None
    utbetalinger = parse_financial_disbursements(fil)
    summary = {r.land: r for r in parse_country_summary(fil)}
    norges_utbetalt = sum(
        r.verdi_eur_mrd for r in utbetalinger if r.giver == "Norway"
    )
    norges_commitment = summary["Norway"].total_commitment
    assert norges_utbetalt <= norges_commitment
    # Også positivt signal: vi forventer minst noen utbetalinger.
    assert len(utbetalinger) > 50


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
