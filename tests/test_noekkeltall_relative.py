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


def _skriv_wdi(tmp_path: Path, land: dict) -> Path:
    sti = tmp_path / "wdi.json"
    sti.write_text(
        json.dumps(
            {
                "hentet_dato": "2026-04-22",
                "indikatorer": {},
                "land": land,
                "utelatt": [],
                "manglende_mapping": [],
            }
        )
    )
    return sti


def test_beregner_riktig_andel_bnp_og_per_capita(tmp_path: Path) -> None:
    wdi_sti = _skriv_wdi(
        tmp_path,
        {
            "Norway": {
                "iso3": "NOR",
                "bnp_usd": 500_000_000_000,  # 500 mrd USD
                "bnp_aar": 2024,
                "folketall": 5_500_000,  # 5.5 mill
                "folketall_aar": 2024,
            }
        },
    )
    resultat = beregn_relative_noekkeltall(
        [_land("Norway", 10.0)],  # 10 mrd EUR
        wdi_sti,
        eur_til_usd=1.10,  # fiksert for testen
    )
    assert len(resultat) == 1
    r = resultat[0]
    # 10 mrd EUR × 1.10 = 11 mrd USD. Andel av 500 mrd BNP = 2.2 %.
    assert r.andel_bnp_pct == pytest.approx(2.2, rel=0.001)
    # 10 mrd EUR / 5.5 mill = ~1818 EUR/innbygger
    assert r.per_capita_eur == pytest.approx(10e9 / 5.5e6, rel=0.001)
    assert r.referanseaar_bnp == 2024


def test_land_uten_wdi_data_gir_none(tmp_path: Path) -> None:
    wdi_sti = _skriv_wdi(tmp_path, {})
    resultat = beregn_relative_noekkeltall([_land("X", 1.0)], wdi_sti)
    assert resultat[0].andel_bnp_pct is None
    assert resultat[0].per_capita_eur is None


def test_mangler_fil_kaster(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError):
        beregn_relative_noekkeltall([_land("X", 1.0)], tmp_path / "mangler.json")
