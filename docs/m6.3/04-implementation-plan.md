# M6.3 Implementasjonsplan

Dette dokumentet konkretiserer hvordan designet i 01-03 bygges.
Det dekker teknologivalg basert på dagens kodebase, foreslått
arbeidsrekkefølge med avhengigheter, anslått omfang per steg, og
risikovurdering for visuelle endringer.

Bygger på:

- `01-principles.md` (designgrunnlag og kontrastkrav).
- `02-information-architecture.md` (layout, breakpoints, grid).
- `03-components-and-charts.md` (komponenter, graf-spec og Plotly-tema).

## 4.1 Teknologivalg basert på dagens kodebase

### Hva som finnes i dag

Kodebasen bruker en bevisst minimal stakk:

| Lag | Verktøy | Plassering |
|---|---|---|
| Backend | Python 3.12, `openpyxl`, `pytest` (`requirements.txt`). | `src/ingest/`, `src/analyze/` |
| Datafiler | CSV og JSON, versjonert i `data/processed/`. | — |
| Frontend | Vanilla JS, vanilla CSS, ingen byggesteg. | `src/dashboard/` |
| Graf-bibliotek | Plotly 2.35.2 (`<script src="https://cdn.plot.ly/...">`). | `index.html` |
| Bygg | Bash-skript som lager `_site/` for Netlify. | `scripts/build-netlify.sh` |
| Hosting | Netlify (private repo OK). | `netlify.toml` |
| CI | GitHub Actions: `tests.yml`, `fetch-kiel.yml`, `fetch-wdi.yml`, `fetch-valutakurser.yml`. | `.github/workflows/` |

Det finnes ingen `package.json`, ingen TypeScript, ingen
front-end build (Vite/Webpack), og ingen CSS-rammeverk
(Tailwind, Bootstrap). Det er et bevisst valg som skal beholdes
i M6.3 - det holder lasting under 3 sekunder, og lokal utvikling
fungerer med `python -m http.server`.

### Hva M6.3 bør beholde

- **Vanilla JS i `dashboard.js`.** Ingen rammeverk legges til.
  All ny logikk legges som rene funksjoner som kan testes
  isolert i node (`node --check`).
- **Plain CSS med custom properties.** Designtokenene fra 01-1.3
  forankres i `:root` slik at all theming skjer der. Ingen
  preprosessor.
- **CSV/JSON som transport.** Eksisterende filer i
  `data/processed/` brukes uendret av nye komponenter.
- **Plotly via CDN.** Vi oppgraderer ikke i M6.3.
- **Bash-bygg.** Eventuelle nye filer legges til
  `scripts/build-netlify.sh` etter samme mønster som
  `tidsserier_maanedlig.csv` ble lagt til i M6.2.

### Hva M6.3 må legge til

- **`axe-core` for tilgjengelighetslinting.** Anbefales lagt til
  som egen GitHub Actions-jobb (`a11y.yml`) som kjører på PR mot
  bygget Netlify-output. Kan bruke `@axe-core/cli` via `npx`
  midlertidig - krever ikke `package.json` i repoet.
- **Et lite CSS-tokenbibliotek (`tokens.css`).** Filen importeres
  først i `index.html` slik at variablene er tilgjengelige i
  alle stilfiler. Nettleseren cacher tokens separat fra
  `styles.css`.
- **Funksjon `tema()` i `dashboard.js`.** Returnerer Plotly-
  layout med standardtema fra 03-3.4.4. Alle render-funksjoner
  bytter til denne i samme PR for konsistens.
- **Skjult tabell-fallback for tidsserie.** Bygges av
  `dashboard.js` ved render og legges i en visuelt skjult
  `<table>` med `.sr-only` for skjermlesere (jf. 01-1.5).

## 4.2 Avgrensning av scope

I scope:

- Visuell omarbeiding av alle eksisterende seksjoner (ingen ny
  data-pipeline).
- Erstatte donutgrafen med stablet horisontal stolpe.
- Implementere 12-kolonne grid og responsive breakpoints.
- Implementere PNG-eksport per graf.
- Implementere CSV-eksport-knapp i footer.
- Implementere segmenterte gruppe-knapper for Norden/EU/G7/NATO
  som styrer komparativ profil, rangering og scatter samtidig
  via en valgfri delt tilstand.

