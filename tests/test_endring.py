"""Tester for endring mellom Kiel-releaser."""

from __future__ import annotations

import pytest

from src.analyze.endring import beregn_endring
from src.ingest.parse_kiel import LandSummary


def _land(navn: str, ma: float, fa: float, ha: float) -> LandSummary:
    return LandSummary(
        land=navn,
        er_eu_medlem=False,
        er_geografisk_europa=True,
        financial_allocation=fa,
        humanitarian_allocation=ha,
        military_allocation=ma,
        total_allocation=fa + ha + ma,
        financial_commitment=fa,
        humanitarian_commitment=ha,
        military_commitment=ma,
        total_commitment=fa + ha + ma,
    )


def test_eksisterende_land_faar_delta() -> None:
    gammel = [_land("Norway", 5.0, 1.0, 1.0)]
    ny = [_land("Norway", 6.0, 2.0, 1.5)]
    resultat = beregn_endring(ny, gammel)
    assert len(resultat) == 1
    r = resultat[0]
    assert r.land == "Norway"
    assert r.delta_military_allocation == pytest.approx(1.0)
    assert r.delta_financial_allocation == pytest.approx(1.0)
    assert r.delta_humanitarian_allocation == pytest.approx(0.5)
    assert r.delta_total_allocation == pytest.approx(2.5)


def test_nytt_land_faar_full_verdi_som_delta() -> None:
    gammel = [_land("Norway", 5.0, 1.0, 1.0)]
    ny = [_land("Norway", 5.0, 1.0, 1.0), _land("Island", 0.2, 0.0, 0.1)]
    resultat = beregn_endring(ny, gammel)
    island = next(r for r in resultat if r.land == "Island")
    assert island.delta_total_allocation == pytest.approx(0.3)


def test_fjernet_land_utelates() -> None:
    gammel = [_land("Norway", 5.0, 1.0, 1.0), _land("X", 1.0, 0.0, 0.0)]
    ny = [_land("Norway", 5.0, 1.0, 1.0)]
    resultat = beregn_endring(ny, gammel)
    assert [r.land for r in resultat] == ["Norway"]
