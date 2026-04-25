# M6.3 Komponenter og grafer

Dette dokumentet konkretiserer komponentbiblioteket og graftypene
som M6.3 skal levere. Det bygger på `01-principles.md` (designvalg)
og `02-information-architecture.md` (hvor komponentene plasseres).

Mål: hver komponent skal kunne gjenbrukes på minst to steder, ha
definerte tilstander (default/loading/empty/error) og ha tydelige
DOM- og CSS-konvensjoner som lar `dashboard.js` finne og rendre
dem uten ad hoc-kode per seksjon.

## 3.1 Komponentbibliotek

Komponentene navngis på norsk i CSS og engelsk-kompatibel form i
DOM-IDer (slik at JS-koden er lesbar uten norske spesialtegn).

### 3.1.1 KPI-kort (`.kpi-kort`)

Dagens `.kort`-klasse i `styles.css` er en KPI-kort-variant. I
M6.3 splitter vi den i to typer:

- **`.kpi-kort.hero`** - dominerende variant for hovedtallet
  (typografi 3 rem, eget bakgrunnskontrast).
- **`.kpi-kort`** - sekundære nøkkeltall (1,5 rem, samme
  bakgrunn som omkringliggende kort).

Hver KPI-kort har tre slots:

| Slot | HTML-element | Innhold |
|---|---|---|
| Verdi | `<div class="kpi-verdi">` | Selve tallet, med `font-variant-numeric: tabular-nums`. |
| Etikett | `<div class="kpi-etikett">` | Hva tallet betyr (eks. "Total allokering"). |
| Kontekst | `<div class="kpi-kontekst">` (valgfri) | Enheter, referanseår, kort presisering (eks. "€ mrd, kumulativt 2022-2026"). |

Tilstander:

- **Default:** alle slots fylt med data.
- **Loading:** verdi viser `–` (en-dash) i muted farge
  (`--neutral-600`).
- **Empty:** verdi viser `–`, kontekst viser tekst som
  forklarer hvorfor (eks. "Kun én Kiel-release lagret enda").
- **Error:** kort får 1 px ramme i `--negative`, kontekst viser
  feilmeldingen.

Tilgjengelighet: `<div class="kpi-kort">` får `role="group"` og
`aria-labelledby` som peker på etikett-elementet, slik at
skjermleser leser "[verdi] [etikett] [kontekst]" som ett enhetlig
element.

### 3.1.2 Tabell (`.data-tabell`)

Brukes der eksakte verdier er viktigere enn visuell sammenligning
(jf. 01-prinsippet 1.4 "Når tabell er bedre enn graf").

Standardadferd:

- Sortering: trykk på kolonneoverskrift sorterer stigende/synkende.
  Aktivt sorteringsfelt markeres med pil og `aria-sort`.
- Tabular-nums på alle tallkolonner.
- Sticky header når tabellen rammes inn av en container med
  egen scroll.
- Striper kun ved >10 rader (visuell hjelp); under 10 rader gir
  striper unødig støy.

DOM-mønster:

```html
<table class="data-tabell">
  <thead>
    <tr>
      <th scope="col" aria-sort="none">Land</th>
      <th scope="col" aria-sort="descending">Total allokering (€ mrd)</th>
    </tr>
  </thead>
  <tbody>
    <tr><th scope="row">Norge</th><td>11,50</td></tr>
  </tbody>
</table>
```

Tilstander: default, loading (skeleton-rader i muted farge),
empty (en sentrert melding under thead), error (feilmelding i
stedet for tbody).

### 3.1.3 Filterkomponenter

Tre faktiske filtertyper i M6.3:

- **`.filter-dropdown`** - `<select>` med konsekvent styling
  (eks. visningsbryter). Tastatur-vennlig native.
- **`.filter-multi`** - multi-select for komparativ profil.
  Beholder dagens `<select multiple>` som basis fordi det er
  tastatur- og skjermlesertilgjengelig uten ekstra arbeid.
  Forbedres med søkefelt over når listen er > 15 elementer.
- **`.filter-knapper`** - segmenterte knapper (eks. Norden /
  EU / G7 / NATO). En aktiv tilstand markeres med både farge
  og fet vekt (jf. 01-prinsippet 1.5 om redundant koding).

