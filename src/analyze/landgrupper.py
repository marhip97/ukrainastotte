"""Forhåndsdefinerte land-grupperinger (S9: Norden, EU, G7, NATO, Alle).

Brukes til filter og sammenligninger i dashboardet (M6.3) og for
gruppe-aggregater i analysemodulen (M6.2).

Land-navnene følger Kiel sin stavemåte i `country_summary.csv`. Aliaser
("Czech Republic", "Turkey") inkluderes for robusthet hvis Kiel
endrer navngivning mellom releaser.

Gruppen "Alle" produseres dynamisk - den returnerer alltid hele
inputlista av land. NATO-lista er statisk per april 2026 (32 medlemmer);
hvis NATO utvides må listen oppdateres her.
"""

from __future__ import annotations

NORDEN: tuple[str, ...] = (
    "Norway",
    "Sweden",
    "Denmark",
    "Finland",
    "Iceland",
)

EU27: tuple[str, ...] = (
    "Austria",
    "Belgium",
    "Bulgaria",
    "Croatia",
    "Cyprus",
    "Czechia",
    "Czech Republic",
    "Denmark",
    "Estonia",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Hungary",
    "Ireland",
    "Italy",
    "Latvia",
    "Lithuania",
    "Luxembourg",
    "Malta",
    "Netherlands",
    "Poland",
    "Portugal",
    "Romania",
    "Slovakia",
    "Slovenia",
    "Spain",
    "Sweden",
)

G7: tuple[str, ...] = (
    "Canada",
    "France",
    "Germany",
    "Italy",
    "Japan",
    "United Kingdom",
    "United States",
)

# NATO per april 2026 (32 medlemmer). Aliaser inkluderes der Kiel kan
# bruke alternativ stavemåte (Turkey/Turkiye, Czechia/Czech Republic).
NATO: tuple[str, ...] = (
    "Albania",
    "Belgium",
    "Bulgaria",
    "Canada",
    "Croatia",
    "Czechia",
    "Czech Republic",
    "Denmark",
    "Estonia",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Hungary",
    "Iceland",
    "Italy",
    "Latvia",
    "Lithuania",
    "Luxembourg",
    "Montenegro",
    "Netherlands",
    "North Macedonia",
    "Norway",
    "Poland",
    "Portugal",
    "Romania",
    "Slovakia",
    "Slovenia",
    "Spain",
    "Sweden",
    "Turkey",
    "Turkiye",
    "United Kingdom",
    "United States",
)

LAND_GRUPPER: dict[str, tuple[str, ...]] = {
    "Norden": NORDEN,
    "EU": EU27,
    "G7": G7,
    "NATO": NATO,
    # "Alle" håndteres dynamisk i `land_i_gruppe`.
}


def land_i_gruppe(gruppe: str, alle_land: list[str]) -> list[str]:
    """Returner landene fra `gruppe` som faktisk finnes i `alle_land`.

    `alle_land` er ofte rader fra `country_summary.csv`. For "Alle"
    returneres en deduplisert kopi av `alle_land` i samme rekkefølge
    som input.
    """
    if gruppe == "Alle":
        sett = []
        sett_set: set[str] = set()
        for land in alle_land:
            if land not in sett_set:
                sett.append(land)
                sett_set.add(land)
        return sett
    if gruppe not in LAND_GRUPPER:
        raise KeyError(f"Ukjent land-gruppe: {gruppe!r}")
    forventet = LAND_GRUPPER[gruppe]
    alle_set = set(alle_land)
    return [land for land in forventet if land in alle_set]
