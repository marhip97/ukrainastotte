"""Konvertering EUR → NOK med historiske kurser fra Norges Bank.

Kursdata leses fra `data/reference/valutakurser.json` (produsert av
`src/ingest/fetch_valutakurser.py`). Konverteringsstrategi for en
gitt utbetalingsdato (S8: dynamisk historisk kurs):

1. Hvis akkurat den datoen finnes i kurslista, bruk den.
2. Hvis ikke (helg/helligdag), bruk forrige tilgjengelige bankdag.
3. Hvis dato er `None` (aktivitet uten dato), bruk siste tilgjengelige
   kurs i lista.

Funksjonen `eur_til_nok` returnerer både NOK-beløpet og en flagg som
sier om datoen var en eksakt kurs-match - nyttig for sporing av
hvor mange aktiviteter som havner i fallback-banen.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path


def last_kurser(sti: Path) -> dict[date, float]:
    """Les valutakurser.json og returner `date → float`-mapping."""
    payload = json.loads(sti.read_text(encoding="utf-8"))
    raa = payload.get("kurser") or {}
    ut: dict[date, float] = {}
    for dato_str, verdi in raa.items():
        try:
            d = date.fromisoformat(dato_str)
        except ValueError:
            continue
        try:
            ut[d] = float(verdi)
        except (TypeError, ValueError):
            continue
    return ut


def kurs_for_dato(kurser: dict[date, float], dato: date | None) -> float:
    """Returner kursen som skal brukes for en gitt dato.

    - Eksakt match: returner direkte.
    - Helg/helligdag: returner forrige bankdag som finnes i `kurser`.
    - `dato` er None: returner siste tilgjengelige kurs.

    Kaster `LookupError` hvis kurslista er tom eller datoen er før
    første tilgjengelige kurs.
    """
    if not kurser:
        raise LookupError("kursdata er tomt")
    if dato is None:
        siste = max(kurser)
        return kurser[siste]
    if dato in kurser:
        return kurser[dato]
    tilgjengelige = sorted(d for d in kurser if d <= dato)
    if not tilgjengelige:
        raise LookupError(
            f"ingen kurs tilgjengelig på eller før {dato.isoformat()}"
        )
    return kurser[tilgjengelige[-1]]


def eur_til_nok(
    belop_eur: float, dato: date | None, kurser: dict[date, float]
) -> tuple[float, bool]:
    """Konverter EUR til NOK med kursen for `dato`.

    Returnerer `(nok_belop, er_eksakt_dato_match)`. `er_eksakt_dato_match`
    er True bare når `dato` finnes som nøkkel i `kurser`. Brukt av
    `tidsserier.py` for å rapportere fallback-grad.
    """
    er_eksakt = dato is not None and dato in kurser
    kurs = kurs_for_dato(kurser, dato)
    return (belop_eur * kurs, er_eksakt)
