# M7 Metodisk migrering og flak-generering - plan

**Status:** Utkast til godkjenning hos prosjekteier.
**Dato:** 2026-05-11
**Forutsetninger:** M6.3 lukket. Dashboard i ren driftsfase. Brukerne har levert
excel-arbeidsverktøy (`2026-04_Kiel_data_FINs_håndtering.xlsx`) og flak-mal
(`Støtte_til_Ukraina_-_Kiel-instituttets_tall.docx`) som grunnlag for nye
funksjonelle krav.

## 1. Bakgrunn

Brukerne har historisk brukt et excel-arbeidsverktøy ved siden av dashboardet
for å produsere flak til intern bruk og ekstern kommunikasjon. Excelen
implementerer en metode som avviker fra dashboardets nåværende beregninger
på flere punkter, jf. seksjon 2.

Prosjekteier har besluttet at dashboardet over tid skal landes på excelens
metode som ny autoritativ kilde. Dashboardet får oppdatert formål: innhente
og analysere data fra Kiel automatisk, visualisere med mulighet for analyse,
og eksportere data til flak. Designet (farger, moduler, graftyper) beholdes
i tråd med gjeldende dashboard slik det ble levert i M6.3. Metodikken
endres for å samsvare med FINs excelfil.

Det betyr at M7 ikke er en utvidelse - det er en migrering av hele
dashboardet til ny metodisk grunn, pluss en ny flak-funksjon på toppen.

## 2. Metodiske endringer som migrering medfører

| Tema | Før (dashboard i dag) | Etter (excel-metode) |
|---|---|---|
| Verdikolonne | `tot_sub_activity_value_EUR` (rå) | `tot_sub_activity_value_EUR_redistr` (redistribuert) |
| BNP og befolkning | Verdensbanken WDI, ferskeste tilgjengelige år (typisk 2024) | Fast 2021-BNP og fast befolkning fra `Country data` |
| EU-institusjoner | Egen rad i rangering, separat giver | Allokeres ut på medlemsland via finansieringsnøkkel, bryter for av/på |
| Tidsperiode | Kun kumulativt 2022→ | Kumulativt 2022→ pluss enkeltår (2025, 2026 osv.) |
| Datofiltrering | Tidsserien filtrerer udaterte rader, hero/rangering inkluderer dem | Alle enkeltår-visninger filtrerer på `month_exists_dummy = 1` |

## 3. Føringer fra prosjekteier (allerede besluttet)

- **F1 (flak-format):** Flaket lastes ned som Word-fil i tråd med mal. Ingen
  interaktiv tekstredigering i dashboardet. Brukeren redigerer i Word etter
  nedlasting.
- **F2 (EU-fordeling):** Implementeres som valgbar bryter, ikke ny
  standardvisning.
- **F3 (EU-bryterens scope):** EU-fordeling brukes kun på kumulative tall
  (2022 til nå). For enkeltår er bryteren grået ut. Enkeltår-visninger
  bruker likevel redistr-verdier og Country data - hele excel-metoden minus
  EU-tillegget.
- **F4 (migreringsmodell):** Modell 1 - excel-metoden blir ny standard for
  dashboardet, ikke et alternativ. Redistr-verdier blir hovedverdi.
  `Country data` erstatter WDI for BNP og befolkning. Dashboardet og flaket
  viser dermed samme tall.
- **F5 (designkontinuitet):** Designet, herunder farger, moduler og
  graftyper, beholdes i tråd med M6.3-leveransen. Designnotatene i M7
  spesifiserer kun plassering av nye kontroller og oppførsel ved
  tilstandsendring - ikke ny visuell identitet.

## 4. Leveranseomfang

M7 deles i syv delfaser. M7.0 er migrerings-QA før noen kodeendringer
rulles ut til brukere. Hver delfase blir én pull request mot `main`.

### 4.1 M7.0 Migrerings-QA (verifisering)

Engangs-skript som kvantifiserer avvik per land mellom dagens metode og
excel-metoden. Måler:

- Norges total allokering: rå vs. redistr, ekskl. og inkl. EU-andel.
- Tysklands, Sveriges, Frankrikes total allokering: samme.
- BNP-andel og per innbygger: WDI 2024 vs. Country data 2021-BNP og fast
  befolkning.
