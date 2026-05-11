# Brukerveiledning - Norges Ukraina-støttedashboard

Dashboardet finnes på <https://marhip97.github.io/ukrainastotte/>. Dette
dokumentet hjelper journalister, utredere, forskere og andre som vil
bruke tallene i analyser eller omtale.

## Hva er endret (mai 2026 - M7-migrering)

Dashboardet ble i mai 2026 migrert til metoden som Finansdepartementets
interne arbeidsverktøy har brukt i flak-produksjon. Metoden endret seg
slik:

- **Allokering** beregnes nå fra Kiels redistribuerte sub-aktivitetsverdier
  (`tot_sub_activity_value_EUR_redistr`) istedenfor rå-verdier. For de
  fleste land gir det identiske tall som tidligere.
- **BNP** hentes fra Kiels eget `Country Summary`-ark (`GDP (2021)` i EUR)
  istedenfor Verdensbanken. Det gir stabilere sammenligning på tvers av
  Kiel-utgivelser fordi Kiel bruker 2021-BNP som referanseår. Norge har
  2,45 prosent som BNP-andel etter migreringen (var 2,23 prosent med
  WDI 2024-BNP).
- **EU-fordeling** kommer som valgbar bryter i et senere steg av migreringen.
  Når den slås på, fordeles EU-institusjonenes støtte til Ukraina ut på
  medlemslandene basert på Kiels egne pre-aggregerte tall. Norge påvirkes
  ikke (vi er ikke EU-medlem). Bryteren virker kun på kumulative tall -
  ikke på enkeltår.
- **Enkeltår** (2025, 2026 osv.) er ny visning som komplement til
  kumulativt 2022→. Norge allokerte 4,68 mrd EUR i 2025 og 1,09 mrd EUR
  i januar-februar 2026.
- **Folketall** hentes fortsatt fra Verdensbanken (WDI) med "Most Recent
  Value"-strategi. Per capita-tall kan avvike 0,5-2 prosent fra eldre
  flak fordi folketallet oppdateres når Verdensbanken publiserer nye tall.
- **Flak-eksport** er en kommende funksjon som vil la deg laste ned ferdig
  Word-dokument med Norges tall i FIN-format.

Endringen påvirker tallene mest for de største EU-landene (Tyskland,
Frankrike, Italia) når EU-bryteren er på. Norske tall er stort sett
uendret bortsett fra BNP-andelen (Kiels 2021-BNP er lavere enn WDI 2024-BNP).

## 1. Hva dashboardet viser

