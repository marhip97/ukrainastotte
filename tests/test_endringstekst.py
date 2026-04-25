"""Tester for src/analyze/endringstekst.py."""

from __future__ import annotations

import pytest

from src.analyze.endringstekst import (
    Endringstekst,
    generer_endringstekst,
    generer_for_alle,
)
from src.ingest.parse_kiel import LandSummary


def _ls(
    land: str,
    total_alloc: float,
    mil: float = 0.0,
    fin: float = 0.0,
    hum: float = 0.0,
    total_comm: float | None = None,
) -> LandSummary:
    if total_comm is None:
        total_comm = total_alloc
    return LandSummary(
        land=land,
        er_eu_medlem=False,
        er_geografisk_europa=True,
        financial_allocation=fin,
        humanitarian_allocation=hum,
        military_allocation=mil,
        total_allocation=total_alloc,
        financial_commitment=fin,
        humanitarian_commitment=hum,
        military_commitment=mil,
        total_commitment=total_comm,
    )


def test_okning_inkluderer_belop_og_prosent() -> None:
    ny = [_ls("Norway", 11.5, mil=8.0), _ls("Germany", 30.0, mil=20.0)]
    gml = [_ls("Norway", 10.0, mil=7.0), _ls("Germany", 28.0, mil=18.0)]
    e = generer_endringstekst("Norway", ny, gml)
    assert e.delta_total_allocation_mrd == pytest.approx(1.5)
    assert e.delta_total_allocation_pct == pytest.approx(15.0)
    assert "Norges totale støtte" in e.tekst
    assert "økte" in e.tekst
    assert "1,5 milliarder euro" in e.tekst
    assert "15 %" in e.tekst


def test_minskning_har_negativ_retning() -> None:
    ny = [_ls("Norway", 9.5, mil=7.0)]
    gml = [_ls("Norway", 10.0, mil=8.0)]
    e = generer_endringstekst("Norway", ny, gml)
    assert e.delta_total_allocation_mrd == pytest.approx(-0.5)
    assert "minket" in e.tekst
    assert "0,5 milliarder euro" in e.tekst


def test_uendret_under_terskel() -> None:
    ny = [_ls("Norway", 10.02)]
    gml = [_ls("Norway", 10.0)]
    e = generer_endringstekst("Norway", ny, gml)
    assert "uendret" in e.tekst.lower()


def test_rangering_endring_inkluderes() -> None:
    ny = [
        _ls("Norway", 10.0),
        _ls("Sweden", 9.0),
        _ls("Germany", 30.0),
    ]
    gml = [
        _ls("Norway", 8.0),
        _ls("Sweden", 9.0),
        _ls("Germany", 28.0),
    ]
    # I gml: Germany(1), Sweden(2), Norway(3). I ny: Germany(1), Norway(2), Sweden(3).
    e = generer_endringstekst("Norway", ny, gml)
    assert e.rangering_ny == 2
    assert e.rangering_gammel == 3
    assert "opp fra" in e.tekst


def test_rangering_uendret_skrives_uten_pil() -> None:
    ny = [_ls("Norway", 11.5), _ls("Germany", 30.0)]
    gml = [_ls("Norway", 10.0), _ls("Germany", 28.0)]
    e = generer_endringstekst("Norway", ny, gml)
    assert "opp fra" not in e.tekst
    assert "ned fra" not in e.tekst
    assert "rangert som det 2." in e.tekst


def test_dominerende_kategori_militaer() -> None:
    ny = [_ls("Norway", 12.0, mil=9.0, fin=2.0, hum=1.0)]
    gml = [_ls("Norway", 10.0, mil=7.0, fin=2.0, hum=1.0)]
    e = generer_endringstekst("Norway", ny, gml)
    assert "militære" in e.tekst


def test_metodemerknad_alltid_med() -> None:
    ny = [_ls("Norway", 11.5, mil=8.0)]
    gml = [_ls("Norway", 10.0, mil=7.0)]
    e = generer_endringstekst("Norway", ny, gml)
    assert "retroaktive korrigeringer" in e.tekst


def test_nytt_land_uten_forrige() -> None:
    ny = [_ls("Latvia", 0.5)]
    gml = []
    e = generer_endringstekst("Latvia", ny, gml)
    assert "rapportert for første gang" in e.tekst
    assert e.rangering_gammel is None


def test_generer_for_alle_returnerer_dict() -> None:
    ny = [_ls("Norway", 11.5, mil=8.0), _ls("Sweden", 9.0)]
    gml = [_ls("Norway", 10.0, mil=7.0), _ls("Sweden", 8.5)]
    alle = generer_for_alle(ny, gml)
    assert set(alle.keys()) == {"Norway", "Sweden"}
    assert isinstance(alle["Norway"], Endringstekst)


def test_ukjent_land_kaster() -> None:
    ny = [_ls("Norway", 11.5)]
    gml = [_ls("Norway", 10.0)]
    with pytest.raises(KeyError):
        generer_endringstekst("Atlantis", ny, gml)