Utenfor scope (planlegges som senere forbedringer):

- URL-deling av filtertilstand.
- Persistens via `localStorage`.
- Mørkt tema.
- Norsk/engelsk språkbytte.
- Brukertesting med eksterne brukere.
- Fjerning av Plotly til fordel for et lettere bibliotek.

## 4.3 Risikovurdering

| ID | Risiko | Sannsynlighet | Konsekvens | Tiltak |
|---|---|---|---|---|
| R10 | Brukere som er vant til dagens layout finner ikke fram etter redesign | Middels | Middels | Beholde alle nøkkeltall, kun reorganisere; release-notat med "hva er nytt"-bilde i README. |
| R11 | Endring fra rød til blå aksent oppleves som tap av norsk identitet | Lav | Lav | Beholde norsk flagg-rødt som "Norge-aksent" der det fungerer (rangeringsstreker, delta-pil). |
| R12 | Plotly oppgradering kreves for nye funksjoner | Lav | Middels | Holde oss til Plotly 2.35.2; ikke bruk funksjoner som kom etter. |
| R13 | Tilgjengelighetstesting avdekker behov for omfattende refaktor | Middels | Høy | Kjøre `axe-core` lokalt før første store PR, slik at problemer oppdages tidlig. |
| R14 | Mobil-layouten blir for trang for tidsseriegrafen | Middels | Lav | Falle tilbake til skjult tabell på mobil (jf. 4.1). |

Risiko R5 (scope creep) fra prosjektplanen er fortsatt relevant
og dekkes av at scope eksplisitt er listet i 4.2.

## 4.4 Utviklingssteg i prioritert rekkefølge

Hvert steg skal være én PR mot `main`, slik at vi kan rulle
tilbake enkeltdeler hvis et valg viser seg dårlig. Vi prioriterer
fundament før innhold, og innhold før eksport - det gir tidlig
brukbart resultat.

| # | Tittel | Avhenger av | Omfang |
|---|---|---|---|
| 1 | Designtokens og temabytte | — | S |
| 2 | 12-kolonne grid og responsive breakpoints | 1 | M |
| 3 | Hero-seksjon (Norge i tall) | 2 | S |
| 4 | Erstatt donut med stablet horisontal stolpe | 1 | S |
| 5 | Tidsseriegraf og fordeling med nytt tema | 1 | M |
| 6 | Komparativ profil med small-multiples-styling | 1, 2 | S |
| 7 | Rangeringsgraf med Norge-stripe og PNG-knapp | 1, 5 | S |
| 8 | Scatter med direkte etikettering | 1, 7 | S |
| 9 | Globale gruppefiltre (Norden/EU/G7/NATO) | 6, 7, 8 | M |
| 10 | CSV-eksport-knapp i footer | 9 | S |
| 11 | Tilgjengelighetslinting og fokus-håndtering | 1-10 | M |
| 12 | Brukerveiledning oppdatert med nye skjermbilder | 1-11 | S |

Skala: S = ½-1 dag, M = 1-2 dager, L = 2-3 dager.

### Detaljer per steg

**1. Designtokens og temabytte.** Lag `src/dashboard/tokens.css`
med alle tokens fra 01-1.3 og 03-3.4.1. Importer den øverst i
`index.html`. Erstatt eksisterende `--accent: #d71418` med ny
palett. Ingen funksjonell endring - kun visuelt skift.
Verifiserer kontrast mot WCAG 2.2 AA på alle kombinasjoner.

**2. 12-kolonne grid og breakpoints.** Legg `.grid` og
`.col-span-N`-klasser i `styles.css`. Restrukturer
`index.html`-seksjonene til å bruke de nye klassene. Sjekk
adferd på 320 px / 768 px / 1100 px.

**3. Hero-seksjon.** Erstatt dagens `.nokkel-tall`-grid med
hero-kort (3 rem hoved-tall + tre støtte-tall). DOM får
`role="group"` og `aria-labelledby` per kort.

**4. Erstatt donut.** Skriv ny render-funksjon
`tegnFordelingStabel()` i `dashboard.js`. Hold gammel
`tegnFordeling()` til ny er testet, fjern den i samme PR
når ny rendrer som forventet.

**5. Tidsserie og fordeling med nytt tema.** Innfør `tema()`-
funksjon (jf. 03-3.4.4). Bruk den i alle eksisterende grafer.
Legg til skjult `<table>`-fallback for tidsserien.

