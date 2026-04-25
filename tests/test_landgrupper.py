"""Tester for src/analyze/landgrupper.py."""

from __future__ import annotations

import pytest

from src.analyze.landgrupper import LAND_GRUPPER, land_i_gruppe


def test_norden_filtrerer_til_eksisterende_land() -> None:
    alle = ["Norway", "Sweden", "Germany", "Denmark", "Finland", "Iceland"]
    assert land_i_gruppe("Norden", alle) == [
        "Norway", "Sweden", "Denmark", "Finland", "Iceland"
    ]


def test_norden_uten_alle_kun_de_som_finnes() -> None:
    alle = ["Norway", "Sweden"]
    assert land_i_gruppe("Norden", alle) == ["Norway", "Sweden"]


def test_g7_returnerer_kun_eksisterende() -> None:
    alle = ["United States", "Germany", "France", "Russia"]
    assert land_i_gruppe("G7", alle) == ["France", "Germany", "United States"]


def test_eu_inkluderer_27_medlemmer() -> None:
    alle = list(LAND_GRUPPER["EU"])
    resultat = land_i_gruppe("EU", alle)
    assert "Germany" in resultat
    assert "France" in resultat
    assert "Sweden" in resultat
    assert "Norway" not in resultat


def test_nato_inkluderer_kjente_medlemmer() -> None:
    alle = ["Norway", "Turkey", "Sweden", "Finland", "Russia"]
    resultat = land_i_gruppe("NATO", alle)
    assert "Norway" in resultat
    assert "Turkey" in resultat
    assert "Sweden" in resultat
    assert "Finland" in resultat
    assert "Russia" not in resultat


def test_alle_returnerer_dynamisk_inputliste() -> None:
    alle = ["Norway", "Bonus-land", "Sweden"]
    assert land_i_gruppe("Alle", alle) == ["Norway", "Bonus-land", "Sweden"]


def test_alle_dedupliserer() -> None:
    alle = ["Norway", "Sweden", "Norway"]
    assert land_i_gruppe("Alle", alle) == ["Norway", "Sweden"]


def test_ukjent_gruppe_kaster() -> None:
    with pytest.raises(KeyError):
        land_i_gruppe("Vesten", ["Norway"])
