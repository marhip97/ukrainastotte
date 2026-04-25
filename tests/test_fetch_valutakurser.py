"""Tester for src/ingest/fetch_valutakurser.py.

Tester parsing av SDMX-JSON-respons mot en lokal fixture - kaller
ikke det ekte Norges Bank-API-et.
"""

from __future__ import annotations

import pytest

from src.ingest.fetch_valutakurser import parse_sdmx


def _fixture_sdmx() -> dict:
    """Minimal SDMX-JSON-respons som speiler Norges Bank-formatet."""
    return {
        "data": {
            "dataSets": [
                {
                    "series": {
                        "0:0:0:0": {
                            "observations": {
                                "0": [9.9925],
                                "1": [9.9870],
                                "2": [10.0150],
                            }
                        }
                    }
                }
            ],
            "structure": {
                "dimensions": {
                    "observation": [
                        {
                            "id": "TIME_PERIOD",
                            "values": [
                                {"id": "2022-01-03"},
                                {"id": "2022-01-04"},
                                {"id": "2022-01-05"},
                            ],
                        }
                    ]
                }
            },
        }
    }


def test_parse_sdmx_returnerer_dato_til_kurs() -> None:
    kurser = parse_sdmx(_fixture_sdmx())
    assert kurser == {
        "2022-01-03": 9.9925,
        "2022-01-04": 9.9870,
        "2022-01-05": 10.0150,
    }


def test_parse_sdmx_hopper_over_manglende_observasjoner() -> None:
    payload = _fixture_sdmx()
    payload["data"]["dataSets"][0]["series"]["0:0:0:0"]["observations"]["1"] = [None]
    kurser = parse_sdmx(payload)
    assert "2022-01-04" not in kurser
    assert kurser["2022-01-03"] == 9.9925
    assert kurser["2022-01-05"] == 10.0150


def test_parse_sdmx_kaster_paa_tom_respons() -> None:
    with pytest.raises(ValueError):
        parse_sdmx({"data": {"dataSets": []}})


def test_parse_sdmx_kaster_uten_time_period() -> None:
    payload = _fixture_sdmx()
    payload["data"]["structure"]["dimensions"]["observation"] = []
    with pytest.raises(ValueError):
        parse_sdmx(payload)
