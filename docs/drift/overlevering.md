# Overlevering til drift

Sjekkliste og driftsinformasjon for at dashboardet skal kjøre uten
løpende Claude Code-involvering. Oppdateres når drift-relevante
elementer endres.

## 1. Oversikt over komponenter

```
Kiel Institute
   │  (ukentlig mandag 06:00 UTC)
   ▼
.github/workflows/fetch-kiel.yml
   ├── src/ingest/fetch_kiel.py    (henter XLSX)
   ├── src/ingest/normalize.py     (skriver CSV + JSON)
   └── git commit + push til main

Verdensbanken WDI
   │  (månedlig 1. kl 07:00 UTC)
   ▼
.github/workflows/fetch-wdi.yml
   ├── src/ingest/fetch_wdi.py     (henter BNP + folketall)
   └── git commit + push til main

Push til main
   │
   ▼
GitHub Pages (auto-deploy via workflow)
   ├── scripts/build-site.sh       (bygger _site/)
   ├── actions/upload-pages-artifact (laster opp _site/)
   ├── actions/deploy-pages        (publiserer til Pages)
   └── Publiserer til https://marhip97.github.io/ukrainastotte/
```

## 2. Drift-sjekkliste

### 2.1 GitHub

- [x] Repo: `marhip97/ukrainastotte` (offentlig fra 2026-04-26 i forbindelse med GitHub Pages-deploy).
- [x] Branch-regler: ingen direkte push til `main` fra mennesker -
      alltid via PR. Workflow-bots har unntak.
- [x] Secrets: ingen Kiel- eller WDI-API krever nøkler i dag.
- [x] Issues: workflows oppretter Issue automatisk ved feil, med
      etiketter `data`, `kiel`/`wdi`, `bug`.

### 2.2 Workflows

Tre planlagte workflows. Alle har `workflow_dispatch` for manuell
kjøring.

| Workflow                | Plan                     | Hensikt                        | Feilhåndtering       |
|-------------------------|--------------------------|--------------------------------|----------------------|
| `fetch-kiel.yml`        | Mandag 06:00 UTC         | Henter ny Kiel-utgivelse       | Oppretter Issue      |
| `fetch-wdi.yml`         | 1. i måneden 07:00 UTC   | Oppdaterer BNP + folketall     | Oppretter Issue      |
| `fetch-valutakurser.yml`| Daglig 08:00 UTC         | Henter EUR/NOK fra Norges Bank | Oppretter Issue      |
| `tests.yml`             | Ved hver PR              | Kjører pytest                  | Blokkerer merge      |
| `a11y.yml`              | Ved hver PR (dashboard)  | axe-core tilgjengelighetslint  | Blokkerer merge      |
| `deploy-pages.yml`      | Ved push til main        | Bygger og publiserer til Pages | Stopper deploy       |

### 2.3 GitHub Pages

- [x] GitHub Pages aktivert med kilde "GitHub Actions"
      (Settings → Pages).
- [x] Build-kommando: `bash scripts/build-site.sh`.
- [x] Publiseringsmappe: `_site/`.
- [x] URL: <https://marhip97.github.io/ukrainastotte/>.
- Pages krever offentlig repo (eller Pro/Team-plan for private). Repo
  ble gjort offentlig 2026-04-26.

### 2.4 Kvalitetskontroll

- [x] `scripts/qa_krysssjekk.py` kjører mot data/processed/ og
      sammenligner med Kiel headline-tall. Kjøres manuelt i dag;
      **planlagt** å integreres i `fetch-kiel.yml` etter neste
      release er verifisert.
- [x] QA-rapport per release i `docs/qa/`.

## 3. Varslingsrutiner

| Hendelse                             | Kanal              | Respons                          |
|--------------------------------------|--------------------|----------------------------------|
| `fetch-kiel.yml` feiler              | GitHub Issue       | Dataingeniør sjekker innen 3 dager |
| `fetch-wdi.yml` feiler               | GitHub Issue       | Dataingeniør sjekker innen 7 dager |
| `fetch-valutakurser.yml` feiler      | GitHub Issue       | Dataingeniør sjekker innen 3 dager |
| `deploy-pages.yml` feiler            | GitHub Actions     | Devops sjekker innen 1 dag      |
| Pytest feiler på PR                  | GitHub             | PR blir ikke merget             |
| axe-core finner serious/critical-funn | GitHub            | PR blir ikke merget             |
| `qa_krysssjekk.py` finner kritisk feil | Manuelt           | QA-rapport oppdateres før publisering |

