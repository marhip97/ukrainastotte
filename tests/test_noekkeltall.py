"""Tester for Norges nøkkeltall-beregning."""

from __future__ import annotations

from pathlib import Path

import pytest

from src.analyze.noekkeltall import beregn_noekkeltall, finn_land
from src.ingest.parse_kiel import LandSummary, parse_country_summary


def _land(
    navn: str,
    fa: float,
    ha: float,
    ma: float,
    fc: float,
    hc: float,
    mc: float,
) -> LandSummary:
    return LandSummary(
        land=navn,
        er_eu_medlem=False,
        er_geografisk_europa=True,
        financial_allocation=fa,
        humanitarian_allocation=ha,
        military_allocation=ma,
        total_allocation=fa + ha + ma,
        financial_commitment=fc,
        humanitarian_commitment=hc,
        military_commitment=mc,
        total_commitment=fc + hc + mc,
    )


def test_absolutt_fordeling_og_rangering() -> None:
    rader = [
        _land("A", 1.0, 1.0, 8.0, 2.0, 1.0, 12.0),  # total alloc 10, comm 15
        _land("B", 5.0, 0.0, 5.0, 5.0, 0.0, 5.0),  # total alloc 10, comm 10
        _land("C", 2.0, 0.0, 0.0, 2.0, 0.0, 0.0),  # total alloc 2, comm 2
    ]
    nt = beregn_noekkeltall(rader)

    a = finn_land(nt, "A")
    assert a.total_allocation_mrd == pytest.approx(10.0)
    # 80% militær, 10/10 finansiell og humanitær
    assert a.fordeling_allocation.militaer_pct == pytest.approx(80.0)
    assert a.fordeling_allocation.finansiell_pct == pytest.approx(10.0)
    assert a.fordeling_allocation.humanitaer_pct == pytest.approx(10.0)

    # Rangering allocation: A og B begge 10, C er 2. Stabil sortering gir
    # A rang 1, B rang 2, C rang 3.
    assert a.rangering_allocation == 1
    assert finn_land(nt, "B").rangering_allocation == 2
    assert finn_land(nt, "C").rangering_allocation == 3

    # Rangering commitment: A (15) > B (10) > C (2).
    assert a.rangering_commitment == 1
    assert finn_land(nt, "B").rangering_commitment == 2
    assert finn_land(nt, "C").rangering_commitment == 3


def test_tomt_land_gir_null_fordeling() -> None:
    nt = beregn_noekkeltall([_land("Tom", 0, 0, 0, 0, 0, 0)])
    f = nt[0].fordeling_allocation
    assert f.militaer_pct == 0.0
    assert f.finansiell_pct == 0.0
    assert f.humanitaer_pct == 0.0


def _finn_ekte_fil() -> Path | None:
    repo_root = Path(__file__).resolve().parents[1]
    filer = sorted((repo_root / "data" / "raw" / "kiel").glob("*.xlsx"))
    return filer[-1] if filer else None


@pytest.mark.skipif(
    _finn_ekte_fil() is None, reason="ingen ekte Kiel-fil i data/raw/kiel/"
)
def test_norges_noekkeltall_mot_kjente_verdier() -> None:
    """Kryssjekk mot publiserte Norge-verdier fra Release 28.

    Total allocation 10.0 mrd EUR; militær-andel bør være 60-65 %
    (6.19 av 10.01 total er ca. 61.8 %).
    """
    fil = _finn_ekte_fil()
    assert fil is not None
    rader = parse_country_summary(fil)
    norge = finn_land(beregn_noekkeltall(rader), "Norway")
    assert norge.total_allocation_mrd == pytest.approx(10.0, rel=0.01)
    assert norge.total_commitment_mrd == pytest.approx(24.7, rel=0.01)
    assert 60.0 < norge.fordeling_allocation.militaer_pct < 65.0
    # Norge er blant topp 20 giverland i absolutt allocation
    assert norge.rangering_allocation <= 20
