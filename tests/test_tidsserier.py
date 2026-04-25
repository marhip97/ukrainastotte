"""Tester for src/analyze/tidsserier.py."""

from __future__ import annotations

from datetime import date

import pytest

from src.analyze.tidsserier import MaanedsAggregat, aggreger_per_maaned
from src.ingest.parse_kiel import Aktivitet


def _kurser() -> dict[date, float]:
    return {
        date(2024, 1, 15): 11.20,
        date(2024, 2, 15): 11.30,
        date(2024, 3, 15): 11.40,
    }


def test_aggreger_summerer_per_land_maaned_kategori_maal() -> None:
    aktiviteter = [
        Aktivitet("Norway", date(2024, 1, 15), "Military", "Allocation", 1_000_000),
        Aktivitet("Norway", date(2024, 1, 15), "Military", "Allocation", 500_000),
        Aktivitet("Norway", date(2024, 2, 15), "Military", "Allocation", 2_000_000),
        Aktivitet("Sweden", date(2024, 1, 15), "Financial", "Commitment", 800_000),
    ]
    rader = aggreger_per_maaned(aktiviteter, _kurser())
    nokler = {(r.land, r.aar, r.maaned, r.kategori, r.maal) for r in rader}
    assert ("Norway", 2024, 1, "Military", "Allocation") in nokler
    assert ("Norway", 2024, 2, "Military", "Allocation") in nokler
    assert ("Sweden", 2024, 1, "Financial", "Commitment") in nokler

    norge_jan = next(
        r for r in rader
        if r.land == "Norway" and r.maaned == 1 and r.maal == "Allocation"
    )
    assert norge_jan.sum_eur == pytest.approx(1_500_000)
    assert norge_jan.sum_nok == pytest.approx(1_500_000 * 11.20)


def test_aggreger_hopper_over_aktiviteter_uten_dato() -> None:
    aktiviteter = [
        Aktivitet("Norway", None, "Military", "Allocation", 9_999_999),
        Aktivitet("Norway", date(2024, 1, 15), "Military", "Allocation", 1_000_000),
    ]
    rader = aggreger_per_maaned(aktiviteter, _kurser())
    assert len(rader) == 1
    assert rader[0].sum_eur == pytest.approx(1_000_000)


def test_aggreger_returnerer_dataclass() -> None:
    aktiviteter = [
        Aktivitet("Norway", date(2024, 3, 15), "Humanitarian", "Allocation", 100_000),
    ]
    rader = aggreger_per_maaned(aktiviteter, _kurser())
    assert len(rader) == 1
    assert isinstance(rader[0], MaanedsAggregat)
    assert rader[0].kategori == "Humanitarian"


def test_aggreger_konverterer_med_helg_fallback() -> None:
    """Aktivitet på lørdag skal bruke forrige bankdag-kurs."""
    kurser = {
        date(2024, 1, 12): 11.10,  # fredag
        date(2024, 1, 15): 11.20,  # mandag
    }
    aktiviteter = [
        Aktivitet("Norway", date(2024, 1, 13), "Military", "Allocation", 1_000_000),
    ]
    rader = aggreger_per_maaned(aktiviteter, kurser)
    assert rader[0].sum_nok == pytest.approx(1_000_000 * 11.10)