- Topp 15-rangeringer: plasseringer som endrer seg.

Resultatet leveres som rapport (`docs/qa/m7-migrering-avvik.md`) til
prosjekteier før kodeendringer rulles til brukere. Rapporten brukes også
som gyldne verdier i krysssjekk-testene senere i M7.

Omfang: S. Avhengigheter: ingen.

### 4.2 M7.1 Parser- og referansetabell-utvidelse

Utvide `src/ingest/parse_kiel.py` til å lese:

- `tot_sub_activity_value_EUR_redistr` (kolonne R i bilateral-arket -
  merk samme kolonnebokstav som dagens verdi, ulikt feltnavn). Sjekkes
  via kolonnenavn, ikke posisjon.
- `month` (kolonne AV) og `month_exists_dummy` (kolonne BF).
- Ny `parse_country_data`-funksjon som leser arket "Country data" med
  kolonnene `Land`, `Befolkning (mill.)`, `EU share allocations`,
  `EU share commitments`, `NATO`, `Europa`, `BNP mill EUR`.

Datamodellen utvides: `Aktivitet` får nye felter `verdi_eur_redistr`,
`maaned_nr`, `maaned_finnes`. Ny dataklasse `LandReferanse` for Country
data-tabellen. Eksisterende `verdi_eur`-felt fjernes ikke ennå - det
ryddes vekk i M7.3 etter at migreringen er bekreftet.

`Country data` versjoneres som `data/reference/country_data.csv` i
repoet. Hentes manuelt fra brukernes excel ved hver Kiel-release, eller
genereres automatisk hvis brukerne kan dele excel-filen i repoet. Sak
S18 avgjør dette.

Tester: ny fixture med redistr-kolonne, maaned-kolonne og Country data.
Eksisterende tester må fortsatt passere på rå-verdiene.

Omfang: M. Avhengigheter: ingen.

### 4.3 M7.2 Migrering av analyselaget

`normalize.py` og analysemodulene oppdateres slik at redistr-verdier
blir hovedverdi:

- `country_summary.csv` regnes nå fra redistr, ikke fra rå-verdier. Rå
  rader fra Country Summary-arket i Kiel-xlsx beholdes som referanse
  men brukes ikke i hovedaggregatet.
- `country_summary_relative.csv` byttes til Country data: 2021-BNP og
  fast befolkning. WDI brukes ikke lenger.
- Ny CSV `country_summary_aar.csv` med dimensjonene (land, aar,
  kategori, maal, verdi_eur_mrd, per_capita_eur, andel_bnp_pct). Filen
  produseres for hvert tilgjengelig år.
- Ny modul `src/analyze/eu_fordeling.py` med funksjon
  `fordelEuStotte(summary, country_data)` som tar et kumulativt summary
  og fordeler EU-institusjonenes støtte ut på medlemsland.

Workflow `fetch-wdi.yml` markeres som deaktivert (commentet ut, ikke
slettet i denne PR-en). `wdi.json` beholdes som referanse til M7.6.

Tester: gylne verdier fra M7.0-rapporten brukes som forventede tall.

Omfang: L. Avhengigheter: M7.1.

### 4.4 M7.3 Opprydding etter migrering

Ryddesteg som ikke kunne gjøres i M7.2 fordi det ville brutt parallell
QA:

- Fjern gamle `verdi_eur`-referanser i parser og analyselag der de ikke
  lenger brukes.
- Slett `fetch_wdi.py`, `fetch-wdi.yml`, `wdi.json` etter at M7.2-QA er
  bestått og prosjekteier har godkjent migreringen.
- Oppdater `brukerveiledning.md` med ny "Hva er endret"-seksjon som
  forklarer overgangen, dato, og hvilke tall som er berørt. Sak S21
  styrer formuleringen.

Omfang: S. Avhengigheter: M7.2 godkjent.

### 4.5 M7.4 Dashboard-utvidelse: per år og EU-bryter

Designnotat først, deretter implementering.

**Steg 1 - designnotat:** Ett dokument under `docs/m7-design/m7-4-design.md`
som spesifiserer:

- Plassering av periode-bryteren (kandidatposisjoner: rad over hero, ved
  siden av valuta-bryter, eller tabs øverst).
- Plassering av EU-bryteren og hvordan grået-ut tilstand signaliseres når
  enkeltår er valgt.
- Hvordan hero-seksjonen endrer seg ved periode = enkeltår (eksempelvis
  forsvinner "Endring siden forrige rapport"-kortet, eller får ny
  betydning).
- Oppførsel for rangering, scatter og komparativ profil ved
  tilstandsendring.
- Wireframe eller skisse for hver hovedtilstand: kumulativt + EU av,
  kumulativt + EU på, enkeltår.

Designet bygger på eksisterende tokens i `tokens.css` og komponenter i
`dashboard.js`. Ingen nye farger, fonter eller graftyper. Designnotatet
godkjennes av prosjekteier før koding starter.

**Steg 2 - implementering:** Når designnotat er godkjent:

- Ny periode-bryter: "Kumulativt" (default) eller spesifikt år.
- Ny EU-bryter "Inkl. EU-andel": kun synlig når periode = "Kumulativt".
  Default av.
- Alle hovedvisninger (hero, rangering, scatter, komparativ profil) leser
  riktig CSV avhengig av periode, og riktig kolonner avhengig av
  EU-bryter.
- Metode-merknader oppdateres slik at hver visning forklarer aktive valg.

Omfang: L. Avhengigheter: M7.2, M7.3, design godkjent.

### 4.6 M7.5 Flak-forhåndsvisning

Designnotat først, deretter implementering.

**Steg 1 - designnotat:** Ett dokument under `docs/m7-design/m7-5-design.md`
som spesifiserer:

- Plassering av flak-funksjonen i dashboardet (egen seksjon nederst,
  egen URL, eller annet).
- Presentasjon av tabell 1 i forhåndsvisningen: faktisk skjermbilde av
  Word-utgaven, eller data-tabell?
- Presentasjon av figurene 1-3: rendret med samme Plotly-tema som
  hoveddashboardet, eller egen rendering?
- Knappens utseende og hvordan brukeren oppdager flak-funksjonen.

**Steg 2 - implementering:** Når designnotat er godkjent, bygges
forhåndsvisningen og "Last ned flak (.docx)"-knappen. Ingen redigerbar
tekst. Hvis tallene ser feil ut, justerer brukeren filtre i dashboardet
og laster ned på nytt.

Omfang: M. Avhengigheter: M7.4.

### 4.7 M7.6 Docx-generering klientside

JavaScript-modul som genererer Word-fil basert på flak-malen.
Vurderer `docx`-pakken via CDN-distribusjon fra esm.run eller jsdelivr -
lar oss bygge .docx fra JavaScript uten serverside-prosessering.

Maldokumentet (`Støtte_til_Ukraina_-_Kiel-instituttets_tall.docx`)
legges i repoet under `src/dashboard/maler/flak-mal.docx` og brukes som
referanse for stil og struktur. Ferdig fil bygges fra grunnen av i kode
(ikke via mal-substitusjon), siden klientside-biblioteker for
mal-substitusjon i Word er umodne. Sak S19 kan endre dette.

Norsk språk, FIN-tallformat (komma som desimaltegn, mellomrom som
tusenseparator, "pst." for prosent, "mrd. kroner" for milliarder),
plasseringstabell og figurer i tråd med malen. WDI-relaterte filer
slettes i denne PR-en.

Omfang: L. Avhengigheter: M7.5.

## 5. Tidsestimat

Skala: S = ½-1 dag, M = 1-2 dager, L = 2-3 dager.

| Delfase | Omfang | Dager |
|---|---|---|
| M7.0 Migrerings-QA | S | 0,5-1 |
| M7.1 Parser-utvidelse | M | 1-2 |
| M7.2 Migrering av analyselag | L | 2-3 |
| M7.3 Opprydding | S | 0,5-1 |
| M7.4 Dashboard (design + impl.) | L+L | 3-4 |
| M7.5 Flak-forhåndsvisning (design + impl.) | M+M | 2-3 |
| M7.6 Docx-generering | L | 2-3 |
| **Sum** | | **11-17 dager** |

