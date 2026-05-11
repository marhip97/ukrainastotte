"""Tester for src.analyze.eu_fordeling (M7.2)."""

from __future__ import annotations

from pathlib import Path

import pytest
from openpyxl import Workbook

from src.analyze.eu_fordeling import (
    KOL_TOTAL_INKL_EU_ALLOCATIONS,
    KOL_TOTAL_INKL_EU_COMMITMENTS,
    LandSummaryEu,
    fordelEuStotte,
    parse_inkl_eu_totaler,
)
from src.ingest.parse_kiel import COUNTRY_SUMMARY_ARK, LandSummary


def _land(navn: str, eu: bool, alloc: float, comm: float) -> LandSummary:
    return LandSummary(
        land=navn,
        er_eu_medlem=eu,
        er_geografisk_europa=True,
        financial_allocation=0.0,
        humanitarian_allocation=0.0,
        military_allocation=alloc,
        total_allocation=alloc,
        financial_commitment=0.0,
        humanitarian_commitment=0.0,
        military_commitment=comm,
        total_commitment=comm,
    )


def test_fordel_eu_stotte_uendret_for_ikke_eu_land() -> None:
    norge = _land("Norway", eu=False, alloc=10.0, comm=24.0)
    # Norge er ikke-medlem - INKL skal være lik EKSKL.
    resultat = fordelEuStotte([norge], inkl_eu_totaler={})
    assert resultat[0].total_allocation_inkl_eu == 10.0
    assert resultat[0].total_commitment_inkl_eu == 24.0


def test_fordel_eu_stotte_legger_til_eu_andel_for_medlem() -> None:
    tyskland = _land("Germany", eu=True, alloc=25.295, comm=47.232)
    # Kiels pre-aggregerte INKL EU-tall (matcher fasit fra m7-fasitverdier).
    inkl = {"Germany": (44.407, 90.569)}
    resultat = fordelEuStotte([tyskland], inkl)
    assert resultat[0].total_allocation_inkl_eu == pytest.approx(44.407)
    assert resultat[0].total_commitment_inkl_eu == pytest.approx(90.569)
    # EKSKL-feltene er uendret.
    assert resultat[0].total_allocation == pytest.approx(25.295)


def _lag_country_summary_fixture(
    tmp_path: Path,
    rader: list[tuple[str, float, float]],
) -> Path:
    """Lag minimal Country Summary med kun INKL EU-kolonnene fylt ut.

    Tar liste av (land, alloc_inkl_eu, comm_inkl_eu).
    """
    wb = Workbook()
    wb.remove(wb.active)
    ark = wb.create_sheet(COUNTRY_SUMMARY_ARK)
    for _ in range(8):
        ark.append([])
    # Tom header rad (vi leser posisjonsbasert)
    header = [""] * (KOL_TOTAL_INKL_EU_ALLOCATIONS + 1)
    header[1] = "Country"
    header[KOL_TOTAL_INKL_EU_COMMITMENTS] = "Total bilateral and EU commitments"
    header[KOL_TOTAL_INKL_EU_ALLOCATIONS] = "Total bilateral and EU allocations"
    ark.append(header)
    for land, alloc, comm in rader:
        row = [""] * (KOL_TOTAL_INKL_EU_ALLOCATIONS + 1)
        row[1] = land
        row[KOL_TOTAL_INKL_EU_COMMITMENTS] = comm
        row[KOL_TOTAL_INKL_EU_ALLOCATIONS] = alloc
        ark.append(row)
    path = tmp_path / "cs_eu.xlsx"
    wb.save(str(path))
    return path


def test_parse_inkl_eu_totaler_leser_kolonner(tmp_path: Path) -> None:
    fil = _lag_country_summary_fixture(
        tmp_path,
        [("Germany", 44.407, 90.569), ("Norway", 10.005, 24.724),
         ("Total", 350.0, 700.0)],  # skal filtreres
    )
    res = parse_inkl_eu_totaler(fil)
    assert res["Germany"] == (pytest.approx(44.407), pytest.approx(90.569))
    assert res["Norway"] == (pytest.approx(10.005), pytest.approx(24.724))
    assert "Total" not in res


def test_landsummary_eu_har_alle_felter() -> None:
    """LandSummaryEu skal speile LandSummary pluss to INKL EU-felter."""
    eu = LandSummaryEu(
        land="X", er_eu_medlem=False, er_geografisk_europa=False,
        financial_allocation=0, humanitarian_allocation=0,
        military_allocation=1, total_allocation=1,
        financial_commitment=0, humanitarian_commitment=0,
        military_commitment=2, total_commitment=2,
        total_allocation_inkl_eu=1, total_commitment_inkl_eu=2,
    )
    assert eu.total_allocation_inkl_eu == eu.total_allocation
