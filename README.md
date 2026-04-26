# Dashboard for Ukraina-støtte (Kiel-data)

Automatisert HTML-dashboard som henter, analyserer og visualiserer data fra
[Kiel Institute for the World Economy sin Ukraine Support Tracker](https://www.ifw-kiel.de/topics/war-against-ukraine/ukraine-support-tracker/),
med særlig fokus på Norges støtte til Ukraina sammenlignet med øvrige giverland.

**Status:** Alle fem milepæler (M1-M5) levert og godkjent.
Prosjektet er i driftsfase.

**Dashboard:** <https://marhip97.github.io/ukrainastotte/>

Deployes automatisk til GitHub Pages fra `main`. Workflow
`.github/workflows/deploy-pages.yml` kjører `scripts/build-site.sh`,
laster opp `_site/` som Pages-artifakt og publiserer.

## Formål

Gjøre Kiel-data lett tilgjengelig for norsk publikum i form av et
løpende oppdatert dashboard med Norge som referansepunkt. Målgruppen er
journalister, utredere, forskere, politikere og andre som trenger rask
innsikt i byrdefordelingen i støtten til Ukraina.

## Dokumentasjon

- [`docs/brukerveiledning.md`](./docs/brukerveiledning.md) -
  **for journalister, utredere og forskere** som vil bruke
  dashboardet i analyser og omtale.
- [`docs/drift/overlevering.md`](./docs/drift/overlevering.md) -
  driftsjekkliste og vanlige scenarier.
- [`docs/qa/`](./docs/qa/) - kvalitetsrapporter per Kiel-release.
- [`docs/beslutningssaker/`](./docs/beslutningssaker/) - metodiske valg
  dokumentert (S2, S6 så langt).
- [`prosjektplan.md`](./prosjektplan.md) - fullstendig prosjektplan med mål,
  milepæler, roller, risiko og status- og fremdriftsprotokoll.
- [`CLAUDE.md`](./CLAUDE.md) - stående instrukser for prosjektgruppen
  (Claude Code-agentene).

## Repo-struktur

```
ukraina-dashboard/
├── README.md              # Denne filen
├── CLAUDE.md              # Stående instrukser for agentene
├── prosjektplan.md        # Styringsdokument
├── data/
│   ├── raw/               # Rådata fra Kiel (uendret)
│   └── processed/         # Renset og normalisert data
├── src/
│   ├── ingest/            # Datainnhenting (Python)
│   ├── analyze/           # Beregninger og nøkkeltall
│   └── dashboard/         # HTML/JS/CSS
├── tests/                 # Automatiserte tester
├── docs/                  # Teknisk dokumentasjon og brukerveiledning
└── .github/
    ├── ISSUE_TEMPLATE/    # Issue-maler
    ├── pull_request_template.md
    └── workflows/         # GitHub Actions (automatisk oppdatering)
```

## Teknologi

- **Datainnhenting og analyse:** Python 3.12 (openpyxl, urllib).
- **Dashboard:** Statisk HTML + Plotly.js.
- **Hosting:** Netlify (gratis plan for private repoer; se S7 i protokollen).
- **Automatisering:** GitHub Actions - `fetch-kiel.yml` ukentlig,
  `fetch-wdi.yml` månedlig.

## Kom i gang (lokalt)

```bash
python -m pip install -r requirements.txt
python -m src.ingest.fetch_kiel       # Laster siste Kiel-XLSX til data/raw/
python -m src.ingest.normalize        # Skriver data/processed/*.csv
python scripts/qa_krysssjekk.py       # Kjører kvalitetskontroll
python -m http.server 8080            # Åpne http://127.0.0.1:8080/src/dashboard/
```

## Arbeidsflyt

Vi bruker en enkel GitHub-flyt. Alt arbeid skjer på feature-branches
(`feature/<kort-beskrivelse>`); `main` er alltid stabil. Pull requests
gjennomgås av QA-agenten før merge, og prosjekteier godkjenner på
milepæler. Se `prosjektplan.md` seksjon 9 for full beskrivelse.

## Lisens og databruk

Kiel-data brukes i henhold til Kiel Institute sine vilkår for
gjenbruk. Kildehenvisning vises i dashboardet. Prosjektkoden lisensieres
separat (avklares før M5 Produksjon).

## Kontakt

Prosjekteier og prosjektleder-agenten kommuniserer via GitHub Issues
og pull requests i dette repoet.