Layout-prinsipp: filtre plasseres umiddelbart over eller til
høyre for grafen de styrer (jf. 02-prinsippet 2.3). De får aldri
egen seksjon.

### 3.1.4 Navigasjon

Dashboardet er én side, ikke flere - så "navigasjon" er internt
hopp mellom seksjoner. To elementer:

- **Skip-link** (`<a class="skip-link" href="#hovedinnhold">`).
  Synlig kun ved tastaturfokus, første DOM-element.
- **Innholdsfortegnelse i mobil-meny** (valgfri, vurderes i
  04-dokumentet). Liste over seksjonsoverskrifter med ankere,
  vises som en utbrettbar `<details>` på mobil siden seksjonene
  er lange.

Vi unngår en sticky topp-meny - det stjeler vertikal plass og
gir liten verdi når siden uansett scrolles på under 30 sekunder.

### 3.1.5 Knapper og handlinger

Tre knappetyper:

- **`.knapp-primaer`** - sterk visuell vekt (`--blue-500`-fyll,
  hvit tekst). Brukes til hovedhandlinger, maksimalt én per
  seksjon.
- **`.knapp-sekundaer`** - omriss i `--blue-500`, transparent fyll.
  Brukes til alternative handlinger (eks. "Last ned PNG").
- **`.knapp-tekst`** - bare tekst med understrek. Brukes til
  navigative lenker som ikke er aksjonsknapper.

Alle knapper:

- Min høyde 40 px for treffflate (WCAG 2.5.5 Target Size).
- Tydelig fokus-ring (3 px outline med `--blue-500` og 2 px
  offset).
- Disabled-tilstand med 50 % opacitet og `cursor: not-allowed`,
  men aldri som eneste signal (også `aria-disabled="true"`).

### 3.1.6 Tilstander - felles mønster

Alle datavisende komponenter (KPI, tabell, graf) har samme fire
tilstander med konsistent visuelt språk:

| Tilstand | Visuelt | Skjermleser-tekst |
|---|---|---|
| Loading | Pulserende skeleton i `--neutral-200`. Maks 1 sekund. | "Laster data" |
| Default | Innholdet rendret som planlagt. | (leser innhold normalt) |
| Empty | Sentrert ikon-fri tekstmelding i `--neutral-600`. | "Ingen data tilgjengelig: [grunn]" |
| Error | 1 px `--negative` ramme, tittel "Klarte ikke laste", enkel "Prøv igjen"-knapp. | "Feil ved lasting: [melding]" |

Empty og error skiller seg klart: empty er forventet (kun én
release lagret, ingen historikk ennå), error er uventet
(nettverksfeil, parsing-feil).

## 3.2 Graftyper koblet til datatyper

Hver graf i M6.3 må eksplisitt svare på tre spørsmål før vi
velger graftype:

1. **Hvilket spørsmål stiller brukeren?** (Munzners task abstraction;
   se 01-prinsippet 1.4.)
2. **Hvilken datatype har vi?** (Nominell, ordinell, kvantitativ,
   tidsserie, geografisk.)
3. **Hvor mange dimensjoner skal sammenlignes samtidig?**

Avbildning fra datatype og spørsmål til graftype:

| Datatype | Antall verdier | Spørsmål | Foretrukken graf |
|---|---|---|---|
| Kvantitativ (én verdi) | 1 | Hvor mye? | KPI-tall + kontekst-linje |
| Kvantitativ × kategori | 5-40 | Rangering | Sortert horisontal stolpe |
| Kvantitativ × tid | månedlig 2022→ | Utvikling | Linje (akkumulert) eller stolpe (per måned) |
| Andel av helhet | 3 (mil/fin/hum) | Fordeling | Stablet horisontal stolpe |
| To kvantitative × kategori | 40 land | Sammenheng | Scatter |
| Delta mellom to målinger | 40 land | Endring | Bullet eller delta-stolpe |

Donutgrafen i dagens dashboard kommer ikke ut av denne tabellen
fordi sirkelformat dårlig støtter sammenligning av andeler. Den
erstattes av en stablet horisontal stolpe (sek. 3.3.4).

## 3.3 Per-graf spesifikasjon

For hver av de seks grafene angir vi: brukerspørsmål, datakilde,
graftype, akse-konvensjon, fremhevingsstrategi, interaktivitet, og
empty/error-adferd.

### 3.3.1 Tidsserie (akkumulert / per måned)

