# Dashboard for Ukraina-støtte (Kiel-data)

Automatisert HTML-dashboard som henter, analyserer og visualiserer data fra
[Kiel Institute for the World Economy sin Ukraine Support Tracker](https://www.ifw-kiel.de/topics/war-against-ukraine/ukraine-support-tracker/),
med særlig fokus på Norges støtte til Ukraina sammenlignet med øvrige giverland.

**Status:** Under utvikling - milepæl M1 Oppstart.

## Formål

Gjøre Kiel-data lett tilgjengelig for norsk publikum i form av et
løpende oppdatert dashboard med Norge som referansepunkt. Målgruppen er
journalister, utredere, forskere, politikere og andre som trenger rask
innsikt i byrdefordelingen i støtten til Ukraina.

## Dokumentasjon

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

## Teknologi (foreløpig)

- **Datainnhenting og analyse:** Python (pandas, requests, openpyxl, pdfplumber).
- **Dashboard:** Statisk HTML + Plotly.js.
- **Hosting:** GitHub Pages (avventer endelig godkjenning).
- **Automatisering:** GitHub Actions, planlagt ukentlig oppdatering.

Endelig teknologivalg besluttes i M1. Se `prosjektplan.md` seksjon 6.1.

## Kom i gang

Installasjons- og kjøreinstrukser fylles ut i M2 når datapipelinen er på plass.

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
