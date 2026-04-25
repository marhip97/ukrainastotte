# M6.3 Designprinsipper

Dette dokumentet beskriver fundamentet for det visuelle redesignet i
M6.3. Det styrer alle senere valg om informasjonsarkitektur,
komponenter og graftyper.

## 1.1 Innledning og målgruppe

### Hva dashboardet skal støtte

Dashboardet på <https://ukrainastotte.netlify.app/> er et
beslutnings- og kommunikasjonsverktøy. Det henter offentlig
publiserte tall fra Kiel Institute Ukraine Support Tracker og
presenterer dem med Norge som referansepunkt. Tre typer
brukerbehov er styrende:

1. **Faktasjekk under tidspress** - en journalist eller utreder skal
   kunne lande et korrekt tall (Norges andel av BNP, rangering blant
   giverland, endring siste utgivelse) i løpet av sekunder, uten å
   måtte tolke ukjente begreper.
2. **Sammenligning** - en analytiker skal kunne sette Norges innsats
   opp mot utvalgte andre land eller landgrupper (Norden, EU, G7,
   NATO) på samme nøkkeltall.
3. **Forklaring** - en kommunikasjonsrådgiver skal kunne lese den
   automatisk genererte endringsteksten og bruke den i mediearbeid,
   med metode-merknad som tydelig forklarer forbeholdene.

### Målgruppe

Brukerveiledningen (`docs/brukerveiledning.md`) angir tre primære
grupper: journalister, utredere og forskere. De har til felles at
de:

- ikke nødvendigvis har dashboard- eller statistikkbakgrunn,
- jobber norsk, og forventer norsk tekst og tallformatering,
- kan trenge å sitere tall i tekst og oppgi metode-kilde.

Sekundær gruppe er informerte allmennlesere som kommer fra en
nyhetsartikkel eller sosiale medier og bare vil se "tallene for
Norge".

### Brukskontekst

| Faktor | Antakelse |
|---|---|
| Skjerm | Skrivebord (1280-1920 px bredde) som primær. Mobil og nettbrett må fungere, men er sekundære. |
| Sesjonslengde | 1-5 minutter per besøk (rask faktasjekk) eller 10-15 minutter (analytisk arbeid). |
| Nettverk | Bredbånd; tålegrense for første lasting er 3 sekunder iht. delmål 4 i prosjektplanen. |
| Frekvens | Brukes ukentlig av faste brukere; sjeldnere av engangsbesøkende. |
| Forkunnskap | Forventer ikke kjennskap til Kiels begrepsapparat (allocation, commitment, disbursement). Begrepene må forklares lokalt. |

### Konsekvenser for designet

- **Klar oppsummering først.** Norges nøkkeltall skal være lesbare
  uten å scrolle, slik at faktasjekk-brukeren får svaret umiddelbart.
- **Norsk språk og tallformat gjennomgående** (mellomrom som
  tusenskille, komma som desimal, "milliarder" skrevet ut når plassen
  tillater det).
- **Forklaring der det trengs.** Begreper som "allokering" og
  "forpliktelse" får forklaringer ved hover eller som inline-notat.
- **Sterk responsiv adferd, men prioriter desktop.** Layouten må ikke
  knekke på mobil, men trenger ikke optimaliseres for små skjermer.

## 1.2 Visuelt hierarki

Et hierarki er et hjelpemiddel for å lede leseren gjennom innholdet
i ønsket rekkefølge uten at hen må tenke. I dagens dashboard
(`src/dashboard/index.html`) er hierarkiet flatt: alle seks
KPI-kortene har samme visuelle vekt, og donutgrafen for fordeling
konkurrerer med rangeringsgrafen om oppmerksomhet. M6.3 skal
etablere et tre-nivå hierarki som speiler brukerens spørsmål.

### Tre nivåer

1. **Førstenivå - umiddelbar fakta.** Ett samlet KPI-kort eller en
   kort tekstboks (max to setninger) som svarer på "hvor mye gir
   Norge til Ukraina, og hvordan ligger vi an?". Skal være lesbart
   uten å scrolle på skjermer ned til 1280 × 720.
2. **Andrenivå - kontekst og sammenligning.** Tidsseriegraf,
   komparativ profil, rangering. Disse besvarer "hvordan har det
   utviklet seg" og "hvordan ligger vi an mot andre".