- **Spørsmål:** Hvordan har Norges støtte utviklet seg månedlig
  siden januar 2022?
- **Datakilde:** `data/processed/tidsserier_maanedlig.csv`
  (kolonner: `land, aar, maaned, kategori, maal, sum_eur, sum_nok`).
- **Graftype:** Linje når modus = akkumulert; stolpe per måned når
  modus = per måned.
- **Akse:**
  - X: tidsakse, label-format `MMM YYYY` (`jan 2024`),
    tick hver tredje måned for å unngå overlapping.
  - Y: starter på 0; aksetittel "Akkumulert (€ mrd)" eller
    "Per måned (€ mrd)" avhengig av modus. NOK-modus bytter
    enhet i tittel.
- **Fremheving:** Norge i `--blue-500` (3 px linje). Andre valgte
  land i `--blue-300` (1,5 px linje). Maks 5 land samtidig - hvis
  flere er valgt, vis melding om å begrense.
- **Interaktivitet:**
  - Modus-toggle (akkumulert/per måned) over grafen.
  - Mål, kategori og valuta som sekundære dropdowns.
  - Hover viser eksakt verdi på alle linjer for hover-tidspunktet
    (Plotly `hovermode: "x unified"`).
- **Empty:** "Ingen tidsseriedata. Kjør `normalize` etter at
  valutakurser er hentet."
- **Error:** Standard error-mønster fra 3.1.6.

### 3.3.2 Komparativ profil (small multiples)

- **Spørsmål:** Hvordan ligger Norge an mot utvalgte land på samme
  nøkkeltall?
- **Datakilde:** `country_summary.csv` + `country_summary_relative.csv`
  + `country_summary_endring.csv`.
- **Graftype:** Rutenett av kort (ikke graf i tradisjonell
  forstand, men en small-multiples-implementasjon der hvert kort
  viser samme nøkkeltall for ulike land).
- **Layout:** 3+3+3+3 desktop / 6+6 tablet / 12 mobil
  (jf. 02-prinsippet 2.5).
- **Fremheving:** Norge-kortet får 2 px ramme i `--blue-500` og
  bakgrunn `--blue-50`. Andre kort har standard hvit bakgrunn.
- **Interaktivitet:**
  - Multi-select for land (default S10: Norge + Tyskland +
    Frankrike + Storbritannia).
  - Hurtigknapper: Standard / Norden / EU / G7 / NATO.
- **Tilgjengelighet:** Hvert kort er en `<article>` med
  `<h3>` for landnavnet og `<dl>` for nøkkeltall - lar
  skjermleser hoppe mellom land.

### 3.3.3 Rangering blant giverland

- **Spørsmål:** Hvor på topplista ligger Norge for et gitt mål?
- **Datakilde:** `country_summary.csv` (default mål) eller
  `country_summary_relative.csv` (BNP/per capita) eller
  `country_summary_endring.csv` (endring) eller
  `financial_disbursements.csv` (utbetalt).
- **Graftype:** Sortert horisontal stolpegraf, topp 15.
- **Akse:**
  - X: kvantitativ, starter på 0. Aksetittel reflekterer aktivt
    mål.
  - Y: kategorisk (landnavn), sortert synkende på X.
- **Fremheving:** Norge får `--blue-500`. Andre land får
  `--blue-300`. Norges rad får i tillegg en horisontal
  bakgrunnsstripe i `--blue-50` slik at den finnes raskt.
- **Interaktivitet:** Mål-dropdown lokalt over grafen. PNG-eksport-
  knapp (ikon + "Last ned PNG"). Tooltip viser eksakt verdi og
  rangeringsposisjon ("Norge - 11,50 € mrd, 10. plass av 42").
- **Empty/error:** Standard.

### 3.3.4 Fordeling av Norges støtte (mil/fin/hum)

- **Spørsmål:** Hvordan fordeler Norges støtte seg på militær,
  finansiell og humanitær?
- **Datakilde:** `country_summary.csv` for valgt mål
  (allokering/forpliktelse).
- **Graftype:** Stablet horisontal stolpe (én rad totalt).
  Erstatter dagens donut (`tegnFordeling` i `dashboard.js`).
- **Akse:**
  - X: kvantitativ, fra 0 til total verdi, viser absoluttverdier
    samtidig som segmentene gir andelene.
  - Y: ingen (én rad).