**6. Komparativ profil.** Bytt `.komparativ-grid` til 12-kolonne
grid med `.col-span-3` per kort. Legg til Norge-bakgrunn
(`--blue-50`) på Norge-kortet. Kortene reflekterer ny
typografisk skala.

**7. Rangeringsgraf.** Legg til Norge-bakgrunnsstripe via en
`<rect>`-shape i Plotly. Legg til "Last ned PNG"-knapp som
`Plotly.downloadImage`-wrapper.

**8. Scatter.** Legg til direkte etikettering på Norge + valgte
sammenligningsland. Synkroniser scatter-fremheving med komparativ
profil.

**9. Globale gruppefiltre.** Lag en delt JS-tilstand (et enkelt
`Set` av valgte land) som komparativ profil, rangering og scatter
abonnerer på. Hurtigknapper Norden/EU/G7/NATO oppdaterer
tilstanden. Filter-baren plasseres rett under hero-seksjonen
(jf. 02-2.4).

**10. CSV-eksport-knapp.** Footer får én knapp som genererer en
zip av filene i `data/processed/` ved hjelp av en lett klient-side
zip-kode (eks. `client-zip` via CDN). Vurder først om vi heller
kan lage en enkel HTML-side med direkte lenker - krever ingen
JS-bibliotek.

**11. Tilgjengelighetslinting.** Legg til `.github/workflows/a11y.yml`
som starter et lokalt Netlify-bygg, kjører `@axe-core/cli` mot
`http://localhost:8080`, og feiler på serious/critical-funn.
Fiks eventuelle funn i samme PR.

**12. Brukerveiledning.** Oppdater `docs/brukerveiledning.md`
med skjermbilder fra produksjonsdeploy.

## 4.5 Avhengighetskart

```
1 (tokens) ──┬─── 2 (grid) ──┬── 3 (hero)
             │               │
             ├── 4 (fordeling stabel)
             │
             ├── 5 (tidsserie + tema) ──── 7 (rangering) ── 8 (scatter)
             │
             └── 6 (komparativ) ────────────────────────────┐
                                                            │
                                              9 (gruppefiltre) ── 10 (csv)
                                                            │
                                                       11 (a11y) ── 12 (brukerveiledning)
```

Stegene 4, 5 og 6 kan utføres parallelt etter at 1 og 2 er
mergeet, hvis vi vil. Steg 9 er flaskehals fordi det krever at
6, 7 og 8 alle er på plass.

## 4.6 Anslått total leveringstid

Summering med skala-konvertering:

| Klasse | Antall | Sum (dager) |
|---|---|---|
| S | 8 | 4-8 |
| M | 4 | 4-8 |
| L | 0 | 0 |

Forventet total: 8-16 utviklingsdager. Iht. prosjektplanens
M6.3-estimat (1 uke fra M6.2 ferdig) er dette i overkant - vi
bør forhandle med prosjekteier om enten utvidelse til 2 uker
eller om noen S-steg kan utsettes til en M6.4 (eks. CSV-zip og
brukerveiledning).

## 4.7 Test- og QA-strategi

- **Visuelle endringer:** manuell sjekk på Netlify-deploy-preview
  for hver PR. Bekreftelse fra prosjekteier før merge.
- **Tilgjengelighet:** automatisert via `axe-core` (steg 11) +
  manuell tastaturtest og skjermlesertest før M6.3-avslutning.
- **Eksisterende Python-testsuite:** holdes grønn (M6.3 endrer ikke
  Python-koden).
- **Performance-test:** førstelasting måles med Lighthouse på
  Netlify-deploy-preview før hver PR. Regresjon på Performance
  >5 poeng blokkerer merge.

## 4.8 Roll-back-strategi

Hver PR mergeen som egen commit på `main`. Hvis et redesign-steg
viser seg å skape regresjoner i drift:

1. `git revert <commit>` på den enkelte commit, ikke alle.
2. Push fix-PR med revert.
3. Netlify reverter automatisk.

Roll-back av et helt designspring (steg 1+2) er mulig fordi
`tokens.css` er separat fil - en enkel fjerning av
import-linjen og gjenoppretting av gammel
`--accent`-variabel reverterer hele paletten.