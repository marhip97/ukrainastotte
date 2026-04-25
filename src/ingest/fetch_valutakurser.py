"""Henter daglige EUR/NOK-kurser fra Norges Bank.

Norges Bank publiserer historiske valutakurser via et åpent SDMX-JSON-API.
Vi henter daglige observasjoner (frekvens B = "business daily") for
EUR/NOK fra 2022-01-01 til i dag. Helger og helligdager er allerede
utelatt fra kilden - vi tar dem ikke inn som tomme datoer.

Output: `data/reference/valutakurser.json` med struktur:

```json
{
  "kilde": "Norges Bank",
  "valutapar": "EUR/NOK",
  "hentet_dato": "YYYY-MM-DD",
  "kurser": {
    "2022-01-03": 9.9925,
    "2022-01-04": 9.9870,
    ...
  }
}
```

Brukes av `src/analyze/valutakonvertering.py` for å konvertere
EUR-beløp til NOK med historisk kurs på utbetalingsdatoen
(forrige bankdag som fallback hvis akkurat datoen mangler).
"""

from __future__ import annotations

import json
import sys
import urllib.request
from datetime import date
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_PATH = REPO_ROOT / "data" / "reference" / "valutakurser.json"

KILDE = "Norges Bank"
VALUTAPAR = "EUR/NOK"
START_PERIODE = "2022-01-01"
API_URL_MAL = (
    "https://data.norges-bank.no/api/data/EXR/B.EUR.NOK.SP"
    "?startPeriod={start}&format=sdmx-json"
)


def _hent_sdmx_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "ukrainastotte/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def parse_sdmx(payload: dict) -> dict[str, float]:
    """Parse SDMX-JSON-respons fra Norges Bank til dato → kurs.

    SDMX-JSON 2.0-strukturen fra Norges Bank ser slik ut:

    - `data.dataSets[0].series["0:0:0:0"].observations` - dict der nøkkelen
      er en streng-indeks (0, 1, 2, ...) som peker inn i tidsdimensjonen.
    - `data.structure.dimensions.observation` - liste med dimensjoner;
      `TIME_PERIOD` har `values` som er en liste av `{"id": "YYYY-MM-DD"}`.

    Hver observasjonsverdi er en liste; første element er selve kursen.
    Norges Bank-arket dekker noen ganger kvotering med UNIT_MULT
    (skala). Vi multipliserer ikke; for B.EUR.NOK.SP er enheten 1.
    """
    data = payload.get("data", payload)
    dataset_liste = data.get("dataSets") or []
    if not dataset_liste:
        raise ValueError("SDMX-respons mangler dataSets")
    serier = dataset_liste[0].get("series") or {}
    if not serier:
        raise ValueError("SDMX-respons mangler series")
    forste_serie = next(iter(serier.values()))
    observasjoner = forste_serie.get("observations") or {}

    struktur = data.get("structure") or {}
    obs_dims = (struktur.get("dimensions") or {}).get("observation") or []
    tids_dim = next((d for d in obs_dims if d.get("id") == "TIME_PERIOD"), None)
    if tids_dim is None:
        raise ValueError("SDMX-respons mangler TIME_PERIOD-dimensjon")
    tids_verdier = [v.get("id") for v in (tids_dim.get("values") or [])]

    kurser: dict[str, float] = {}
    for nokkel, verdi in observasjoner.items():
        try:
            i = int(nokkel)
        except (TypeError, ValueError):
            continue
        if i < 0 or i >= len(tids_verdier):
            continue
        if not verdi or verdi[0] is None:
            continue
        dato_str = tids_verdier[i]
        try:
            kurs = float(verdi[0])
        except (TypeError, ValueError):
            continue
        kurser[dato_str] = kurs
    return kurser


def hent_kurser(start: str = START_PERIODE) -> dict[str, float]:
    url = API_URL_MAL.format(start=start)
    payload = _hent_sdmx_json(url)
    return parse_sdmx(payload)


def main(argv: list[str]) -> int:
    kurser = hent_kurser()
    if not kurser:
        print("FEIL: ingen kurser returnert fra Norges Bank.", file=sys.stderr)
        return 2
    output = {
        "kilde": KILDE,
        "valutapar": VALUTAPAR,
        "hentet_dato": date.today().isoformat(),
        "kurser": dict(sorted(kurser.items())),
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(
        json.dumps(output, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(
        f"Skrev {OUT_PATH.relative_to(REPO_ROOT)}: {len(kurser)} kurser "
        f"({min(kurser)} - {max(kurser)})."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
