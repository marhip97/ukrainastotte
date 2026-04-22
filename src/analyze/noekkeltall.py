"""Beregning av Norges standardiserte nøkkeltall fra Kiel-data.

Første leveranse i M3. Dekker tre av de seks nøkkeltallene fra
prosjektplanens delmål 3:

1. **Absolutt støtte** - total allocation/commitment i € mrd. Kommer
   direkte fra `LandSummary`.
4. **Fordeling** - andel militær/finansiell/humanitær av total
   allocation (og commitment), i prosent.
5. **Rangering** - posisjon blant giverland etter valgt mål.

Nøkkeltall 2 (andel BNP), 3 (per capita) og 6 (endring siste kvartal)
krever eksterne kilder eller historiske releaser og dekkes i senere
PR-er.

Alle funksjoner tar `list[LandSummary]` fra
`src.ingest.parse_kiel.parse_country_summary` og returnerer rene
datastrukturer uten bivirkninger.
"""

from __future__ import annotations

from dataclasses import dataclass

from src.ingest.parse_kiel import LandSummary


@dataclass(frozen=True)
class Fordeling:
    """Prosentvis fordeling mellom tre støttekategorier."""

    militaer_pct: float
    finansiell_pct: float
    humanitaer_pct: float


@dataclass(frozen=True)
class LandNoekkeltall:
    """Nøkkeltall for ett giverland. Verdier i € mrd; prosent i 0-100."""

    land: str
    total_allocation_mrd: float
    total_commitment_mrd: float
    fordeling_allocation: Fordeling
    fordeling_commitment: Fordeling
    rangering_allocation: int  # 1 = høyest
    rangering_commitment: int


def _fordeling(mil: float, fin: float, hum: float) -> Fordeling:
    total = mil + fin + hum
    if total <= 0:
        return Fordeling(0.0, 0.0, 0.0)
    return Fordeling(
        militaer_pct=100 * mil / total,
        finansiell_pct=100 * fin / total,
        humanitaer_pct=100 * hum / total,
    )


def beregn_noekkeltall(rader: list[LandSummary]) -> list[LandNoekkeltall]:
    """Returner nøkkeltall for alle land i rekkefølge fra input."""
    # Rangering: sorter på allocation/commitment og lag lookup land→rang.
    sortert_alloc = sorted(
        rader, key=lambda r: r.total_allocation, reverse=True
    )
    sortert_comm = sorted(
        rader, key=lambda r: r.total_commitment, reverse=True
    )
    rang_alloc = {r.land: i + 1 for i, r in enumerate(sortert_alloc)}
    rang_comm = {r.land: i + 1 for i, r in enumerate(sortert_comm)}
    resultat: list[LandNoekkeltall] = []
    for r in rader:
        resultat.append(
            LandNoekkeltall(
                land=r.land,
                total_allocation_mrd=r.total_allocation,
                total_commitment_mrd=r.total_commitment,
                fordeling_allocation=_fordeling(
                    r.military_allocation,
                    r.financial_allocation,
                    r.humanitarian_allocation,
                ),
                fordeling_commitment=_fordeling(
                    r.military_commitment,
                    r.financial_commitment,
                    r.humanitarian_commitment,
                ),
                rangering_allocation=rang_alloc[r.land],
                rangering_commitment=rang_comm[r.land],
            )
        )
    return resultat


def finn_land(noekkeltall: list[LandNoekkeltall], land: str) -> LandNoekkeltall:
    for nt in noekkeltall:
        if nt.land == land:
            return nt
    raise KeyError(f"Land '{land}' ikke funnet blant {len(noekkeltall)} rader")