- **Fremheving:** Tre kategori-farger fra sekvensiell palett -
  militær (mørkest), finansiell (medium), humanitær (lysest). Se
  3C for konkret palett.
- **Interaktivitet:** Hvert segment er hover-bart med tooltip som
  viser kategori, € mrd og prosentandel. Klikk på segment kan
  brukes til drill-down (se 3.4).
- **Empty:** Skjules helt hvis Norge mangler data.

### 3.3.5 Scatter (sammenheng mellom mål)

- **Spørsmål:** Er det sammenheng mellom for eksempel BNP-andel og
  per innbygger blant giverland?
- **Datakilde:** `country_summary.csv` + `country_summary_relative.csv`.
- **Graftype:** Scatter, ett punkt per land som har data for
  begge akser.
- **Akse:** Begge starter på 0; aksetittel speiler valgt mål.
- **Fremheving:** Norge som rødt stjerne-symbol med direkte
  etikett "Norge". Andre land som blå punkter (`--blue-300`).
  Når brukeren hover på et punkt, fremheves landnavnet i tooltip.
- **Interaktivitet:** Akse-velger for X og Y (4 valg hver fra
  S11). Filterintegrasjon med komparativ-velgeren: når et
  land er valgt der, fremheves det også her.
- **Direkte etikettering:** maksimalt fem land får tekstetikett
  ved siden av punktet (Norge alltid + de fire valgte i
  komparativ profil) for å unngå overlapping.

### 3.3.6 Endring siden forrige rapport

- **Spørsmål:** Hva endret seg fra forrige Kiel-utgivelse til
  denne?
- **Datakilde:** `endringstekst.json` (tekst) +
  `country_summary_endring.csv` (tall).
- **Visningsformat:** Tekstboks med 2-4 setninger pedagogisk
  klarspråk (eksisterende endringstekst-output) + en kompakt
  delta-stolpe per kategori.
- **Delta-stolpe:** Liten horisontal stolpe (40 px høyde) som
  viser delta i militær/finansiell/humanitær med:
  - Positiv delta i `--positive`,
  - Negativ delta i `--negative`,
  - 0-aksen tydelig sentrert.
- **Empty:** "Kun én Kiel-release lagret enda. Endring vises når
  neste release kommer."

## 3.4 Fargepalett - bruksregler i grafer

Tokens ble definert i 01-prinsippet 1.3. Her angir vi hvordan de
brukes konkret per grafelement, slik at JS-kode i `dashboard.js`
har én sannhet å peke til.

### 3.4.1 Roller og hex

| Rolle | Token | Hex | Brukes til |
|---|---|---|---|
| Norge-fokus | `--blue-500` | `#1d3557` | Norges linje, stolpe, scatter-stjerne |
| Sammenligningsland | `--blue-300` | `#8da9c4` | Andre lands linjer/stolper/punkter |
| Norge-aksent (nedtonet) | `--blue-50` | `#eef2f7` | Bakgrunnsstripe for Norge-rad i tabell og rangeringsgraf |
| Positiv delta | `--positive` | `#2e7d32` | Økning siden forrige release |
| Negativ delta | `--negative` | `#c62828` | Minskning siden forrige release |
| Advarsel | `--warning` | `#ef6c00` | Datakvalitetsmerknader, eks. "kun finansiell utbetaling" |
| Akse, gridlinjer | `--neutral-200` | `#e0e0e0` | Plotly `gridcolor` og `linecolor` |
| Aksetekst | `--neutral-600` | `#555` | Plotly `tickfont.color` og `title.font.color` |

### 3.4.2 Sekvensiell palett (kategorier i fordeling)

For den stablede stolpen i 3.3.4 trenger vi tre nyanser som leser
tydelig på samme rad. Vi bruker en sekvensiell blå-skala (avledet
fra ColorBrewer "Blues"):

| Kategori | Hex | Begrunnelse |
|---|---|---|
| Militær | `#08306b` | Mørkest - tradisjonelt sett som tyngste kategori |
| Finansiell | `#2171b5` | Medium - vanligst støtteform |
| Humanitær | `#6baed6` | Lysest - også symbolsk for "myk" støtte |

Alternativ: vi kan bytte til kategorisk palett senere hvis
sekvensiell tolkning føles feil. Avgjøres ved første brukertest
i M6.3 og dokumenteres i implementasjonsplanen.