3. **Tredjenivå - utforsking og metode.** Scatter, filtre,
   visningsbryter, beslutningssaker, metode-merknader.

### Verktøy for å skape hierarki

| Verktøy | Bruksregel i M6.3 |
|---|---|
| Størrelse | Hovedtall (Norges total allokering) i stor variabel skala (3-4× så stort som beskrivelse). Andrenivå-tall ca. 1,5×. |
| Kontrast | Kun hovedtall får full forgrunnsfarge (`--text-primary`); etiketter og beskrivelser får dempet farge (`--text-secondary`). |
| Plassering | Viktigste innhold øverst-til-venstre der øyet treffer først. Filtre og kontroller plasseres til høyre for grafen de styrer, ikke globalt øverst. |
| Gruppering | KPI-kort grupperes i én kolonne (ikke seks adskilte kort), atskilt fra grafer med tydelig white space. |
| Tyngde | Bruk vekt før farge: heavy/600 for KPI, regular/400 for tekst. Farge reserveres for fremheving (Norge) og status. |

### Lesemønster

Brukeren leser i et **F-mønster** når innholdet er tekstdrevet og
**Z-mønster** når det er bildedrevet. Dashboardet er hybrid:
toppseksjonen er tallorientert (Z-mønster - blikket går
top-left → top-right → bottom-left), mens midten er listebasert
(F-mønster - blikket scanner venstre kant). Layouten må respektere
dette:

- Hovedtall og status-indikator (delta) plasseres i en horisontal
  rad øverst, slik at Z-mønsteret leverer dem i ønsket rekkefølge.
- Rangeringslister og komparativ-kort følger F-mønster: viktigst
  attributt (landnavn + total) på venstre kant.
- Sekundære filtre høyrejusteres så de ikke konkurrerer med
  innholdet på første blikk.

### Plassering av viktigste KPI

Det dominerende tallet er **Norges total allokering** uttrykt i
milliarder euro, fordi det er tallet flest brukere oppgir i tekst
(jf. brukerveiledningen). Dette tallet får sentral
"hero"-plassering på første nivå med tre støtte-elementer rundt:

- Endring siden forrige Kiel-utgivelse (delta som viser retning).
- Norges rangering blant giverland (kontekst).
- Andel av BNP (relativ målestokk).

De tre støtte-elementene har samme typografiske vekt, men mindre
størrelse enn hovedtallet, slik at de leses som "rundt" tallet,
ikke som likestilte alternativer.

## 1.3 Typografi og fargebruk

### Skriftvalg

Dagens dashboard bruker systemfont-stakken (`-apple-system,
BlinkMacSystemFont, "Segoe UI", Roboto`). Det fortsetter vi med
fordi:

- Den krever ingen ekstra nedlastning og holder
  førstelastingen under 3 sekunder (delmål 4 i prosjektplanen).
- Den ser hjemmehørende ut på alle plattformer.
- Den dekker nordiske tegn uten ekstra konfigurasjon.

For tabulære tall (KPI-er, rangering, datoer) bruker vi
`font-variant-numeric: tabular-nums` slik at sifrene har lik
bredde og kolonnene flukter visuelt.

### Skriftskala

Typografisk skala basert på et 1,25-forhold (major third) gir
nok kontrast mellom nivåer uten å bli skrikende:

| Rolle | Størrelse | Vekt | Bruk |
|---|---|---|---|
| Hero-tall | 3,0 rem | 700 | Hovednøkkeltall (Norges total allokering). |
| H1 | 1,75 rem | 700 | Sidetittel. |
| H2 | 1,375 rem | 600 | Seksjonsoverskrifter. |
| H3 | 1,125 rem | 600 | Kort-overskrifter. |
| Body large | 1,0625 rem | 400 | Endringstekst (pedagogisk klarspråk). |
| Body | 1,0 rem | 400 | Standard brødtekst. |
| Caption | 0,875 rem | 400 | Etiketter, metode-merknader. |
| Micro | 0,8125 rem | 500 | Kildehenvisning, fotnoter. |

Linjehøyde 1,5 for brødtekst, 1,2 for overskrifter og 1,1 for
hero-tall. `max-width: 70ch` på lengre tekstavsnitt for lesbarhet.

### Fargestrategi

