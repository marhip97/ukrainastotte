# M6.3 Informasjonsarkitektur og layout

Dette dokumentet beskriver hvordan dashboardet er organisert
visuelt og strukturelt: rekkefølgen på seksjoner, hva som ligger
"above the fold", grid-systemet, responsive breakpoints og en
wireframe som viser plassering på desktop og mobil.

Bygger videre på prinsippene i `01-principles.md` (seksjon 1.2
"Visuelt hierarki" definerer tre-nivå hierarkiet som styrer
prioriteringen her).

## 2.1 Seksjonsinndeling

Dashboardet deles i syv seksjoner i én vertikal flyt. Rekkefølgen
er strengt prioritert: hver seksjon dekker en spesifikk
brukerintensjon, og brukere som bare bruker første seksjon skal
likevel få et komplett svar på "hvor mye gir Norge?".

| # | Seksjon | Intensjon | Hierarki-nivå |
|---|---|---|---|
| 1 | Header | Identitet, kilde, sist oppdatert | Bakgrunn |
| 2 | Norge i tall (hero) | Faktasjekk på sekunder | Førstenivå |
| 3 | Endring siden forrige rapport | Forklare nyheten | Førstenivå |
| 4 | Tidsserie | Utvikling over tid | Andrenivå |
| 5 | Komparativ landprofil | Sammenligning mot andre | Andrenivå |
| 6 | Rangering blant giverland | Posisjonering | Andrenivå |
| 7 | Sammenheng mellom mål (scatter) | Utforskning | Tredjenivå |
| 8 | Metode og kilde (footer) | Forbehold, dokumentasjon | Bakgrunn |

Visningsbryteren fra dagens dashboard (`<select id="visning">`)
flyttes og deles: den som styrer rangeringen blir en lokal
kontroll innenfor seksjon 6; valuta-toggle (EUR/NOK) blir en
lokal kontroll i seksjon 4 (tidsserie). Vi unngår én global
bryter som styrer flere grafer samtidig - det skaper kobling
mellom seksjoner som er forvirrende ved scrolling.

## 2.2 Prioritering ovenfra og ned

### Above the fold (1280 × 720 desktop)

Brukeren skal kunne lese seksjon 1 (header) og 2 (Norge i tall)
uten å scrolle. Det betyr ca. 720 px tilgjengelig høyde minus
header og luft - i praksis ~520 px disponibel høyde for
hero-tallene. Hero-seksjonen designes derfor med:

- Ett dominerende tall (Norges total allokering) i ca. 3 rem.
- Tre støtte-tall (delta, rangering, andel BNP) i ca. 1,5 rem på
  rad ved siden av eller under hovedtallet.
- Kort metode-merknad i caption-størrelse (0,875 rem).

Ved første scroll-trykk skal brukeren lande midt i seksjon 3
(endringstekst), ikke bli stående på en mellomtilstand.

### Mid-fold (700-1500 px scroll)

Tidsserie og komparativ profil. Disse er de mest brukte
analyseverktøyene og har størst plass-bruk (typisk 420-500 px
høyde per graf). De plasseres her fordi:

- Brukere som leser seksjon 2 og vil "vite mer" går naturlig
  videre til "hvordan har det utviklet seg" (seksjon 4).
- Komparativ profil bygger på det, men krever interaksjon
  (multivelger) som er mest naturlig når brukeren har bestemt
  seg for å gå dypere.

### Bunn-fold (>1500 px)

Rangering og scatter. Rangering er fortsatt en viktig graf,
men flyttes ned fordi:

- Norges plassering er allerede gitt i seksjon 2 (rangerings-tall).
- Toppliste-grafen er tett innholdsmessig og krever mer scrollplass.

Scatter er rent eksplorativt og hører hjemme nederst som
"verktøy for de som vil grave dypere". Den får aldri pre-fokus
fra hierarkiet.

## 2.3 Informasjonshierarki innen seksjoner

Hver seksjon følger samme tre-deling:

```
┌── Overskrift (H2) ──────────────────────────────────┐
│                                                     │
│  Innhold (graf, kort, tekst)                        │
│                                                     │
│  Kontroll (filter, dropdown, knapp) - ved behov     │
│                                                     │
│  Metode-merknad (caption) - alltid                  │
└─────────────────────────────────────────────────────┘
```

Kontrollene plasseres **inni** seksjonen, ikke i en global
verktøylinje. Dette holder kontroll og effekt nær hverandre og
unngår at brukeren må huske hvilken bryter styrer hva.

Metode-merknad er obligatorisk på alle datavisende seksjoner.
Dette er allerede mønsteret i dagens dashboard
(`.metode-notat` i `styles.css`), og videreføres.

## 2.4 Aktive elementer som ikke er seksjoner

Tre globale elementer eksisterer på tvers av seksjonsstrukturen:

1. **Skip-link** ("Hopp til hovedinnhold") som bare vises ved
   tastaturfokus. WCAG 2.4.1 Bypass Blocks.
2. **Eksportknapper** (planlegges i M6.3): én knapp per graf for
   PNG-eksport, og én global "last ned data som CSV"-knapp i
   footer. Plasseres lokalt ved hver graf for PNG.
3. **Fokus-indikator** for landgrupper (Norden/EU/G7/NATO).
   Foreslås som en sticky filter-bar som kan slås på/av; styrer
   hvilke land som vises i seksjon 5, 6 og 7. Avklares i bolk 2B.

## 2.5 Grid-system

Vi innfører et 12-kolonne fluid grid med faste gutter.
12 kolonner gir naturlig deling i halv (6+6), tredjedeler (4+4+4)
og fjerdedeler (3+3+3+3) - dekker alle layoutbehov vi har
identifisert.

### Kontainer- og kolonnedimensjoner

| Token | Verdi | Beskrivelse |
|---|---|---|
| `--container-max` | `1200px` | Maksimal innholdsbredde |
| `--container-pad-desktop` | `2rem` | Sidemarg desktop |
| `--container-pad-tablet` | `1.5rem` | Sidemarg nettbrett |
| `--container-pad-mobile` | `1rem` | Sidemarg mobil |
| `--gutter` | `1.5rem` | Avstand mellom kolonner |
| `--section-gap` | `3rem` | Avstand mellom seksjoner |

CSS-implementasjon (skisse til 03-dokumentet):

```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--gutter);
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-pad-desktop);
}

.col-span-12 { grid-column: span 12; }
.col-span-8  { grid-column: span 8;  }
.col-span-6  { grid-column: span 6;  }
.col-span-4  { grid-column: span 4;  }
.col-span-3  { grid-column: span 3;  }
```

### Standard kolonneoppsett per seksjon

| Seksjon | Desktop | Tablet | Mobil |
|---|---|---|---|
| Header | 12 | 12 | 12 |
| Hero KPI | 4+4+4 (tall + tre støtte) eller 6+6 | 6+6 | 12 |
| Endringstekst | 8+4 (tekst + meta) | 12 | 12 |
| Tidsserie | 12 (graf) + 12 (kontroller under) | 12+12 | 12+12 |
| Komparativ profil | 3+3+3+3 (kort) | 6+6 | 12 |
| Rangering | 8+4 (graf + kontroll) | 12+12 | 12+12 |
| Scatter | 8+4 (graf + akse-velger) | 12+12 | 12+12 |
| Footer | 12 | 12 | 12 |

## 2.6 Responsive breakpoints

Vi bruker tre breakpoints. Dette holder antall vedlikeholdspunkter
nede og dekker de tre faktiske skjerm-klassene som målgruppen
bruker (smarttelefon, nettbrett, skrivebord).

| Token | Min-bredde | Beskrivelse |
|---|---|---|
| `--bp-mobil` | 0 px | Standard (mobile-first basislinje) |
| `--bp-tablet` | 768 px | Nettbrett portrett, små bærbare |
| `--bp-desktop` | 1100 px | Skrivebord og store bærbare |

### Adferd per breakpoint

- **0-767 px (mobil):** alle kolonner blir 12-bredde (én stable),
  tabeller får horisontal scroll inni egen container,
  filter-knapper stables vertikalt. Plotly-grafer beholder fast
  høyde 320 px.
- **768-1099 px (tablet):** halv eller tredels-deling tillates,
  men aldri fjerdedeler. Komparativ profil viser 2 kort per rad
  (ikke 4).
- **≥ 1100 px (desktop):** full 12-kolonnedeling. Grafer kan ta
  inntil 540 px høyde der det gir mening (tidsserie, scatter).

`min-width`-baserte mediaqueries fordi det er mobile-first:

```css
@media (min-width: 768px)  { /* tablet+ */ }
@media (min-width: 1100px) { /* desktop+ */ }
```

## 2.7 ASCII-wireframe (desktop, ≥ 1100 px)