### 3.4.3 Divergerende palett (delta)

For delta-stolpen i 3.3.6:

```
−  --negative (#c62828)  ←  hvit (#ffffff)  →  --positive (#2e7d32)  +
```

0 markeres med en synlig vertikal linje i `--neutral-600`.

### 3.4.4 Plotly-tema-konfigurasjon (skisse)

```js
const TEMA = {
  font: { family: "system-ui, sans-serif", color: "#1a1a1a", size: 13 },
  paper_bgcolor: "transparent",
  plot_bgcolor: "transparent",
  xaxis: {
    gridcolor: "#e0e0e0",
    linecolor: "#e0e0e0",
    tickfont: { color: "#555" },
    title: { font: { color: "#555" } },
    zeroline: true,
    zerolinecolor: "#555",
  },
  yaxis: { /* samme som xaxis */ },
  hoverlabel: {
    bgcolor: "#1d3557",
    bordercolor: "#1d3557",
    font: { color: "white", family: "system-ui, sans-serif" },
  },
  margin: { t: 24, r: 16, b: 56, l: 64 },
};
```

Implementeres som én funksjon `tema()` i `dashboard.js` som
returnerer Plotly-layout. Alle render-funksjoner bruker
`Plotly.newPlot(graf, traces, { ...tema(), ...overrides })`.

## 3.5 Interaksjonsmønstre

### 3.5.1 Hover

- Standard Plotly hover beholdes der `hovertemplate` allerede er
  satt opp (gjort i M6.2 PR #25).
- Felles regel: tooltip skal alltid inneholde landnavn først (fet),
  så den aktive metrikken med enhet, så eventuell ekstra kontekst
  (rangering, prosent). Norsk språk og norsk tallformat.
- For tidsseriegrafen brukes `hovermode: "x unified"` slik at alle
  linjer vises samtidig ved hover på et tidspunkt - lettere å
  sammenligne enn punkt-for-punkt.

### 3.5.2 Filter

- Endring av et filter skal gi visuell tilbakemelding (subtilt
  pulse på grafen som oppdateres) og **aldri** flytte seksjonen
  vertikalt. Layout må være "stabil" når innholdet endres.
- Filter-tilstand er ikke vedlikeholdt på tvers av sesjoner i
  første iterasjon. Hvis brukerne etterspør det, vurderes
  `localStorage` i en senere PR.
- URL-parametere (eks. `?land=Norway,Germany`) som persistens er
  utenfor scope for M6.3, men nevnes som mulig forbedring i
  implementasjonsplanen.

### 3.5.3 Drill-down

- I første iterasjon støtter vi én grunn drill-down: klikk på et
  segment i fordelingsgrafen (3.3.4) filtrerer tidsseriegrafen
  (3.3.1) til den valgte kategorien. Visuell og funksjonell
  kobling forklares med en kort tekst over fordelingen ("Klikk
  på et segment for å se utviklingen").
- Vi unngår dypere drill-down i M6.3 fordi det krever modale
  dialoger eller side-paneler som ikke har plass i layouten.

### 3.5.4 Eksport

- **PNG-eksport per graf:** Plotly har innebygd `toImage`. Vi
  legger en `.knapp-sekundaer` over hver graf med tekst "Last ned
  PNG" og bruker `Plotly.downloadImage(graf, { format: "png",
  width: 1200, height: 700, filename: "kiel-<seksjon>-<dato>" })`.
- **CSV-eksport totalt:** I footer plasseres en
  "Last ned alle data (CSV)"-knapp som lager en zip av filene i
  `data/processed/` ved hjelp av `JSZip` eller (enklere) ved at
  hver fil har egen lenke. Konkret valg gjøres i 04.
- **CSV-eksport per visning:** Lavere prioritet, kommer eventuelt
  i en senere iterasjon.

### 3.5.5 Tilstandsendringer og fokus

- Når en tilstand endres (ny graf rendret, filter brukt) flyttes
  ikke fokus automatisk. WCAG 2.4.3 / 3.2.2 - vi unngår uventet
  tap av kontekst.
- Skjermlesere får live-region-meldinger ved store oppdateringer
  via en `aria-live="polite"`-region som ligger skjult i headeren
  ("Tidsseriegraf oppdatert med valgte land.").