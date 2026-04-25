"""Automatisk generering av endringstekst på pedagogisk norsk.

Tar to releaser av Kiel-data og produserer en kort tekst (2-4 setninger)
som forklarer endringen i støtte for et utvalgt land siden forrige
release. S12-beslutning: pedagogisk klarspråk, ikke fagsjargong.

Brukes av `normalize.py` til å skrive `data/processed/endringstekst.json`
ved hver normalize-kjøring der det finnes minst to releaser. Dashboardet
leser JSON-en og rendrer ferdig formatert tekst - ingen tekstlogikk
i frontend.

Format på output:

```json
{
  "generert_dato": "YYYY-MM-DD",
  "ny_release": "...",
  "forrige_release": "...",
  "tekster": {
    "Norway": {
      "tekst": "Norges totale støtte til Ukraina ...",
      "delta_total_allocation_mrd": 1.5,
      "delta_total_allocation_pct": 15.0,
      "rangering_ny": 8,
      "rangering_gammel": 10
    },
    ...
  }
}
```
"""

from __future__ import annotations

from dataclasses import dataclass

from src.ingest.parse_kiel import LandSummary

LAND_GENITIV: dict[str, str] = {
    "Norway": "Norges",
    "Sweden": "Sveriges",
    "Denmark": "Danmarks",
    "Finland": "Finlands",
    "Iceland": "Islands",
    "Germany": "Tysklands",
    "France": "Frankrikes",
    "United Kingdom": "Storbritannias",
    "United States": "USAs",
    "Italy": "Italias",
    "Canada": "Canadas",
    "Japan": "Japans",
    "Netherlands": "Nederlands",
    "Spain": "Spanias",
    "Poland": "Polens",
}

KATEGORI_NORSK: dict[str, str] = {
    "military": "militære",
    "financial": "finansielle",
    "humanitarian": "humanitære",
}


@dataclass(frozen=True)
class Endringstekst:
    land: str
    tekst: str
    delta_total_allocation_mrd: float
    delta_total_allocation_pct: float | None
    rangering_ny: int
    rangering_gammel: int | None


def _genitivform(land: str) -> str:
    """Bruk forhåndsdefinert form hvis tilgjengelig, ellers `<land> sin`."""
    return LAND_GENITIV.get(land, f"{land} sin")


def _formater_mrd(verdi: float) -> str:
    """1,5 milliarder euro / 0,3 milliarder euro - norsk komma."""
    return f"{abs(verdi):.1f}".replace(".", ",")


def _formater_pct(verdi: float) -> str:
    return f"{abs(verdi):.0f}".replace(".", ",")


def _rangering(rader: list[LandSummary], maal: str = "allocation") -> dict[str, int]:
    nokkel = "total_allocation" if maal == "allocation" else "total_commitment"
    sortert = sorted(rader, key=lambda r: getattr(r, nokkel), reverse=True)
    return {r.land: i + 1 for i, r in enumerate(sortert)}


def _dominerende_kategori(
    ny_rad: LandSummary, gml_rad: LandSummary
) -> tuple[str, float] | None:
    """Returner (kategori, delta_mrd) for kategorien med størst endring i absolutt verdi.

    Returnerer None hvis ingen kategori har meningsfull endring (< 0.05 mrd EUR).
    """
    deltaer = {
        "military": ny_rad.military_allocation - gml_rad.military_allocation,
        "financial": ny_rad.financial_allocation - gml_rad.financial_allocation,
        "humanitarian": ny_rad.humanitarian_allocation - gml_rad.humanitarian_allocation,
    }
    storste = max(deltaer.items(), key=lambda kv: abs(kv[1]))
    if abs(storste[1]) < 0.05:
        return None
    return storste


def _ordinal(n: int) -> str:
    """1 → '1.', 2 → '2.', osv. Brukes på rangering."""
    return f"{n}."