Estimert leveringstid: omtrent 2-3 ukers utviklingstid.

## 6. Åpne saker som må besluttes før utvikling starter

| Sak | Beskrivelse | Frist |
|---|---|---|
| S18 | Skal `Country data` versjoneres som `data/reference/country_data.csv` i repoet, eller automatisk hentes fra excelens `Country data`-ark hver gang Kiel-fil oppdateres? Foreslås manuell versjonering med årlig oppdatering, fordi excelen ikke er en automatisert datakilde. | Før M7.1 |
| S19 | Skal flak-malen `flak-mal.docx` ligge i repoet som referanse, eller skal docx-generering bygges fra grunnen i kode? | Før M7.6 |
| S20 | Hvilke målepunkt skal flaket vise i tabell 1? Excel-flaket viser 9 rader. Skal denne være konfigurerbar, eller låst til malens struktur? | Før M7.5 |
| S21 | Hvordan kommuniseres metodisk migrering til brukerne? Forslag: "Hva er endret"-seksjon i brukerveiledning, kort merknad i dashboardets header i en overgangsperiode, og varsel til kjente brukere via vanlig kanal. | Før M7.3 |

S17 (BNP/befolkning-kilde) ble besvart 2026-05-11 med valg av Country
data. Saken er lukket.

## 7. Risiko

| ID | Risiko | Sannsynlighet | Konsekvens | Tiltak |
|---|---|---|---|---|
| R15 | Redistr-kolonnen avviker mer fra rå-kolonnen enn forventet for Norge | Lav | Middels | M7.0 kvantifiserer dette før utrulling. |
| R16 | Docx-generering klientside fungerer dårlig på iOS/Safari | Middels | Middels | Test tidlig i M7.6. Fallback: server-side via en lett funksjon - krever ny S-sak om hosting. |
| R17 | Brukere som kjenner dagens tall blir forvirret av metodebytte | Middels | Middels | Tydelige metode-merknader. M7.3 har egen leveranse for kommunikasjon (S21). |
| R18 | EU-fordelingsnøkkelen i `Country data` er momentanstørrelse - kan endre seg over tid (Brexit, EU-utvidelser) | Lav | Lav | Versjoner `country_data.csv`. Dokumenter at den må oppdateres manuelt ved EU-endringer. |
| R19 | Bytte til 2021-BNP virker utdatert mot 2026-data | Middels | Lav | Tydelig metode-merknad. Merknad i veiledning: "BNP-tallene er bevisst faste 2021-tall for å sikre stabile sammenligninger over tid." |
| R20 | Brukere oppdager at WDI-baserte tall i tidligere kommunikasjon ikke matcher nye tall i dashboardet | Lav | Middels | Migreringskommunikasjon i M7.3 inkluderer en kort "Hva er endret"-seksjon med dato og hvilke verdier som er berørt. |

## 8. Konsekvenser for eksisterende kode og dokumentasjon

- `parse_kiel.py` og `normalize.py` får nye felter og produserer nye
  hovedverdier.
- `dashboard.js` får to nye globale brytere som styrer alle hovedvisninger.
- `brukerveiledning.md` får ny "Hva er endret"-seksjon (S21).
- `prosjektplan.md` får M7 som ny milepæl i seksjon 5, endringslogg i
  seksjon 12 oppdateres.
- `fetch_wdi.py`, `fetch-wdi.yml`, `wdi.json` avvikles i M7.6.
- `docs/qa/qa-rapport-release28.md` får erstatning eller oppdatering med
  ny metode.
- `CLAUDE.md` trenger ingen endringer.

## 9. Rollefordeling

| Delfase | Primær rolle |
|---|---|
| M7.0 Migrerings-QA | qa |
| M7.1 Parser-utvidelse | dataingenior |
| M7.2 Migrering av analyselag | analytiker |
| M7.3 Opprydding | dataingenior |
| M7.4 Dashboard | frontend |
| M7.5 Flak-forhåndsvisning | frontend |
| M7.6 Docx-generering | frontend |

---

*Plan oppdateres etter at S18-S21 er besvart. Endelig versjon godkjennes
av prosjekteier før utvikling på `feature/m7-metodisk-migrering` starter.*
