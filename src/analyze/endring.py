"""Beregning av endring i støtte mellom to Kiel-releaser.

Dekker nøkkeltall 6 i prosjektplanens delmål 3 ("endring siste kvartal").
Funksjonen er rein - tar to lister `LandSummary` og returnerer endring
per land. Kaller man den med releaser fra ulike kvartaler, får man
kvartalsendringen.

I praksis bygger historikken seg opp over tid i `data/raw/kiel/` etter
hvert som `fetch-kiel.yml` kjører ukentlig. Ved første kjøring finnes
bare én release - da har `beregn_endring` ingen å sammenligne mot, og
callers bør håndtere dette.
"""

from __future__ import annotations

from dataclasses import dataclass

from src.ingest.parse_kiel import LandSummary


@dataclass(frozen=True)
class LandEndring:
    """Endring i totalbeløp og fordeling for ett giverland (€ mrd)."""

    land: str
    delta_total_allocation: float
    delta_total_commitment: float
    delta_military_allocation: float
    delta_financial_allocation: float
    delta_humanitarian_allocation: float


def beregn_endring(
    ny: list[LandSummary], gammel: list[LandSummary]
) -> list[LandEndring]:
    """Returner endring (ny minus gammel) for hvert land i `ny`.

    Land som finnes i `ny` men ikke i `gammel` (nye givere) får
    endring lik deres nåverdier. Land som finnes i `gammel` men ikke
    i `ny` (fjernet) utelates.
    """
    gammel_lookup = {r.land: r for r in gammel}
    resultat: list[LandEndring] = []
    for n in ny:
        g = gammel_lookup.get(n.land)
        if g is None:
            resultat.append(
                LandEndring(
                    land=n.land,
                    delta_total_allocation=n.total_allocation,
                    delta_total_commitment=n.total_commitment,
                    delta_military_allocation=n.military_allocation,
                    delta_financial_allocation=n.financial_allocation,
                    delta_humanitarian_allocation=n.humanitarian_allocation,
                )
            )
            continue
        resultat.append(
            LandEndring(
                land=n.land,
                delta_total_allocation=n.total_allocation - g.total_allocation,
                delta_total_commitment=n.total_commitment - g.total_commitment,
                delta_military_allocation=n.military_allocation
                - g.military_allocation,
                delta_financial_allocation=n.financial_allocation
                - g.financial_allocation,
                delta_humanitarian_allocation=n.humanitarian_allocation
                - g.humanitarian_allocation,
            )
        )
    return resultat
