"""Tester for src/analyze/valutakonvertering.py."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

import pytest

from src.analyze.valutakonvertering import (
    eur_til_nok,
    kurs_for_dato,
    last_kurser,
)


def _testkurser() -> dict[date, float]:
    return {
        date(2024, 1, 2): 11.10,
        date(2024, 1, 3): 11.20,
        date(2024, 1, 4): 11.15,
        date(2024, 1, 5): 11.30,
        # 6.-7. januar 2024 var lørdag/søndag - hopper over.
        date(2024, 1, 8): 11.25,
    }


def test_last_kurser_leser_json(tmp_path: Path) -> None:
    sti = tmp_path / "valutakurser.json"
    sti.write_text(
        json.dumps(
            {
                "kilde": "Norges Bank",
                "valutapar": "EUR/NOK",
                "hentet_dato": "2024-01-08",
                "kurser": {
                    "2024-01-02": 11.10,
                    "2024-01-03": 11.20,
                },
            }
        )
    )
    kurser = last_kurser(sti)
    assert kurser == {
        date(2024, 1, 2): 11.10,
        date(2024, 1, 3): 11.20,
    }


def test_kurs_for_dato_eksakt_match() -> None:
    kurser = _testkurser()
    assert kurs_for_dato(kurser, date(2024, 1, 3)) == 11.20


def test_kurs_for_dato_helg_bruker_forrige_bankdag() -> None:
    """Lørdag 2024-01-06 skal falle tilbake til fredag 2024-01-05."""
    kurser = _testkurser()
    assert kurs_for_dato(kurser, date(2024, 1, 6)) == 11.30
    assert kurs_for_dato(kurser, date(2024, 1, 7)) == 11.30


def test_kurs_for_dato_none_bruker_siste() -> None:
    kurser = _testkurser()
    assert kurs_for_dato(kurser, None) == 11.25


def test_kurs_for_dato_for_tidlig_kaster() -> None:
    kurser = _testkurser()
    with pytest.raises(LookupError):
        kurs_for_dato(kurser, date(2023, 12, 31))


def test_kurs_for_dato_tomt_kaster() -> None:
    with pytest.raises(LookupError):
        kurs_for_dato({}, date(2024, 1, 2))


def test_eur_til_nok_eksakt_match() -> None:
    kurser = _testkurser()
    nok, er_eksakt = eur_til_nok(1_000_000, date(2024, 1, 3), kurser)
    assert nok == pytest.approx(11_200_000)
    assert er_eksakt is True


def test_eur_til_nok_helg_fallback_markeres_ikke_eksakt() -> None:
    kurser = _testkurser()
    nok, er_eksakt = eur_til_nok(1_000_000, date(2024, 1, 6), kurser)
    assert nok == pytest.approx(11_300_000)
    assert er_eksakt is False


def test_eur_til_nok_uten_dato_bruker_siste() -> None:
    kurser = _testkurser()
    nok, er_eksakt = eur_til_nok(1_000_000, None, kurser)
    assert nok == pytest.approx(11_250_000)
    assert er_eksakt is False
