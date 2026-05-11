"""Relative nøkkeltall: andel av BNP og per capita.

Excel-metoden (M7.2 og senere): BNP hentes fra Kiels `Country Summary (€)`
(`GDP (2021)` i EUR), folketall hentes fra Verdensbanken WDI via
`fetch-wdi.yml`. Begge er i EUR-baserte enheter, så ingen valutakonvertering
trengs.

Legacy WDI-BNP-modus (før M7.2) støttes fortsatt for å unngå breaking i
gjenværende kall - hvis `bnp_eur_mrd` ikke gis, konverteres WDI USD-BNP
til EUR via en omtrentlig rate.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from src.ingest.parse_kiel import LandSummary

EUR_TIL_USD_DEFAULT = 1.08  # Legacy: omtrentlig snittrate 2023-2024
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


def _les_wdi(sti: Path) -> dict:
    if not sti.exists():
        raise FileNotFoundError(
            f"Fant ikke {sti}. Kjør workflow fetch-wdi.yml manuelt for å "
            f"generere filen."
        )
    with sti.open() as fh:
        return json.load(fh)


def beregn_relative_noekkeltall(
    summary: list[LandSummary],
    wdi_sti: Path,
    bnp_eur_mrd: dict[str, float] | None = None,
    eur_til_usd: float = EUR_TIL_USD_DEFAULT,
) -> list[RelativeNoekkeltall]:
    """Beregn BNP-andel og per capita per land.

    `bnp_eur_mrd`: dict {land: BNP i € mrd} fra Kiels Country Summary.
    Hvis gitt, brukes Kiel-BNP (excel-metoden). Hvis None, faller funksjonen
    tilbake på WDI USD-BNP konvertert til EUR via `eur_til_usd` (legacy).
    Per S24-beslutning beholdes WDI folketall i begge moduser.
    """
    wdi = _les_wdi(wdi_sti)
    land_wdi = wdi.get("land", {})
    resultat: list[RelativeNoekkeltall] = []
    for r in summary:
        info = land_wdi.get(r.land)
        if info is None:
            # Land mangler i WDI - prøv likevel Kiel-BNP for andel.
            gdp_eur = bnp_eur_mrd.get(r.land) if bnp_eur_mrd else None
            andel = (
                r.total_allocation / gdp_eur * 100
                if gdp_eur and gdp_eur > 0
                else None
            )
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
        if bnp_eur_mrd is not None:
            gdp_eur = bnp_eur_mrd.get(r.land)
            andel = (
                r.total_allocation / gdp_eur * 100
                if gdp_eur and gdp_eur > 0
                else None
            )
            referanseaar_bnp = KIEL_BNP_AAR if gdp_eur else None
        else:
            # Legacy: WDI USD-BNP konvertert til EUR
            bnp_usd = info.get("bnp_usd")
            gdp_eur = bnp_usd / eur_til_usd / 1e9 if bnp_usd else None
            andel = (
                r.total_allocation / gdp_eur * 100
                if gdp_eur and gdp_eur > 0
                else None
            )
            referanseaar_bnp = info.get("bnp_aar")
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
                referanseaar_bnp=referanseaar_bnp,
                referanseaar_folketall=info.get("folketall_aar"),
            )
        )
    return resultat
