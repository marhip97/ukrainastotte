"""Relative nøkkeltall: andel av BNP og per capita.

Excel-metoden (M7.2 og senere): BNP hentes fra Kiels `Country Summary (€)`
(`GDP (2021)` i EUR), folketall hentes fra Verdensbanken WDI via
`fetch-wdi.yml`. Begge er i EUR-baserte enheter, så ingen valutakonvertering
trengs.

Etter M7.3-opprydding: WDI hentes kun for folketall (`SP.POP.TOTL`),
lagres i `data/reference/folketall.json`. Legacy WDI USD-BNP-modus
er fjernet.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from src.ingest.parse_kiel import LandSummary

KIEL_BNP_AAR = 2021  # Kiel bruker 2021 som referanseår, jf. M7-plan F6


@dataclass(frozen=True)
class RelativeNoekkeltall:
    land: str
    # Verdier basert på total_allocation (Kiel-hovedinndeling).
    andel_bnp_pct: float | None  # prosent
    per_capita_eur: float | None  # EUR per innbygger
    # Støttende kontekst
    bnp_eur_mrd: float | None
    folketall: int | None
    referanseaar_bnp: int | None
    referanseaar_folketall: int | None


def _les_folketall_data(sti: Path) -> dict:
    """Les folketall-fil. Støtter både ny `folketall.json` og legacy `wdi.json`."""
    if not sti.exists():
        raise FileNotFoundError(
            f"Fant ikke {sti}. Kjør workflow fetch-wdi.yml manuelt for å "
            f"generere filen."
        )
    with sti.open() as fh:
        return json.load(fh)


def beregn_relative_noekkeltall(
    summary: list[LandSummary],
    folketall_sti: Path,
    bnp_eur_mrd: dict[str, float],
) -> list[RelativeNoekkeltall]:
    """Beregn BNP-andel og per capita per land.

    `bnp_eur_mrd`: dict {land: BNP i € mrd} fra Kiels Country Summary
    (`GDP (2021)`-kolonnen i EUR). Obligatorisk - excel-metoden er
    autoritativ siden M7.2.
    `folketall_sti`: peker på `folketall.json` (eller legacy `wdi.json`).
    """
    data = _les_folketall_data(folketall_sti)
    land_data = data.get("land", {})
    resultat: list[RelativeNoekkeltall] = []
    for r in summary:
        gdp_eur = bnp_eur_mrd.get(r.land)
        andel = (
            r.total_allocation / gdp_eur * 100
            if gdp_eur and gdp_eur > 0
            else None
        )
        info = land_data.get(r.land)
        if info is None:
            resultat.append(
                RelativeNoekkeltall(
                    land=r.land,
                    andel_bnp_pct=andel,
                    per_capita_eur=None,
                    bnp_eur_mrd=gdp_eur,
                    folketall=None,
                    referanseaar_bnp=KIEL_BNP_AAR if gdp_eur else None,
                    referanseaar_folketall=None,
                )
            )
            continue
        folketall = info.get("folketall")
        per_capita = (
            r.total_allocation * 1_000_000_000 / folketall
            if folketall and folketall > 0
            else None
        )
        resultat.append(
            RelativeNoekkeltall(
                land=r.land,
                andel_bnp_pct=andel,
                per_capita_eur=per_capita,
                bnp_eur_mrd=gdp_eur,
                folketall=folketall,
                referanseaar_bnp=KIEL_BNP_AAR if gdp_eur else None,
                referanseaar_folketall=info.get("folketall_aar"),
            )
        )
    return resultat
