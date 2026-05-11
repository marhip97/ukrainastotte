# Fasitverdier for M7 migrerings-QA

**Kilde:** Brukernes excel-arbeidsverktøy (FINs interne arbeidsfil),
arkene "Aggregert per land", "2025" og "2026".
**Ekstrahert:** 2026-05-11.
**Basert på Kiel-data:** Release 28 (data til og med 28. februar 2026).

Disse verdiene brukes som gyldne tall i:

1. M7.0 - migrerings-QA-rapport: dashboardets nye tall etter migrering
   skal samsvare med disse verdiene innenfor 1 prosent toleranse.
2. M7.3 og senere - automatiserte krysssjekk-tester (`scripts/qa_krysssjekk.py`
   utvides med disse verdiene som forventede tall for Release 28).

Ved nye Kiel-releaser må fasitverdiene reproduseres ved å kjøre dashboardets
egne beregninger (etter migreringen er fullført). Tallene under er
release-spesifikke og må ikke brukes på senere releaser uten reproduksjon.

## Hva dashboardet skal lese direkte fra Kiel-rådata

Etter migreringen henter dashboardet alle nødvendige metode-konstanter
direkte fra Kiels offisielle XLSX. Det betyr at FINs excel-fil ikke
brukes som løpende datakilde - kun som engangs-referanse for å verifisere
at metoden er implementert riktig.

| Tall | Kilde i Kiel-XLSX |
|---|---|
| Verdier per aktivitet (redistr) | `Bilateral Assistance, MAIN DATA`, kol R |
| Måned per aktivitet | Samme ark, kol AV |
| Måned-finnes-flagg | Samme ark, kol BF |
| BNP 2021 i EUR | `Country Summary (€)`, kol "GDP (2021)" |
| EU-fordelingsnøkkel | `EU Aid Shares`, kol "Country Share on total EU budget" |
| EU-medlemsflagg | `Country Summary (€)`, kol "EU member" |
| Befolkning | Verdensbanken WDI (workflow `fetch-wdi.yml`, kun `SP.POP.TOTL`) |

## 1. Kumulativt 2022 - februar 2026

Tall i mrd. EUR med mindre annet er angitt. EKSKL EU = direkte bilateral
støtte. INKL EU = direkte bilateral pluss landets andel av EU-institusjonenes
støtte (fordelt via finansieringsnøkkel).

### Norge

Norge er ikke EU-medlem, så EKSKL og INKL EU gir identiske verdier.

| Mål | Verdi |
|---|---|
| Total allokering | 10,005 |
| Financial allokering | 2,035 |
| Humanitarian allokering | 1,780 |
| Military allokering | 6,190 |
| Total forpliktelse | 24,724 |
| Per innbygger (EUR) | 1 786,62 |
| Andel av BNP (pst.) | 2,4542 |

### Tyskland

EU-medlem - EU-andel utgjør forskjellen mellom EKSKL og INKL EU.

| Mål | EKSKL EU | INKL EU |
|---|---|---|
| Total allokering | 25,295 | 44,407 |
| Financial allokering | 1,448 | 19,833 |
| Humanitarian allokering | 3,833 | 4,560 |
| Military allokering | 20,014 | 20,014 |
| Total forpliktelse | 47,232 | 90,569 |
| Per innbygger INKL EU (EUR) | - | 528,18 |
| Andel av BNP INKL EU (pst.) | - | 1,2329 |

### Sverige

| Mål | EKSKL EU | INKL EU |
|---|---|---|
| Total allokering | 9,149 | 13,133 |
| Total forpliktelse | 15,522 | 25,537 |
| Per innbygger INKL EU (EUR) | - | 1 238,96 |
| Andel av BNP INKL EU (pst.) | - | 2,4436 |

### Frankrike

| Mål | EKSKL EU | INKL EU |
|---|---|---|
| Total allokering | 7,907 | 24,132 |
| Total forpliktelse | 10,322 | 46,996 |
| Per innbygger INKL EU (EUR) | - | 362,07 |
| Andel av BNP INKL EU (pst.) | - | 0,9650 |

