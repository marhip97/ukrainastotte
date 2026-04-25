"""Månedlig aggregering av bilateral-aktiviteter til tidsserier.

Leser `Aktivitet`-objekter fra `parse_kiel.parse_bilateral` og summerer
verdier per (land, år, måned, kategori, mål). Aktiviteter uten dato
hopper over i tidsserien (men telles fortsatt som totaler i
country_summary).

NOK-konvertering bruker historisk EUR/NOK-kurs på første dag i måneden
hvis aktiviteten har dato (med forrige bankdag som fallback). Aktiviteter
uten dato hopper allerede over her, så `kurser` brukes per aktivitet.

Output skrives av `normalize.skriv_tidsserier_maanedlig` til
`data/processed/tidsserier_maanedlig.csv`.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from src.analyze.valutakonvertering import eur_til_nok
from src.ingest.parse_kiel import Aktivitet


@dataclass(frozen=True)
class MaanedsAggregat:
    """Sum av aktiviteter for én (land, år, måned, kategori, mål)-kombinasjon."""

    land: str
    aar: int
    maaned: int
    kategori: str
    maal: str
    sum_eur: float
    sum_nok: float


def aggreger_per_maaned(
    aktiviteter: list[Aktivitet], kurser: dict[date, float]
) -> list[MaanedsAggregat]:
    """Aggreger aktiviteter til månedssummer per land/kategori/mål.

    Aktiviteter uten dato (`Aktivitet.dato is None`) hoppes over -
    de tilhører ingen måned i tidsserien. NOK-konvertering bruker
    kursen på selve aktivitetsdatoen (med fallback til forrige
    bankdag via `eur_til_nok`).
    """
    bucket: dict[tuple[str, int, int, str, str], list[float]] = {}
    for a in aktiviteter:
        if a.dato is None:
            continue
        nokkel = (a.giver, a.dato.year, a.dato.month, a.kategori, a.maal)
        nok, _ = eur_til_nok(a.verdi_eur, a.dato, kurser)
        if nokkel not in bucket:
            bucket[nokkel] = [0.0, 0.0]
        bucket[nokkel][0] += a.verdi_eur
        bucket[nokkel][1] += nok

    resultat: list[MaanedsAggregat] = []
    for (giver, aar, maaned, kategori, maal), (sum_eur, sum_nok) in sorted(
        bucket.items(), key=lambda kv: kv[0]
    ):
        resultat.append(
            MaanedsAggregat(
                land=giver,
                aar=aar,
                maaned=maaned,
                kategori=kategori,
                maal=maal,
                sum_eur=sum_eur,
                sum_nok=sum_nok,
            )
        )
    return resultat