def generer_endringstekst(
    land: str,
    ny: list[LandSummary],
    gammel: list[LandSummary],
) -> Endringstekst:
    """Generer 2-4 setningers tekst om endring i støtte for `land`.

    Bygger setningene trinnvis:
    1. Total endring (mrd EUR + prosent) eller "uendret".
    2. Dominerende kategori-driver (hvis noen kategori dominerer).
    3. Rangering nå vs. forrige release (hvis endret).
    4. Kort metodemerknad om at tallene kan inneholde retroaktive
       korrigeringer fra Kiel.
    """
    ny_idx = {r.land: r for r in ny}
    gml_idx = {r.land: r for r in gammel}
    if land not in ny_idx:
        raise KeyError(f"{land} ikke i ny release")

    ny_rad = ny_idx[land]
    gml_rad = gml_idx.get(land)

    rang_ny = _rangering(ny)[land]
    rang_gml = _rangering(gammel).get(land) if gml_rad else None

    delta_total = (
        ny_rad.total_allocation - gml_rad.total_allocation
        if gml_rad
        else ny_rad.total_allocation
    )
    pct: float | None
    if gml_rad and gml_rad.total_allocation > 0:
        pct = 100 * delta_total / gml_rad.total_allocation
    else:
        pct = None

    setninger: list[str] = []
    genitiv = _genitivform(land)

    if gml_rad is None:
        setninger.append(
            f"{genitiv} totale støtte til Ukraina er rapportert for første gang "
            f"i denne Kiel-rapporten ({_formater_mrd(ny_rad.total_allocation)} "
            f"milliarder euro)."
        )
    elif abs(delta_total) < 0.05:
        setninger.append(
            f"{genitiv} totale støtte til Ukraina er omtrent uendret "
            f"siden forrige Kiel-rapport ({_formater_mrd(ny_rad.total_allocation)} "
            f"milliarder euro)."
        )
    else:
        retning = "økte" if delta_total > 0 else "minket"
        fortegn = "+" if delta_total > 0 else "−"
        if pct is not None:
            pct_del = f" ({fortegn}{_formater_pct(pct)} %)"
        else:
            pct_del = ""
        setninger.append(
            f"{genitiv} totale støtte til Ukraina {retning} med "
            f"{_formater_mrd(delta_total)} milliarder euro{pct_del} siden "
            f"forrige Kiel-rapport."
        )

    if gml_rad is not None:
        kategori = _dominerende_kategori(ny_rad, gml_rad)
        if kategori is not None and abs(kategori[1]) >= 0.05:
            navn, delta = kategori
            navn_no = KATEGORI_NORSK[navn]
            verb = "økte" if delta > 0 else "minket"
            kilde = (
                "nye allokeringer"
                if delta > 0
                else "reduserte allokeringer"
            )
            setninger.append(
                f"Endringen kommer hovedsakelig fra {kilde} i {navn_no} støtte "
                f"({_formater_mrd(delta)} milliarder euro {verb})."
            )

    if rang_gml is not None and rang_gml != rang_ny:
        retning = "opp" if rang_ny < rang_gml else "ned"
        setninger.append(
            f"{land} er nå rangert som det {_ordinal(rang_ny)} største "
            f"giverlandet, {retning} fra {_ordinal(rang_gml)} plass."
        )
    else:
        setninger.append(
            f"{land} er rangert som det {_ordinal(rang_ny)} største "
            f"giverlandet."
        )

    setninger.append(
        "Tallene kan inneholde retroaktive korrigeringer fra Kiel mellom "
        "releaser."
    )

    return Endringstekst(
        land=land,
        tekst=" ".join(setninger),
        delta_total_allocation_mrd=delta_total,
        delta_total_allocation_pct=pct,
        rangering_ny=rang_ny,
        rangering_gammel=rang_gml,
    )


def generer_for_alle(
    ny: list[LandSummary], gammel: list[LandSummary]
) -> dict[str, Endringstekst]:
    """Generer endringstekst for hvert land i `ny`."""
    return {r.land: generer_endringstekst(r.land, ny, gammel) for r in ny}