### Storbritannia

Ikke EU-medlem.

| Mål | Verdi |
|---|---|
| Total allokering | 20,009 |
| Total forpliktelse | 32,344 |
| Per innbygger (EUR) | 287,69 |
| Andel av BNP (pst.) | 0,7558 |

### USA

Ikke EU-medlem.

| Mål | Verdi |
|---|---|
| Total allokering | 115,381 |
| Total forpliktelse | 118,963 |
| Per innbygger (EUR) | 332,24 |
| Andel av BNP (pst.) | 0,5853 |

### Danmark

EU-medlem.

| Mål | EKSKL EU | INKL EU |
|---|---|---|
| Total allokering | 11,020 | 12,964 |
| Per innbygger INKL EU (EUR) | - | 2 197,33 |
| Andel av BNP INKL EU (pst.) | - | 3,8497 |

## 2. Enkeltår 2025

Alle tall EKSKL EU (per F3 - EU-bryter ikke i bruk på enkeltår).
Tidsfilter: `month` i intervall [36, 49] (jan-des 2025), filtrert på
`month_exists_dummy = 1`.

### Norge 2025

| Mål | Verdi |
|---|---|
| Total allokering (mrd. EUR) | 4,677 |
| Financial | 0,656 |
| Humanitarian | 0,393 |
| Military | 3,629 |
| Per innbygger (EUR) | 835,22 |
| Andel av BNP (pst.) | 1,1473 |

### Andre land 2025 (kun total allokering, mrd. EUR)

| Land | Verdi |
|---|---|
| Germany | 9,352 |
| United Kingdom | 5,789 |
| Canada | 5,360 |
| Sweden | 4,082 |
| Denmark | 3,070 |
| Netherlands | 2,837 |

## 3. Enkeltår 2026 (januar-februar)

Alle tall EKSKL EU. Tidsfilter: `month` i intervall [48, 61], filtrert på
`month_exists_dummy = 1`. Tidlig i året - tallene er volatile.

### Norge 2026

| Mål | Verdi |
|---|---|
| Total allokering (mrd. EUR) | 1,089 |
| Financial | 0,169 |
| Humanitarian | 0,346 |
| Military | 0,574 |
| Per innbygger (EUR) | 194,48 |
| Andel av BNP (pst.) | 0,2671 |

## 4. EU-fordelingsnøkkel (utvalg fra Kiel `EU Aid Shares`)

Forventes lest direkte fra Kiel-XLSX hver release. Forventede verdier i
Release 28 for nøkkelland:

| Land | Andel av EU-budsjett (pst.) |
|---|---|
| Germany | 22,64 |
| France | 19,22 |
| Italy | 13,68 |
| Spain | 9,05 |
| Netherlands | 4,76 |
| Poland | 3,99 |
| Belgium | 3,84 |
| Sweden | 3,33 |
| Austria | 2,87 |
| Denmark | 2,30 |
| Ireland | 1,88 |
| Finland | 1,87 |
| Norge, Storbritannia, USA m.fl. | 0 (ikke EU-medlem) |

## 5. Forventede plasseringer (kumulativt INKL EU)

For krysssjekk av rangering. Toppliste på total allokering inkludert
EU-andel:

1. United States
2. Germany
3. United Kingdom
4. France
5. Italy

Norge forventes på 10.-11. plass på total allokering INKL EU.
EKSKL EU faller Norge til lavere plass fordi EU-tillegget løfter
medlemslandene.

## 6. Tolerlanseregler

I automatiserte krysssjekk-tester:

- Total allokering: 1 prosent relativ toleranse mot fasitverdier.
- Per innbygger og BNP-andel: 1 prosent relativ toleranse.
- Rangering: eksakt match for topp 5; ±1 plass tillates for plasseringer
  6-15 (fordi små avrundinger kan forskyve rang).

Avvik utover dette skal flagges som mulig metode-feil og undersøkes før
PR merges.
