"""Årlig aggregering fra bilateral-aktiviteter (excel-metoden).

For dashboardets enkeltårs-visning (M7.4) trenger vi støttetall per land
og kalenderår. Excel-metoden filtrerer på `month_exists_dummy = 1` og
mapper `month` til kalenderår der Jan 2022 = month 1.

Outputtet brukes til å bygge `country_summary_aar.csv` i `normalize.py`.
"""

from __future__ import annotations

from dataclasses import dataclass

from src.ingest.parse_kiel import Aktivitet

# Måned 1 = Januar 2022 i Kiel-kodingen. Verifisert empirisk i M7.0.
MAANED_FORSTE_AAR = 2022


def aar_for_maaned(maaned_nr: int) -> int:
    """Returner kalenderåret som tilsvarer en Kiel-måned (1-basert).

    `maaned_nr=1` → 2022. `maaned_nr=37` → 2025. `maaned_nr=49` → 2026.
    """
    return MAANED_FORSTE_AAR + (maaned_nr - 1) // 12


@dataclass(frozen=True)
class AarligLandTotal:
    """Land/år-aggregat fra redistr-verdier. Mengder i € mrd."""

    land: str
    aar: int
    financial_allocation: float
    humanitarian_allocation: float
    military_allocation: float
    total_allocation: float
    financial_commitment: float
    humanitarian_commitment: float
    military_commitment: float
    total_commitment: float
    per_capita_eur: float | None
    andel_bnp_pct: float | None


def aggreger_per_aar(
    aktiviteter: list[Aktivitet],
    aar_liste: list[int],
    bnp_eur_mrd: dict[str, float],
    folketall: dict[str, int],
) -> list[AarligLandTotal]:
    """Aggreger per land/år for gitte år.

    Filter: `maaned_finnes=True` og `maaned_nr` faller innenfor året.
    Allocation: bruker `verdi_eur_redistr`.
    Commitment: bruker `verdi_eur_activity` (samme logikk som M7.0).
    """
    buckets: dict[tuple[str, int], dict[str, float]] = {}
    aar_set = set(aar_liste)
    for a in aktiviteter:
        if not a.maaned_finnes or a.maaned_nr is None:
            continue
        aar = aar_for_maaned(a.maaned_nr)
        if aar not in aar_set:
            continue
        bucket = buckets.setdefault(
            (a.giver, aar),
            {
                "financial_allocation": 0.0,
                "humanitarian_allocation": 0.0,
                "military_allocation": 0.0,
                "total_allocation": 0.0,
                "financial_commitment": 0.0,
                "humanitarian_commitment": 0.0,
                "military_commitment": 0.0,
                "total_commitment": 0.0,
            },
        )
        v_alloc = a.verdi_eur_redistr / 1e9
        v_comm = a.verdi_eur_activity / 1e9
        if a.maal == "Allocation":
            bucket["total_allocation"] += v_alloc
            if a.kategori == "Financial":
                bucket["financial_allocation"] += v_alloc
            elif a.kategori == "Humanitarian":
                bucket["humanitarian_allocation"] += v_alloc
            elif a.kategori == "Military":
                bucket["military_allocation"] += v_alloc
        # Commitment teller fra alle rader (allocation ⊆ commitment).
        bucket["total_commitment"] += v_comm
        if a.kategori == "Financial":
            bucket["financial_commitment"] += v_comm
        elif a.kategori == "Humanitarian":
            bucket["humanitarian_commitment"] += v_comm
        elif a.kategori == "Military":
            bucket["military_commitment"] += v_comm

    resultat: list[AarligLandTotal] = []
    for (land, aar), b in sorted(buckets.items()):
        pop = folketall.get(land)
        gdp = bnp_eur_mrd.get(land)
        per_capita = (
            b["total_allocation"] * 1e9 / pop if pop and pop > 0 else None
        )
        andel = (
            b["total_allocation"] / gdp * 100 if gdp and gdp > 0 else None
        )
        resultat.append(
            AarligLandTotal(
                land=land,
                aar=aar,
                financial_allocation=b["financial_allocation"],
                humanitarian_allocation=b["humanitarian_allocation"],
                military_allocation=b["military_allocation"],
                total_allocation=b["total_allocation"],
                financial_commitment=b["financial_commitment"],
                humanitarian_commitment=b["humanitarian_commitment"],
                military_commitment=b["military_commitment"],
                total_commitment=b["total_commitment"],
                per_capita_eur=per_capita,
                andel_bnp_pct=andel,
            )
        )
    return resultat