```
┌─────────────────────────────────────────────────────────────────┐
│  Norges støtte til Ukraina                                       │
│  Kilde: Kiel Ukraine Support Tracker. Sist oppdatert: 2026-04-25 │
└─────────────────────────────────────────────────────────────────┘

┌──── Norge i tall ───────────────────────────────────────────────┐
│                                                                  │
│   ┌──────────────────┐   ┌────────────┐ ┌────────────┐          │
│   │      11,5         │   │  +1,5 € mrd │ │  10. plass  │          │
│   │     € mrd         │   │   (+15 %)   │ │  av 42      │          │
│   │ Total allokering  │   │  Endring   │ │ Rangering  │          │
│   └──────────────────┘   └────────────┘ └────────────┘          │
│                                                                  │
│   Andel av BNP: 2,23 %    Per innbygger: 1 796 EUR              │
│   Kilde: Kiel R28 + Verdensbanken WDI 2024 (S2, S6).            │
└─────────────────────────────────────────────────────────────────┘

┌──── Endring siden forrige Kiel-rapport ─────────────────────────┐
│  Norges totale støtte til Ukraina økte med 1,5 milliarder euro  │
│  (+15 %) siden forrige Kiel-rapport. Økningen kommer            │
│  hovedsakelig fra nye militære allokeringer ...                 │
│                                                                  │
│  Generert 2026-04-25 fra release 28 vs release 27.              │
└─────────────────────────────────────────────────────────────────┘

┌──── Tidsserie ──────────────────────────────────────────────────┐
│  [Modus: Akkumulert ▾]  [Mål: Allokering ▾]  [Valuta: EUR ▾]    │
│                                                                  │
│  ┌──────────────────────────────────────────────┐               │
│  │   /\        /─\        /\                    │               │
│  │  /  \  /\  /   \  /\  /  \  ...              │  Tidsseriegraf │
│  │ /    \/  \/     \/  \/                       │  (linje +      │
│  │/                                              │   stolper)    │
│  └──────────────────────────────────────────────┘               │
│  Aktiviteter uten dato er utelatt fra tidsserien.               │
└─────────────────────────────────────────────────────────────────┘

┌──── Komparativ landprofil ──────────────────────────────────────┐
│  [Velg gruppe: Standard | Norden | EU | G7 | NATO]              │
│                                                                  │
│  ┌─Norge─────┐ ┌─Tyskland──┐ ┌─Frankrike─┐ ┌─Storbritannia─┐    │
│  │ 11,5 € mrd│ │ 18,4 € mrd│ │  3,8 € mrd│ │ 17,2 € mrd    │    │
│  │ 2,23 % BNP│ │ 0,42 % BNP│ │ 0,13 % BNP│ │ 0,55 % BNP    │    │
│  │ 1 796 EUR │ │   220 EUR │ │    56 EUR │ │   254 EUR     │    │
│  │ rang 10/42│ │  rang 1/42│ │ rang 14/42│ │  rang 4/42    │    │
│  └───────────┘ └───────────┘ └───────────┘ └───────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌──── Rangering blant giverland ──────────────────────────────────┐
│  [Mål: Total allokering ▾]                       [↓ PNG]        │
│                                                                  │
│  Tyskland   ████████████████████████  18,4                      │
│  Storbr.    █████████████████████     17,2                      │
│  ...                                                             │
│  Norge      ███████████████   11,5  ← (uthevet)                 │
│  ...                                                             │
└─────────────────────────────────────────────────────────────────┘

┌──── Sammenheng mellom mål (scatter) ────────────────────────────┐
│  [X: Andel BNP ▾]   [Y: Per innbygger ▾]                        │
│                                                                  │
│  Per innbygger ▲                                                │
│   2 000   ●Norge                                                │
│         ●  ●                                                    │
│   1 000      ●  ●                                               │
│              ● ●  ●                                             │
│        0 ──────────────────────▶ Andel BNP                      │
│           0     1     2     3                                    │
└─────────────────────────────────────────────────────────────────┘

┌──── Metode og kilde ────────────────────────────────────────────┐
│  Kilde: Kiel Institute. Beslutningsdokumenter: S2, S6, S8.       │
│  [Last ned alle data (CSV)]                                      │
└─────────────────────────────────────────────────────────────────┘
```

## 2.8 Mobil-wireframe (320-767 px)

```
┌──── Header ────┐
│  Norges støtte │
│  Kiel ...      │
└────────────────┘

┌──── Norge ─────┐
│   11,5 € mrd   │
│  Total alloc.  │
│ ─────────────  │
│  +1,5 (+15 %)  │
│  Endring       │
│ ─────────────  │
│  10/42         │
│  Rangering     │
└────────────────┘

┌── Endringstekst ┐
│  Norges totale  │
│  støtte ...     │
└─────────────────┘

┌── Tidsserie ────┐
│  Modus ▾        │
│  Mål ▾          │
│  ┌───────────┐  │
│  │ graf      │  │
│  └───────────┘  │
└─────────────────┘

(seksjonene fortsetter i samme orden, alle 12-kolonne)
```

## 2.9 Konsekvenser for eksisterende kode

- `src/dashboard/styles.css` får én ny `.grid`-klasse og
  `.col-span-N`-utility-klasser. Eksisterende `.nokkel-tall`
  (auto-fit grid) avvikles til fordel for eksplisitt
  12-kolonneoppsett.
- `src/dashboard/index.html` restruktureres seksjon for seksjon
  iht. 2.1. DOM-rekkefølge må samsvare med fold-prioritering i 2.2.
- `src/dashboard/dashboard.js`: ingen endring i logikken for å
  hente data, men render-funksjonene må peke til nye DOM-IDer
  (eks. `tegnFordeling` får ny container fordi donutgrafen
  erstattes; se 03-dokumentet).
