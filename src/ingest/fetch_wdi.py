"""Henter BNP og folketall fra Verdensbanken WDI for Kiels giverland.

Bruker "Most Recent Value"-strategien (`MRV=1`) for å få de ferskeste
endelige tallene per land. Typisk 2024-tall for utviklede land, 2023
eller eldre for noen.

Output: `data/reference/wdi.json` med struktur:

```json
{
  "hentet_dato": "2026-04-22",
  "indikatorer": {
    "NY.GDP.MKTP.CD": "BNP i løpende USD",
    "SP.POP.TOTL": "Total folketall"
  },
  "land": {
    "Norway": {
      "iso3": "NOR",
      "bnp_usd": 485000000000,
      "bnp_aar": 2024,
      "folketall": 5550000,
      "folketall_aar": 2024
    },
    ...
  },
  "utelatt": ["EU (Commission and Council)", "European Investment Bank", "Taiwan"]
}
```

Brukes av `src/analyze/noekkeltall_relative.py` for å beregne
BNP-andel og per capita.
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_PATH = REPO_ROOT / "data" / "reference" / "wdi.json"

# Kiels 42 giverland + aggregater → ISO-3-koder.
# EU-institusjoner og Taiwan er utelatt siden WDI ikke dekker dem
# eller de ikke er land (se UTELATT).
KIEL_TIL_ISO3: dict[str, str] = {
    "Australia": "AUS", "Austria": "AUT", "Belgium": "BEL", "Bulgaria": "BGR",
    "Canada": "CAN", "China": "CHN", "Croatia": "HRV", "Cyprus": "CYP",
    "Czechia": "CZE", "Czech Republic": "CZE",
    "Denmark": "DNK", "Estonia": "EST", "Finland": "FIN", "France": "FRA",
    "Germany": "DEU", "Greece": "GRC", "Hungary": "HUN", "Iceland": "ISL",
    "India": "IND", "Ireland": "IRL", "Italy": "ITA", "Japan": "JPN",
    "Latvia": "LVA", "Lithuania": "LTU", "Luxembourg": "LUX", "Malta": "MLT",
    "Netherlands": "NLD", "New Zealand": "NZL", "Norway": "NOR", "Poland": "POL",
    "Portugal": "PRT", "Romania": "ROU", "Slovakia": "SVK", "Slovenia": "SVN",
    "South Korea": "KOR", "Korea, Rep.": "KOR",
    "Spain": "ESP", "Sweden": "SWE", "Switzerland": "CHE",
    "Turkiye": "TUR", "Turkey": "TUR",
    "United Kingdom": "GBR", "United States": "USA",
}

# Rader i country_summary som IKKE skal hentes BNP/folketall for.
UTELATT = {
    "EU (Commission and Council)",
    "EU Institutions",
    "European Investment Bank",
    "Taiwan",  # Ikke i WDI
}

INDIKATORER = {
    "NY.GDP.MKTP.CD": "BNP i løpende USD",
    "SP.POP.TOTL": "Total folketall",
}


def _hent_indikator(iso3_liste: list[str], indikator: str) -> list[dict]:
    """Henter verdier for én indikator fra WDI for alle iso3-koder."""
    koder = ";".join(iso3_liste)
    url = (
        f"https://api.worldbank.org/v2/country/{koder}"
        f"/indicator/{indikator}?format=json&MRV=1&per_page=200"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "ukrainastotte/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    if not isinstance(data, list) or len(data) < 2:
        raise RuntimeError(f"Uventet WDI-respons for {indikator}: {data}")
    return data[1] or []


def hent_land(kiel_navn: list[str]) -> dict:
    iso3_liste = sorted({KIEL_TIL_ISO3[n] for n in kiel_navn if n in KIEL_TIL_ISO3})
    iso3_til_kiel = {}
    for n in kiel_navn:
        kode = KIEL_TIL_ISO3.get(n)
        if kode:
            iso3_til_kiel.setdefault(kode, n)

    gdp_rader = _hent_indikator(iso3_liste, "NY.GDP.MKTP.CD")
    pop_rader = _hent_indikator(iso3_liste, "SP.POP.TOTL")

    def index_paa_iso3(rader: list[dict]) -> dict[str, dict]:
        ut = {}
        for r in rader:
            if r.get("value") is None:
                continue
            kode = (r.get("countryiso3code") or r.get("country", {}).get("id") or "")
            if kode and kode not in ut:
                ut[kode] = r
        return ut

    gdp_idx = index_paa_iso3(gdp_rader)
    pop_idx = index_paa_iso3(pop_rader)

    ut = {}
    for kiel_land in kiel_navn:
        kode = KIEL_TIL_ISO3.get(kiel_land)
        if kode is None:
            continue
        if kode not in ut and (gdp_idx.get(kode) or pop_idx.get(kode)):
            g = gdp_idx.get(kode, {})
            p = pop_idx.get(kode, {})
            ut[kiel_land] = {
                "iso3": kode,
                "bnp_usd": float(g["value"]) if g.get("value") is not None else None,
                "bnp_aar": int(g["date"]) if g.get("date") else None,
                "folketall": int(p["value"]) if p.get("value") is not None else None,
                "folketall_aar": int(p["date"]) if p.get("date") else None,
            }
    return ut


def _les_kiel_land() -> list[str]:
    sti = REPO_ROOT / "data" / "processed" / "country_summary.csv"
    navn = []
    with sti.open() as fh:
        header = fh.readline().strip().split(",")
        land_idx = header.index("land")
        for linje in fh:
            verdier = linje.rstrip("\n").split(",")
            if verdier[land_idx]:
                navn.append(verdier[land_idx])
    return navn


def main(argv: list[str]) -> int:
    kiel_land = _les_kiel_land()
    manglende = [n for n in kiel_land if n not in KIEL_TIL_ISO3 and n not in UTELATT]
    if manglende:
        print(f"ADVARSEL: mangler mapping for {manglende}", file=sys.stderr)
    land_data = hent_land(kiel_land)
    utelatt = [n for n in kiel_land if n in UTELATT]
    output = {
        "hentet_dato": date.today().isoformat(),
        "indikatorer": INDIKATORER,
        "land": land_data,
        "utelatt": utelatt,
        "manglende_mapping": manglende,
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n")
    print(f"Skrev {OUT_PATH.relative_to(REPO_ROOT)}: {len(land_data)} land.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