M6.3 skifter fra dagens røde aksent (`#d71418`) til en blå palett
som primær identitet. Begrunnelse:

- Blå er nøytral, profesjonell og knyttes til finansiell/analytisk
  formidling - i tråd med målgruppen (utredere, journalister).
- Rød reserveres for negativ delta (minskning) og advarsler, der
  kulturell betydning er etablert.
- Grønn reserveres for positiv delta og bekreftelse.

### Semantisk fargebruk

| Variabel | Hex | Bruk |
|---|---|---|
| `--blue-900` | `#0b2545` | Sidebakgrunn på header / mørke aksenter. |
| `--blue-700` | `#13315c` | Hovedtekstfarge mot lys bakgrunn. |
| `--blue-500` | `#1d3557` | Primær aksent (Norge i grafer, knapper). |
| `--blue-300` | `#8da9c4` | Sammenligningsland i grafer. |
| `--blue-50` | `#eef2f7` | Sidebakgrunn lys. |
| `--neutral-900` | `#1a1a1a` | Forgrunn på lys. |
| `--neutral-600` | `#555` | Etiketter, metode-notat. |
| `--neutral-200` | `#e0e0e0` | Linjer, kortkanter. |
| `--neutral-50` | `#f8f9fa` | Kort-bakgrunn. |
| `--positive` | `#2e7d32` | Positiv delta (økning). |
| `--negative` | `#c62828` | Negativ delta (minskning). |
| `--warning` | `#ef6c00` | Datakvalitetsadvarsler. |

Disse verdiene forankres i `:root`-blokken i `styles.css` slik at
all tematisering går gjennom CSS-variabler. Eksisterende
`--accent: #d71418` flyttes til `--accent-norge-historisk` (kan
brukes der vi ønsker å markere "Norge" spesielt) eller fjernes.

### Kontrastkrav (WCAG 2.2 AA)

Alle valgte par må møte WCAG 2.2 AA: minst 4,5:1 for normaltekst,
3:1 for stor tekst (≥18,66 px regular eller ≥14 px bold) og
3:1 for grafiske elementer som ikoner og graflinjer.

Verifiserte kombinasjoner (målt med WCAG-formelen i utviklings-Steg 1):

| Forgrunn / bakgrunn | Kontrast | Vurdering |
|---|---|---|
| `--blue-700` på `--neutral-50` | 12,29:1 | AAA |
| `--blue-500` på hvit | 12,36:1 | AAA |
| `--neutral-900` på `--neutral-50` | 16,51:1 | AAA |
| `--neutral-600` på hvit | 7,46:1 | AAA |
| `--positive` på hvit | 5,13:1 | AA |
| `--negative` på hvit | 5,62:1 | AA |
| `--blue-300` på hvit (graf-streker) | 3,70:1 | AA grafikk (1.4.11) |
| `--kategori-humanitaer` på hvit | 3,41:1 | AA grafikk |

Merknader fra verifiseringen:

- `--blue-300` ble justert fra `#8da9c4` til `#5d8aaa` for å
  passere 3:1-kravet for grafiske elementer (WCAG 1.4.11).
- `--kategori-humanitaer` ble justert fra `#6baed6` til `#4292c6`
  av samme grunn. Inter-segment-kontrasten i den stablede stolpen
  er 1,5:1, så hver kategori-segment må tegnes med 1 px ramme i
  `--blue-900` slik at segmentene tydelig skiller seg fra
  hverandre uavhengig av bakgrunn.
- `--warning` (`#ef6c00`) har kontrast 3,08:1 mot hvit. Den brukes
  derfor kun til ikoner og rammer (WCAG 1.4.11), aldri til
  brødtekst.

Kontrast skal verifiseres i CI før hver M6.3-PR (planlegges som del
av implementasjonsplanen, dokument 04).

## 1.4 Datavisualiseringsprinsipper

Disse prinsippene styrer alle valg om grafer i komponentdokumentet
(03). Vi forankrer oss i tre kilder: Edward Tufte (data-ink ratio,
small multiples), Stephen Few (klar oppgave, sparsom dekorasjon),
og Tamara Munzner (matche graftype mot oppgave og datatype).

### Grafvalg etter spørsmål, ikke etter datatype

Spørsmålet brukeren stiller, ikke datatypen alene, avgjør
graftypen. Munzners *task abstraction* gir oss seks
hovedoppgaver:

| Brukerens spørsmål | Foretrukken graf | Brukes i M6.3 til |
|---|---|---|
| "Hvor mye?" (én verdi) | Stort tall + kontekst-linje | Hero-KPI, kort i komparativ profil |
| "Rangering?" (sortering) | Horisontal stolpe (sortert) | Topp 15 giverland, andel BNP |
| "Utvikling over tid?" | Linje (eller stolpe per periode) | Tidsserie akkumulert / per måned |
| "Hvordan fordeler det seg?" | Stablet stolpe eller small multiples | Militær/finansiell/humanitær fordeling |
| "Sammenheng mellom to mål?" | Scatter med direkte etikettering | BNP-andel mot per capita |
| "Endring fra forrige?" | Bullet eller delta-stolpe | Endring siste release |

Donutgrafen i dagens dashboard bryter med dette: den viser
fordeling, men gjør det med en form (sirkel) som er svakere enn
stablet stolpe for å sammenligne andeler. Den erstattes i M6.3.

### Data-ink ratio

Tufte definerer data-ink som den visuelle inken som faktisk bærer
informasjon. Alt annet er chartjunk. Konkrete regler for M6.3:

- **Ingen 3D**, ingen skygger, ingen gradienter i selve grafen.
- **Aksene må ikke ha unødige tegn.** Vi skjuler topp/høyre akse-rammer.
- **Gridlinjer dempes** (1 px, lys grå) eller fjernes der det går.
  Beholdes på y-akse for stolpegrafer der visuell sammenligning
  trenger referansepunkt.
- **Ingen unødige farger.** Hver brukt farge må forklare noe (Norge
  fremheves; sammenligningsland deles én farge; positiv/negativ
  delta får sine reserverte farger).
- **Akseetiketter erstattes med direkte etikettering** der mulig.
  Eksempel: i komparativ profil skriver vi "Norge: 11,5 € mrd"
  direkte ved punktet i scatter-grafen, slik at brukeren slipper å
  bruke legend.

### Konsistent aksebruk

- **Y-akse starter på 0** for stolpegrafer. Alltid. Brudd fra dette
  må eksplisitt merkes i metode-notat.
- **Akseenheter står i akseoverskriften**, ikke som etikett etter
  hvert tall. Eksempel: aksetittel "Total allokering (€ mrd)",
  ikke "11,5 € mrd, 8,4 € mrd, ...".
- **Tidsakse formateres som "MMM YYYY"** for månedsnivå
  (`jan 2024`, `feb 2024`). Ikke ISO-streng (`2024-01`).
- **Tall over 1 000** får mellomrom som tusenskille
  (`1 250` i stedet for `1,250` eller `1250`). Implementeres via
  `toLocaleString("nb-NO")`.

### Når tabell er bedre enn graf

Tabell foretrekkes når:

- Brukeren skal lese eksakte verdier (ikke sammenligne størrelser).
- Det er flere mål per enhet (eks. land × seks nøkkeltall).
- Det er færre enn tre datapunkter (én linje med to land er ikke
  graf, det er en setning).

Dagens KPI-kort er strengt tatt en tabell formatert som kort. I
M6.3 vurderer vi å gjeninnføre eksplisitt tabellvisning for
"vis alle giverland" der brukeren ofte trenger eksakte tall.

### Fargebruk i grafer

- **Fokus-først.** Norge tegnes med `--blue-500`, øvrige land med
  `--blue-300`. Differansen ligger i mettethet, ikke fargefamilie -
  det fungerer for fargeblinde også.
- **Sekvensiell palett** brukes til ordnede serier (eks.
  fordeling - militær < finansiell < humanitær på alvor-skala).
  Kandidat: ColorBrewer "YlGnBu".
- **Divergerende palett** for positiv/negativ delta:
  `--negative` ↔ nøytral hvit ↔ `--positive`.
- **Maks fem fargekategorier i ett diagram.** Trenger vi flere,
  bytter vi til small multiples.

### Small multiples

For komparativ profil og fordelingsdiagrammer foretrekker vi
small multiples (rutenett av like grafer, én per land/kategori)
over kompleks lagring i én graf. Eksempel: i stedet for én stablet
stolpegraf med fem land × tre kategorier, lager vi fem små
horisontale stolpegrafer i et 5-kolonne grid, alle med samme
x-akse-skala. Da ser brukeren forskjellen mellom land uten å måtte
plukke fra hverandre stablede komponenter.

