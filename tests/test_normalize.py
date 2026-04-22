"""Tester for normaliseringsmodulen."""

from __future__ import annotations

import csv
import json
from datetime import date
from pathlib import Path

import pytest
from openpyxl import Workbook

from src.ingest.normalize import normalize
from src.ingest.parse_kiel import (
    BILATERAL_ARK,
    COUNTRY_SUMMARY_ARK,
    DISBURSEMENT_ARK,
    FORVENTEDE_BILATERAL_KOLONNER,
    FORVENTEDE_SUMMARY_KOLONNER,
)


def _lag_fixture(tmp_path: Path) -> Path:
    wb = Workbook()
    wb.remove(wb.active)

    bil = wb.create_sheet(BILATERAL_ARK)
    bil.append(list(FORVENTEDE_BILATERAL_KOLONNER))
    bil.append(["Norway", date(2024, 1, 1), "Military", "Allocation", 1_000_000_000])
    bil.append(["Norway", date(2024, 2, 1), "Financial", "Commitment", 500_000_000])

    cs = wb.create_sheet(COUNTRY_SUMMARY_ARK)
    for _ in range(7):
        cs.append([])
    cs.append(list(FORVENTEDE_SUMMARY_KOLONNER))
    cs.append(["Norway", 0, 1, 2.0, 1.8, 6.2, 10.0, 5.0, 1.7, 18.0, 24.7])

    disb = wb.create_sheet(DISBURSEMENT_ARK)
    for _ in range(9):
        disb.append([])
    disb.append(["", "", "", "January", "February"])
    disb.append(["", "Country", "EU member", "1", "2"])
    disb.append([])
    disb.append(["", "Norway", 0, 0.0, 0.3])

    path = tmp_path / "fixture.xlsx"
    wb.save(str(path))
    return path


def test_normalize_produserer_forventede_filer(tmp_path: Path) -> None:
    xlsx = _lag_fixture(tmp_path)
    out_dir = tmp_path / "processed"
    metadata = normalize(xlsx, out_dir=out_dir)

    summary_path = out_dir / "country_summary.csv"
    bilateral_path = out_dir / "bilateral_activities.csv"
    metadata_path = out_dir / "metadata.json"

    assert summary_path.exists()
    assert bilateral_path.exists()
    assert metadata_path.exists()

    with summary_path.open() as fh:
        rader = list(csv.DictReader(fh))
    assert len(rader) == 1
    assert rader[0]["land"] == "Norway"
    assert float(rader[0]["total_allocation"]) == pytest.approx(10.0)

    with bilateral_path.open() as fh:
        brader = list(csv.DictReader(fh))
    assert len(brader) == 2
    assert brader[0]["giver"] == "Norway"
    assert brader[0]["dato"] == "2024-01-01"
    assert float(brader[0]["verdi_eur_mrd"]) == pytest.approx(1.0)

    assert metadata["antall_land_summary"] == 1
    assert metadata["antall_bilateral_rader"] == 2
    assert metadata["antall_disbursement_rader"] == 1
    assert "sha256" in metadata

    with (out_dir / "financial_disbursements.csv").open() as fh:
        drader = list(csv.DictReader(fh))
    assert len(drader) == 1
    assert drader[0]["giver"] == "Norway"
    assert float(drader[0]["verdi_eur_mrd"]) == pytest.approx(0.3)


def _finn_ekte_fil() -> Path | None:
    repo_root = Path(__file__).resolve().parents[1]
    filer = sorted((repo_root / "data" / "raw" / "kiel").glob("*.xlsx"))
    return filer[-1] if filer else None


@pytest.mark.skipif(
    _finn_ekte_fil() is None, reason="ingen ekte Kiel-fil i data/raw/kiel/"
)
def test_normalize_norges_total_allocation(tmp_path: Path) -> None:
    fil = _finn_ekte_fil()
    assert fil is not None
    normalize(fil, out_dir=tmp_path)
    with (tmp_path / "country_summary.csv").open() as fh:
        for rad in csv.DictReader(fh):
            if rad["land"] == "Norway":
                assert float(rad["total_allocation"]) == pytest.approx(10.0, rel=0.05)
                return
    pytest.fail("Norge ikke funnet i country_summary.csv")
