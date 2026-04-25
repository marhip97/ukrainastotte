# M6.2 Analytisk innhold - plan

**Status:** Godkjent av prosjekteier 2026-04-25. S10-S14 besluttet.
**Dato:** 2026-04-25
**Forutsetninger:** M6.1 merget (PR #24). Datafundamentet leverer
`tidsserier_maanedlig.csv`, `country_summary_nok.csv`, og land-grupperinger
fra `src/analyze/landgrupper.py`.

## 1. Leveranseomfang (iht. prosjektplan seksjon 5)

M6.2 skal levere fem analytiske byggeklosser som integreres i dashboardet:

1. **Komparative landprofiler** - Norge sammenlignet med utvalgt(e) andre land
   side ved side (samme nøkkeltall vises for hvert land).
2. **Tidsseriegraf** - månedlig akkumulert støtte, valgbar valuta (EUR/NOK)
   og kategori (totalt/militær/finansiell/humanitær).
3. **Scatter plot** - to akser krysser to nøkkeltall for alle givere.
4. **Automatisk endringstekst** - generert norsk tekst som forklarer
   delta siden forrige release.
5. **Tooltips** - hover-info på alle nye og eksisterende visualiseringer.

## 2. Designvalg - besluttet 2026-04-25

### S10: Standardvalg for komparativ landprofil

**Beslutning:** Default sammenligning = Norge + **Tyskland, Frankrike,
Storbritannia**. Gir kontrast mot de største europeiske giverne.
Brukeren kan legge til/fjerne via multivelger som fyller fra
`landgrupper.py`.

### S11: Akser i scatter plot

**Beslutning:** *Andel av BNP* (x) mot *Per capita EUR* (y) som default.
Norge fremheves med farge. Brukeren kan bytte akser via dropdown.

### S12: Tone og format på automatisk endringstekst

**Beslutning:** 2-4 setninger med **pedagogisk klarspråk** (ikke
fagsjargong). Eksempel: *"Norges totale støtte til Ukraina økte med
1,5 milliarder euro (+15 %) siden forrige Kiel-rapport. Økningen
kommer hovedsakelig fra nye militære allokeringer. Norge er nå
rangert som det 8. største giverlandet, opp fra 10. plass."*
Inkluderer kort metodemerknad om at tallene kan inneholde
retroaktive korrigeringer.

### S13: Tidsseriegraf - akkumulert eller per måned

**Beslutning:** Toggle med to moduser. **Akkumulert** (linje fra
2022-01 til hver måned) er default; **Per måned** (stolper) er
sekundær modus.

### S14: Tooltips - innholdsnivå

**Beslutning:** Norsk språk, eksplisitt format. Hver tooltip viser
landnavn, verdi i EUR og NOK (der relevant), referanseår for
BNP/folketall (når relative tall vises), og rangering-posisjon.

## 3. Tekniske valg (mine å ta som dataingenior/frontend)

Disse løses uten å belaste deg, men dokumenteres her for sporbarhet:

- **Endringstekst-generator** legges i `src/analyze/endringstekst.py`,
  produserer en JSON-fil `data/processed/endringstekst.json` ved
  hver normalize-kjøring. Dashboardet leser JSON og rendrer som
  ferdig formatert tekst (ingen logikk i frontend).
- **Tidsserie i frontend** bruker eksisterende Plotly-bibliotek
  (`dashboard.js` har det allerede). Ny graf-funksjon
  `tegnTidsserie()` legges i samme fil.
- **Scatter plot** bruker også Plotly. Ny funksjon `tegnScatter()`.
- **Komparativ profil** rendres som et grid med ett kort per land.
  HTML-grid i CSS, ikke nytt rammeverk.
- **CSV som dataformat** - vi fortsetter med CSV. Ingen overgang
  til JSON eller SQLite i denne fasen.

## 4. Foreslått arbeidsrekkefølge (10 steg)

Hvert steg er én commit eller én logisk gruppe.

1. **Plan godkjent** - du svarer på S10-S14 over.
2. **`src/analyze/endringstekst.py`** - generator + tester.
   Skriver `data/processed/endringstekst.json`.
3. **Utvid `normalize.py`** til å skrive endringstekst.json når
   ≥2 releaser finnes.
4. **Komparativ profil i dashboardet** - HTML-grid + JS som leser
   `country_summary.csv` og rendrer kort per valgt land.
5. **Tidsseriegraf** - Plotly linje/stolpe-graf med toggle.
   Leser `tidsserier_maanedlig.csv`.
6. **Scatter plot** - Plotly med dropdown for akser.
7. **Automatisk endringstekst** rendres øverst i dashboardet
   (leser JSON-filen).
8. **Tooltips harmoniseres** på alle grafer (eksisterende +
   nye), norsk språk og enhetlig format.
9. **Testing**: alle nye Python-moduler har enhetstester.
   Frontend-testing skjer manuelt mot deploy-preview.
10. **PR mot main** med M6.2-leveransen.

## 5. Risikovurdering

- **R8 (ny):** Endringstekst kan virke autoritativ selv når
  underliggende delta er marginal eller skyldes
  rapporteringsendringer hos Kiel. Tiltak: tekst inkluderer
  metodemerknad ("Tallene er basert på Kiel Release X vs Y;
  kan inneholde retroaktive korrigeringer.").
- **R9 (ny):** Tidsseriegraf kan bli rotete med 40+ givere.
  Tiltak: standard kun Norge + valgte sammenligningsland;
  brukeren legger til eksplisitt.

## 6. Estimert leveringstid

Iht. prosjektplan: 2 uker fra M6.1 ferdig → 2026-05-09.
Ingen blokkere identifisert; estimatet holder.

---

*Forslag oppdateres etter at S10-S14 er besvart. Endelig versjon
flyttes inn i prosjektplanens beslutningsdokumentasjon eller
slettes når M6.2 er ferdig.*