## 1.5 Tilgjengelighet og inkluderende design

WCAG 2.2 AA er minstekravet for offentlig finansierte og
informasjonsformidlende dashboards i Norge. Dashboardet er
allerede semi-offentlig (deployet på Netlify uten tilgangskontroll),
så vi sikter på AA gjennom hele M6.3.

### Praktiske krav (utvalg fra WCAG 2.2 AA)

| Suksesskriterium | Konsekvens for M6.3 |
|---|---|
| 1.4.3 Kontrast (minimum) | Alle tekst/bakgrunn-kombinasjoner ≥ 4,5:1 (verifisert i 1.3). |
| 1.4.11 Ikke-tekstlig kontrast | Knapper, ikoner og graflinjer ≥ 3:1 mot bakgrunn. |
| 1.3.1 Info og relasjoner | Bruk semantisk HTML (`<header>`, `<main>`, `<section>`, `<h2>`, `<dl>`). Ikke `<div>` for alt. |
| 1.4.10 Reflow | Layout fungerer ned til 320 px bredde uten horisontal scroll. |
| 2.1.1 Tastatur | Alle interaktive elementer (filtre, knapper, dropdowns, grafer) når- og betjenbare med tastatur. |
| 2.4.7 Synlig fokus | Tydelig fokusring (3 px `outline` med høy kontrast) på alle interaktive elementer. |
| 1.4.13 Innhold ved hover/fokus | Tooltips kan ikke kreve presisjons-hover; må kunne nås via fokus og være lukkbare med Esc. |
| 2.5.7 Drag-bevegelser (ny i 2.2) | Ingen funksjonalitet skal kreve drag - alt må kunne gjøres med klikk. |

### Fargeblindhet og redundant koding

Cirka 8 % av menn har en form for fargesynssvakhet (oftest
deuteranopia). Fargen alene må aldri være eneste informasjonsbærer:

- **Positiv/negativ delta** signaliseres med både farge og tegn
  (`+` / `−`) og pilretning (`▲` / `▼` som tekst, ikke bilde).
- **Norge i grafer** fremheves med både farge (`--blue-500` mot
  `--blue-300`) og symbol (stjerne, fet ramme, eller direkte
  etikett).
- **Visningsbryter** viser aktiv tilstand med både fargeendring
  og fet vekt eller en understrek-linje.

### Tastaturnavigasjon

- Tab-rekkefølgen skal følge visuelt hierarki (top-down,
  left-right). Implementeres ved at DOM-rekkefølge speiler
  layouten - ikke ved hjelp av `tabindex` med tall (anti-mønster).
- Plotly-grafer eksponeres som "img"-rolle med `aria-label` som
  oppsummerer datapunktene, slik at skjermleser-brukere får
  alternativ representasjon. For tidsserien legger vi inn en
  parallell `<table>` som er visuelt skjult men leselig av
  skjermleser.

### Skjermlesere

- Hver seksjon skal ha et tilhørende `<h2>`-element slik at
  skjermlesere kan hoppe mellom seksjoner med "h"-tasten.
- KPI-kort: hovedtall får `aria-describedby` som peker til
  etiketten, slik at skjermleser leser "11,5 milliarder euro
  total allokering" i stedet for å lese tall og etikett som to
  uavhengige tekster.
- Tooltips i grafer dupliseres som tabell under grafen
  (visuelt skjult med `.sr-only`).

### Redusert bevegelse

Plotly har subtile inn-animasjoner ved første render og ved
oppdatering av filtre. Brukere som har satt `prefers-reduced-motion`
i operativsystemet skal få disse slått av:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

Plotly-konfigurasjon: `transition: { duration: 0 }` når mediaquery
er aktiv.

### Verifisering

- Automatisk linting med `axe-core` integreres i Netlify-build
  (planlegges i dokument 04).
- Manuell sjekk på minst tre skjermstørrelser (320 px / 768 px /
  1440 px) før merge.
- Tastaturtest: kun tastatur fra topp til bunn av siden.
- Skjermleser-test: VoiceOver (Mac) eller NVDA (Windows) på
  hovedflyten.