## 4. Vanlige driftsscenarier

### 4.1 Kiel publiserer en ny utgivelse

Ingenting kreves fra drift. Workflow henter automatisk neste mandag,
eller hvis du vil ha det raskere: trigg `fetch-kiel.yml` manuelt.
Etter henting:

1. Ny `data/raw/kiel/<dato>_Ukraine_Support_Tracker_Release_XX.xlsx`
   committes til `main`.
2. `normalize.py` skriver oppdaterte CSV-er og en ny
   `country_summary_endring.csv` (siden det nå finnes to utgivelser).
3. `deploy-pages.yml` trigges automatisk når commit treffer main.
4. Dashboard-fronten viser ny dato, oppdaterte tall og endring-
   visningen.

### 4.2 Kiel endrer filformat eller struktur

Parser-kolonnekontrakter i `src/ingest/parse_kiel.py` feiler.
Workflow oppretter Issue med tittel `[DATA] Automatisk henting fra
Kiel feilet ...`. Dataingeniør:

1. Åpner Issue, ser logg via lenken.
2. Sjekker aktuell fil manuelt og oppdaterer `FORVENTEDE_*_KOLONNER`
   eller parser-logikk.
3. Oppretter PR, verifiserer med `pytest`, merger.

### 4.3 Verdensbanken endrer indikator-navn

`fetch_wdi.py` feiler. Fremgangsmåte som i 4.2.

### 4.4 Pages-URL endres eller egendefinert domene

1. Oppdater `README.md` og `docs/brukerveiledning.md`.
2. Hvis egendefinert domene: legg til en `CNAME`-fil i repo-roten
   eller `src/dashboard/` (kopieres så til `_site/CNAME` av
   build-scriptet) og konfigurer DNS hos domeneleverandøren.
3. Aktiver "Enforce HTTPS" i Settings → Pages etter at sertifikat
   er klart.

## 5. Hva *ikke* drift trenger å gjøre

- Ingen manuell beregning av nøkkeltall. Alt gjøres i kode.
- Ingen manuell kopiering av data. Alt commit-flytes automatisk.
- Ingen manuell build av HTML. `deploy-pages.yml` bygger og publiserer ved hver push.

## 6. Test av hele kjeden

For en end-to-end-verifikasjon (bør gjøres ved større endringer):

1. Trigg `fetch-kiel.yml` manuelt i Actions-fanen. Hvis Kiel ikke har
   ny fil, avsluttes workflow uten commit - det er forventet og OK.
2. Trigg `fetch-wdi.yml` manuelt. Bekreft at en ny
   `data: oppdater WDI ...`-commit kommer på `main` (eller "Ingen
   endring" hvis alt er uendret).
3. Sjekk at `deploy-pages.yml` kjører grønn etter ny commit
   (Actions-fanen).
4. Last inn dashboardet og verifiser at "Sist oppdatert"-datoen
   stemmer med siste Kiel-utgivelse.
5. Kjør `python scripts/qa_krysssjekk.py` lokalt. Forventet:
   `Totalt: X OK, 0 kritiske feil, Y observerte avvik`.

## 7. Kontaktpersoner

| Rolle         | Ansvar                                 |
|---------------|----------------------------------------|
| Prosjekteier  | Overordnede beslutninger, scope        |
| Dataingeniør  | Fetcher + parser-feil, datakvalitet    |
| Frontend      | Dashboard-UI                           |
| Analytiker    | Nye nøkkeltall, endring i metodikk     |
| QA            | Krysssjekk, rapporter per release      |
| DevOps        | Workflows, CI/CD, Pages-deploy         |

Roller vedlikeholdes av Claude Code-agentene iht. `prosjektplan.md`
seksjon 4.2.

## 8. Sist oppdatert

- 2026-04-23: Første versjon ved M5-overlevering.