Dashboardet henter data fra [Kiel Institute Ukraine Support
Tracker](https://www.kielinstitut.de/topics/war-against-ukraine/ukraine-support-tracker/)
og presenterer Norges bidrag i tre dimensjoner:

- **Absolutt** - milliarder euro i støtte.
- **Relativt mot BNP** - andel av norsk BNP.
- **Per innbygger** - euro per innbygger.

I tillegg vises Norges rangering blant 40+ giverland på hvert av
disse målene, og endring siden forrige Kiel-utgivelse.

## 2. Nøkkeltall (seks kort øverst)

| Kort                    | Betydning                                                        |
|-------------------------|------------------------------------------------------------------|
| Total allokering        | Kumulativ støtte fra Norge siden januar 2022, i milliarder euro. |
| Andel av BNP (kumulativ)| Total støtte som prosent av Norges BNP (2024).                   |
| Per innbygger           | Total støtte delt på folketallet (2024).                         |
| Rangering allokering    | Norges plassering blant giverland på absolutt beløp.             |
| Rangering BNP-andel     | Norges plassering på BNP-andel.                                  |
| Rangering per capita    | Norges plassering på per innbygger.                              |
| Endring siste release   | Endring i total allokering fra forrige Kiel-utgivelse.           |

### Viktig om sammenligning med Kiels "årlige" tall

Kiel publiserer både årlige tall (f.eks. "Norge allokerte 3,6 mrd EUR
i 2025") og kumulative. Dashboardet viser **kumulativt** - summen
siden krigens start. Derfor er våre BNP-andeler høyere enn
enkeltårs-tall. Det er tilsiktet: brukeren skal se totalbyrden, ikke
bare siste års bidrag.

## 3. Visningsbryteren

Oversikten nederst lar deg velge hvilken dimensjon som skal vises i
stolpediagrammet:

- **Allokering** (standard, Kiels hovedinndeling). Det Kiel har
  registrert som øremerket for levering.
- **Forpliktelse**. Inkluderer løfter som ennå ikke er konkretisert
  som allokering. Gir et høyere tall enn allokering.
- **Kun utbetalt (finansiell)**. Faktiske finansielle budget support-
  utbetalinger til Ukraina. Dekker **ikke** militær og humanitær støtte
  og er derfor bare en del av bildet. Bruk med omhu.
- **Andel av BNP**. BNP-andel for alle giverland med data fra
  Verdensbanken.
- **Per innbygger**. Støtte per innbygger.
- **Endring siste release**. Endring fra forrige Kiel-utgivelse. Viser
  "ingen data" inntil minst to utgivelser er lagret.

Hver visning har en tydelig metode-notat under bryteren.

## 4. Slik tolker du tallene riktig

### 4.1 Kumulativt vs. årlig

Dashboardets hovedtall er **kumulative** 2022-2024 (kan bli 2022-2025
etter hvert). Kiels presseoppslag bruker ofte **enkeltår** (f.eks.
"0,25 % av BNP i 2025"). Før du siterer, sjekk at tidsrom stemmer.

### 4.2 Allokering vs. forpliktelse vs. utbetalt

- **Forpliktelse** = "vi har lovet dette".
- **Allokering** = "vi har øremerket dette for konkret levering".
- **Utbetalt** = "pengene er faktisk overført" (gjelder kun finansiell
  støtte).

Tre visninger gir tre ulike svar på "hvor mye har Norge støttet?".
Alle er legitime; bruk det som passer artikkelen. Dashboardet lar deg
bytte fritt.

### 4.3 Euro vs. norske kroner

Kiel rapporterer i euro. Dashboardet viser euro uten konvertering.
For å få norske kroner bruker man dagens kurs - men vær oppmerksom
på at Kiels aggregering over flere år allerede har håndtert
valutakonvertering internt.

### 4.4 Hvilke land er inkludert

Kiel sporer 41-42 giverland: EU-medlemmer, G7, Australia, Sør-Korea,
Tyrkia, Norge, New Zealand, Sveits, Kina, Taiwan, India og Island.
EU-institusjoner og Den europeiske investeringsbanken er med som
separate "givere" i Kiels tall.

For BNP-andel og per capita **utelater** vi EU-institusjonene, EIB og
Taiwan fordi Verdensbanken ikke har BNP-data for disse. Det betyr at
disse landene ikke kommer opp i rangering på BNP-andel eller per
capita, men er med i allokering- og forpliktelse-rangeringen.

## 5. Forbehold og kilder

- **Hovedkilde**: Kiel Institute for the World Economy, *Ukraine
  Support Tracker* (publisert kvartalsvis). Lisens: offentlig
  tilgjengelig; vi reproduserer tall uten egen metodisk justering.
- **BNP og folketall**: Verdensbanken, *World Development Indicators*
  (WDI). Nyeste endelige tall per land (typisk 2024).
- **Oppdateringsfrekvens**: Dashboardet sjekker Kiels side hver mandag.
  Når en ny utgivelse kommer, hentes, normaliseres og publiseres den
  automatisk i løpet av 1-2 timer.
- **Kvalitetskontroll**: Hver utgivelse krysssjekkes mot Kiels
  publiserte headline-figurer. Se `docs/qa/` for rapport per
  utgivelse.

## 6. Kjente dataavvik

Noen avvik finnes i Kiels rådata og reproduseres i dashboardet:

- For enkelte land er **commitment lavere enn allocation** (Australia,
  Irland, Italia, Slovakia). Dette skyldes at allocation inkluderer
  overførsler fra eksisterende lagre uten tilsvarende budsjettmessig
  commitment.
- For enkelte land er **finansielle utbetalinger høyere enn
  financial allocation** (Tyskland, Storbritannia). Dette skyldes
  tidsforskyvninger og at noen utbetalinger tilhører EU-lånemekanismer.

Begge avvik er beskrevet i `docs/qa/qa-rapport-release28.md`.

## 7. Spørsmål og feilrapportering

- Faglige spørsmål om Kiels metodikk: se [Kiel Institute sine
  egne sider](https://www.kielinstitut.de/topics/war-against-ukraine/ukraine-support-tracker/)
  eller [FAQ i tracker-datasettet](https://www.kielinstitut.de/publications/ukraine-support-tracker-data-6453/).
- Feil eller spørsmål om dashboardet: opprett Issue i
  [GitHub-repoet](https://github.com/marhip97/ukrainastotte/issues).
