"""Tester for BNP-andel og per capita."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from src.analyze.noekkeltall_relative import beregn_relative_noekkeltall
from src.ingest.parse_kiel import LandSummary


def _land(navn: str, total_alloc: float) -> LandSummary:
    return LandSummary(
        land=navn,
        er_eu_medlem=False,
        er_geografisk_europa=True,
        financial_allocation=0.0,
        humanitarian_allocation=0.0,
        military_allocation=total_alloc,
        total_allocation=total_alloc,
        financial_commitment=0.0,
        humanitarian_commitment=0.0,
        military_commitment=total_alloc,
        total_commitment=total_alloc,
    )


def _skriv_folketall(tmp_path: Path, land: dict) -> Path:
    sti = tmp_path / "folketall.json"
    sti.write_text(
        json.dumps(
            {
                "hentet_dato": "2026-05-11",
                "indikator": "SP.POP.TOTL",
                "land": land,
                "utelatt": [],
                "manglende_mapping": [],
            }
        )
    )
    return sti


def test_beregner_med_kiel_bnp(tmp_path: Path) -> None:
    """Excel-metoden (M7.2+): Kiel-BNP i EUR direkte uten valutakonvertering."""
    sti = _skriv_folketall(
        tmp_path,
        {
            "Norway": {
                "iso3": "NOR",
                "folketall": 5_500_000,
                "folketall_aar": 2024,
            }
        },
    )
    resultat = beregn_relative_noekkeltall(
        [_land("Norway", 10.0)],
        sti,
        bnp_eur_mrd={"Norway": 407.7},
    )
    r = resultat[0]
    # 10 / 407.7 * 100 = 2.4527 %
    assert r.andel_bnp_pct == pytest.approx(2.4527, rel=0.01)
    assert r.per_capita_eur == pytest.approx(10e9 / 5.5e6, rel=0.001)
    assert r.bnp_eur_mrd == pytest.approx(407.7)
    assert r.referanseaar_bnp == 2021  # KIEL_BNP_AAR
    assert r.referanseaar_folketall == 2024


def test_land_uten_folketall_men_med_bnp_gir_andel_men_ikke_per_capita(
    tmp_path: Path,
) -> None:
    sti = _skriv_folketall(tmp_path, {})
    resultat = beregn_relative_noekkeltall(
        [_land("X", 1.0)],
        sti,
        bnp_eur_mrd={"X": 100.0},
    )
    assert resultat[0].andel_bnp_pct == pytest.approx(1.0)
    assert resultat[0].per_capita_eur is None


def test_land_uten_data_gir_none(tmp_path: Path) -> None:
    sti = _skriv_folketall(tmp_path, {})
    resultat = beregn_relative_noekkeltall([_land("X", 1.0)], sti, bnp_eur_mrd={})
    assert resultat[0].andel_bnp_pct is None
    assert resultat[0].per_capita_eur is None


def test_mangler_fil_kaster(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError):
        beregn_relative_noekkeltall(
            [_land("X", 1.0)], tmp_path / "mangler.json", bnp_eur_mrd={}
        )
