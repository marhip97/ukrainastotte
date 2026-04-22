"""Enhetstester for Kiel-parser.

Bruker en generert XLSX-fixture (ikke ekte Kiel-data) som matcher den
antatte kontrakten fra kartleggingsnotatet. Når ekte fil er tilgjengelig
skal disse testene utvides med gylne verdier mot publiserte Kiel-figurer.
"""

from __future__ import annotations

from pathlib import Path

import pytest
from openpyxl import Workbook

from src.ingest.parse_kiel import (
    FORVENTET_BILATERAL_KOLONNER,
    KolonneKontraktFeil,
    parse_bilateral,
)


def _lag_fixture(tmp_path: Path, headers: tuple[str, ...], rows: list[tuple]) -> Path:
    wb = Workbook()
    ws = wb.active
    ws.title = "Bilateral"
    ws.append(list(headers))
    for row in rows:
        ws.append(list(row))
    path = tmp_path / "kiel_fixture.xlsx"
    wb.save(str(path))
    return path


def test_parser_leser_radene(tmp_path: Path) -> None:
    path = _lag_fixture(
        tmp_path,
        headers=FORVENTET_BILATERAL_KOLONNER,
        rows=[
            ("Norway", 1.2, 0.8, 0.3),
            ("Germany", 10.5, 5.0, 2.1),
            (None, 0, 0, 0),  # tom rad skal filtreres bort
        ],
    )
    rader = parse_bilateral(path)
    assert [r.giver for r in rader] == ["Norway", "Germany"]
    norge = rader[0]
    assert norge.militaer == pytest.approx(1.2)
    assert norge.total == pytest.approx(2.3)


def test_parser_kaster_ved_kolonneavvik(tmp_path: Path) -> None:
    path = _lag_fixture(
        tmp_path,
        headers=("Country", "Military", "Finance"),  # "Financial" mangler
        rows=[("Norway", 1.0, 0.5)],
    )
    with pytest.raises(KolonneKontraktFeil):
        parse_bilateral(path)
