"""Tester for src.analyze.aarlig (M7.2)."""

from __future__ import annotations

from datetime import date

import pytest

from src.analyze.aarlig import aar_for_maaned, aggreger_per_aar
from src.ingest.parse_kiel import Aktivitet


def test_aar_for_maaned_mapping() -> None:
    """Jan 2022 = 1, Jan 2025 = 37, Des 2025 = 48, Jan 2026 = 49."""
    assert aar_for_maaned(1) == 2022
    assert aar_for_maaned(12) == 2022
    assert aar_for_maaned(13) == 2023
    assert aar_for_maaned(37) == 2025
    assert aar_for_maaned(48) == 2025
    assert aar_for_maaned(49) == 2026
    assert aar_for_maaned(50) == 2026


def _aktivitet(
    land: str,
    kategori: str,
    maal: str,
    redistr: float = 0.0,
    activity: float = 0.0,
    maaned: int | None = None,
    finnes: bool = True,
) -> Aktivitet:
    return Aktivitet(
        giver=land,
        dato=date(2025, 1, 1),
        kategori=kategori,
        maal=maal,
        verdi_eur=0.0,  # legacy felt
        verdi_eur_redistr=redistr,
        verdi_eur_activity=activity,
        maaned_nr=maaned,
        maaned_finnes=finnes,
    )


def test_aggreger_per_aar_summerer_alloc_og_comm() -> None:
    aktiviteter = [
        # Norge 2025: 1.0 mrd Military alloc, 0.5 mrd Humanitarian alloc
        _aktivitet("Norway", "Military", "Allocation",
                   redistr=1_000_000_000, activity=1_200_000_000, maaned=37),
        _aktivitet("Norway", "Humanitarian", "Allocation",
                   redistr=500_000_000, activity=500_000_000, maaned=40),
        # Norge 2025 commitment-only (uten allocation): activity teller mot comm
        _aktivitet("Norway", "Financial", "Commitment",
                   redistr=0, activity=800_000_000, maaned=42),
        # Filtrert ut: maaned_finnes=False
        _aktivitet("Norway", "Military", "Allocation",
                   redistr=999_000_000, activity=999_000_000,
                   maaned=37, finnes=False),
        # Filtrert ut: utenfor 2025-året
        _aktivitet("Norway", "Military", "Allocation",
                   redistr=777_000_000, activity=777_000_000, maaned=12),
    ]
    bnp = {"Norway": 407.7}
    folketall = {"Norway": 5_500_000}
    res = aggreger_per_aar(aktiviteter, [2025], bnp, folketall)
    assert len(res) == 1
    r = res[0]
    assert r.land == "Norway"
    assert r.aar == 2025
    # Allocation: 1.0 + 0.5 = 1.5 mrd
    assert r.total_allocation == pytest.approx(1.5)
    assert r.military_allocation == pytest.approx(1.0)
    assert r.humanitarian_allocation == pytest.approx(0.5)
    # Commitment: 1.2 + 0.5 + 0.8 = 2.5 mrd (activity-verdi for alle rader)
    assert r.total_commitment == pytest.approx(2.5)
    # Per capita: 1.5 mrd EUR / 5.5 mill = ~273 EUR
    assert r.per_capita_eur == pytest.approx(1.5e9 / 5.5e6, rel=0.001)
    # Andel BNP: 1.5 / 407.7 * 100 = 0.368 %
    assert r.andel_bnp_pct == pytest.approx(0.3679, rel=0.01)


def test_aggreger_per_aar_skiller_land_og_aar() -> None:
    aktiviteter = [
        _aktivitet("Norway", "Military", "Allocation",
                   redistr=1_000_000_000, activity=1_000_000_000, maaned=37),
        _aktivitet("Norway", "Military", "Allocation",
                   redistr=2_000_000_000, activity=2_000_000_000, maaned=49),
        _aktivitet("Germany", "Military", "Allocation",
                   redistr=5_000_000_000, activity=5_000_000_000, maaned=40),
    ]
    res = aggreger_per_aar(
        aktiviteter, [2025, 2026], {"Norway": 400, "Germany": 3600}, {}
    )
    res_dict = {(r.land, r.aar): r for r in res}
    assert res_dict[("Norway", 2025)].total_allocation == pytest.approx(1.0)
    assert res_dict[("Norway", 2026)].total_allocation == pytest.approx(2.0)
    assert res_dict[("Germany", 2025)].total_allocation == pytest.approx(5.0)
