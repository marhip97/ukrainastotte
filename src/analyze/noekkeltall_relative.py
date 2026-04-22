"""Relative nøkkeltall: andel av BNP og per capita.

Leveres etter beslutning S6: Verdensbanken WDI, MRV-strategi
(ferskeste endelige tall per land).

`beregn_relative_noekkeltall` kombinerer Kiel-støtte (i € mrd) med
BNP (i USD) og folketall fra `data/reference/wdi.json`. BNP-andel
beregnes ved å konvertere støtte til USD via en fast rate (siden Kiel
rapporterer i EUR). Vi bruker 1.08 USD per EUR som rimelig årsgjennom-
snittrate 2023-2024; verdien er parameteriserbar for senere justering.

Per capita regnes i EUR per innbygger (direkte uten valutakonvertering).
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from src.ingest.parse_kiel import LandSummary

EUR_TIL_USD_DEFAULT = 1.08  # Omtrentlig snittrate 2023-2024


@dataclass(frozen=True)
class RelativeNoekkeltall:
    land: str
    # Verdier basert på total_allocation (Kiel-hovedinndeling).
    andel_bnp_pct: float | None  # prosent
    per_capita_eur: float | None  # EUR per innbygger
    # Støttende kontekst
    bnp_usd: float | None
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
    eur_til_usd: float = EUR_TIL_USD_DEFAULT,
) -> list[RelativeNoekkeltall]:
    wdi = _les_wdi(wdi_sti)
    land_wdi = wdi.get("land", {})
    resultat: list[RelativeNoekkeltall] = []
    for r in summary:
        info = land_wdi.get(r.land)
        if info is None:
            resultat.append(
                RelativeNoekkeltall(
                    land=r.land,
                    andel_bnp_pct=None,
                    per_capita_eur=None,
                    bnp_usd=None,
                    folketall=None,
                    referanseaar_bnp=None,
                    referanseaar_folketall=None,
                )
            )
            continue
        bnp_usd = info.get("bnp_usd")
        folketall = info.get("folketall")
        # Total allocation er i € mrd → konverter til USD absolutt.
        allocation_usd = r.total_allocation * 1_000_000_000 * eur_til_usd
        andel = (
            100.0 * allocation_usd / bnp_usd
            if bnp_usd and bnp_usd > 0
            else None
        )
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
                bnp_usd=bnp_usd,
                folketall=folketall,
                referanseaar_bnp=info.get("bnp_aar"),
                referanseaar_folketall=info.get("folketall_aar"),
            )
        )
    return resultat
