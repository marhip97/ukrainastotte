# M7 Metodisk migrering og flak-generering - plan

**Status:** Utkast til godkjenning hos prosjekteier.
**Dato:** 2026-05-11
**Forutsetninger:** M6.3 lukket. Dashboard i ren driftsfase. Brukerne har levert
excel-arbeidsverktøy og flak-mal som engangs-referansegrunnlag for metoden.
Excel-filen brukes ikke som løpende datakilde - dashboardet og repoet skal
være selvstendige og oppdatere seg automatisk ved nye Kiel-publiseringer.

## 1. Bakgrunn

Brukerne har historisk brukt et excel-arbeidsverktøy ved siden av dashboardet
for å produsere flak til intern bruk og ekstern kommunikasjon. Excelen
implementerer en metode som avviker fra dashboardets nåværende beregninger
på flere punkter, jf. seksjon 2.

Prosjekteier har besluttet at dashboardet skal landes på excelens metode som
ny autoritativ kilde. Dashboardet får oppdatert formål: innhente og analysere
data fra Kiel automatisk, visualisere med mulighet for analyse, og eksportere
data til flak. Designet (farger, moduler, graftyper) beholdes i tråd med
gjeldende dashboard slik det ble levert i M6.3. Metodikken endres for å
samsvare med metoden i FINs excel.

**Det betyr at M7 ikke er en utvidelse - det er en migrering av hele
dashboardet til ny metodisk grunn, pluss en ny flak-funksjon på toppen.**

## 2. Metodiske endringer som migrering medfører

| Tema | Før (dashboard i dag) | Etter (excel-metode) |
|---|---|---|
| Verdikolonne | `tot_sub_activity_value_EUR` (rå) | `tot_sub_activity_value_EUR_redistr` (redistribuert) |
| BNP | WDI, ferskeste tilgjengelige år (typisk 2024) | Kiels eget `Country Summary (€)`-ark, "GDP (2021)" |
| Befolkning | WDI, ferskeste tilgjengelige år | WDI, kun `SP.POP.TOTL` (folketall) |
| EU-fordelingsnøkkel | Ikke i bruk | Kiels eget `EU Aid Shares`-ark |
| EU-institusjoner | Egen rad i rangering, separat giver | Allokeres ut på medlemsland via finansieringsnøkkel, bryter for av/på |
| Tidsperiode | Kun kumulativt 2022→ | Kumulativt 2022→ pluss enkeltår (2025, 2026 osv.) |
| Datofiltrering | Tidsserien filtrerer udaterte rader, hero/rangering inkluderer dem | Alle enkeltår-visninger filtrerer på `month_exists_dummy = 1` |

## 3. Føringer fra prosjekteier (allerede besluttet)

- **F1 (flak-format):** Flaket lastes ned som Word-fil i tråd med mal. Ingen
  interaktiv tekstredigering i dashboardet.
- **F2 (EU-fordeling):** Implementeres som valgbar bryter, ikke ny
  standardvisning.
- **F3 (EU-bryterens scope):** EU-fordeling brukes kun på kumulative tall.
  For enkeltår er bryteren grået ut.
- **F4 (migreringsmodell):** Excel-metoden blir ny standard for dashboardet,
  ikke et alternativ. Redistr-verdier blir hovedverdi.
- **F5 (designkontinuitet):** Designet beholdes i tråd med M6.3.
  Designnotatene i M7 spesifiserer kun plassering og oppførsel.
- **F6 (selvstendighet):** Repoet og dashboardet skal være selvstendige og
  oppdatere seg automatisk ved nye Kiel-publiseringer. Excel-filen er
  engangs-input til metode-spesifikasjon og ligger ikke i repoet. Alle
  konstanter (BNP, EU-nøkkel) hentes direkte fra Kiels XLSX hver release.

## 4. Forhåndslevert artefakt (klar før utvikling)

Én fil er ekstrahert fra excelen og leveres til repoet før Claude Code-
sesjonen starter:

- `docs/qa/m7-fasitverdier.md` - gyldne tall for Norge, Tyskland, Sverige,
  Frankrike, Storbritannia, USA og Danmark for kumulativt 2022→ februar 2026,
  samt enkeltår 2025 og 2026. Brukes som forventede verdier i M7.0-QA og i
  senere automatiserte krysssjekk-tester.

Excelen selv brukes ikke i repoet. Kiels offisielle XLSX inneholder alle
metode-konstantene som trengs (BNP 2021, EU-fordelingsnøkkel) og parses
direkte av dashboardet.

## 5. Leveranseomfang

M7 deles i syv delfaser. M7.0 er migrerings-QA før noen kodeendringer
rulles ut til brukere. Hver delfase blir én pull request mot `main`.

### 5.1 M7.0 Migrerings-QA (verifisering)

Engangs-skript som kvantifiserer avvik per land mellom dagens metode og
excel-metoden, ved å reimplementere excel-metoden i Python og kjøre den
mot eksisterende Kiel-rådata. Måler:

- Norges total allokering: rå vs. redistr.
- Tysklands, Sveriges, Frankrikes total allokering: EKSKL og INKL EU.
- BNP-andel og per innbygger: WDI 2024 vs. Kiels 2021-BNP.
- Topp 15-rangeringer: plasseringer som endrer seg.

Resultatet leveres som rapport (`docs/qa/m7-migrering-avvik.md`) til
prosjekteier før kodeendringer rulles til brukere. Rapporten skal verifisere
at metode-implementasjonen treffer fasitverdiene i `m7-fasitverdier.md`
innen 1 prosent toleranse.

Omfang: S. Avhengigheter: ingen.

### 5.2 M7.1 Parser-utvidelse

Utvide `src/ingest/parse_kiel.py` til å lese fra Kiels XLSX:

- `tot_sub_activity_value_EUR_redistr` (kolonne R i bilateral-arket).
  Sjekkes via kolonnenavn, ikke posisjon.
- `month` (kolonne AV) og `month_exists_dummy` (kolonne BF).
- Ny `parse_eu_aid_shares(xlsx)`-funksjon som leser `EU Aid Shares`-arket
  og returnerer `{land: fordelingsnøkkel}`-mapping.
- Ny `parse_gdp(xlsx)`-funksjon som leser `Country Summary (€)`-arket og
  returnerer BNP 2021 i EUR per land.

Datamodellen utvides: `Aktivitet` får nye felter `verdi_eur_redistr`,
`maaned_nr`, `maaned_finnes`. Nye dataklasser `EuAndel` og `LandBnp`.
Eksisterende `verdi_eur`-felt fjernes ikke ennå - det ryddes vekk i M7.3
etter at migreringen er bekreftet.

Tester: utvidet fixture med redistr-kolonne, maaned-kolonne, og fixtures
for de to nye Kiel-arkene. Eksisterende tester må fortsatt passere.

Omfang: M. Avhengigheter: ingen.

### 5.3 M7.2 Migrering av analyselaget

`normalize.py` og analysemodulene oppdateres slik at redistr-verdier
blir hovedverdi og Kiel-leverte konstanter erstatter WDI for BNP:

- `country_summary.csv` regnes nå fra redistr, ikke fra rå-verdier.
- `country_summary_relative.csv` bruker Kiels BNP 2021 og WDI-folketall.
  WDI-workflowen slankes til kun folketall.
- Ny CSV `country_summary_aar.csv` med dimensjonene (land, aar,
  kategori, maal, verdi_eur_mrd, per_capita_eur, andel_bnp_pct).
- Ny modul `src/analyze/eu_fordeling.py` med funksjon
  `fordelEuStotte(summary, eu_andeler)` som tar et kumulativt summary
  og fordeler EU-institusjonenes støtte ut på medlemsland.

`fetch-wdi.yml` justeres til å hente kun `SP.POP.TOTL`. `wdi.json`
omdøpes til `folketall.json` for å reflektere den nye, smalere rollen.

Tester: gylne verdier fra M7.0-rapporten brukes som forventede tall.

Omfang: L. Avhengigheter: M7.1.

### 5.4 M7.3 Opprydding etter migrering

Ryddesteg som ikke kunne gjøres i M7.2 fordi det ville brutt parallell
QA:

- Fjern gamle `verdi_eur`-referanser i parser og analyselag der de ikke
  lenger brukes.
- Slett gamle `country_summary`-felter som ikke lenger fylles.
- Oppdater `brukerveiledning.md` med ny "Hva er endret"-seksjon som
  forklarer overgangen, dato, og hvilke tall som er berørt. Sak S21
  styrer formuleringen.

Omfang: S. Avhengigheter: M7.2 godkjent.

### 5.5 M7.4 Dashboard-utvidelse: per år og EU-bryter

Designnotat først, deretter implementering.

**Steg 1 - designnotat:** Ett dokument under `docs/m7-design/m7-4-design.md`
som spesifiserer:

- Plassering av periode-bryteren.
- Plassering av EU-bryteren og hvordan grået-ut tilstand signaliseres når
  enkeltår er valgt.
- Hvordan hero-seksjonen endrer seg ved periode = enkeltår.
- Oppførsel for rangering, scatter og komparativ profil ved
  tilstandsendring.
- Wireframe eller skisse for hver hovedtilstand.

Designet bygger på eksisterende tokens i `tokens.css` og komponenter i
`dashboard.js`. Ingen nye farger, fonter eller graftyper. Designnotatet
godkjennes av prosjekteier før koding starter.

**Steg 2 - implementering:** Når designnotat er godkjent, bygges
periode-bryter, EU-bryter og oppdaterte visualiseringer.

Omfang: L. Avhengigheter: M7.2, M7.3, design godkjent.

### 5.6 M7.5 Flak-forhåndsvisning

Designnotat først, deretter implementering.

**Steg 1 - designnotat:** Ett dokument under `docs/m7-design/m7-5-design.md`
som spesifiserer plassering, presentasjon av tabell 1 og figurene 1-3,
samt knappens utseende.

**Steg 2 - implementering:** Når designnotat er godkjent, bygges
forhåndsvisning og "Last ned flak (.docx)"-knapp. Ingen redigerbar tekst.

Omfang: M. Avhengigheter: M7.4.

### 5.7 M7.6 Docx-generering klientside

JavaScript-modul som genererer Word-fil basert på flak-malen. Bruker
`docx`-pakken via CDN-distribusjon (kandidat: esm.run eller jsdelivr).

Maldokumentet (`Støtte_til_Ukraina_-_Kiel-instituttets_tall.docx`) legges
i repoet under `src/dashboard/maler/flak-mal.docx` og brukes som visuell
referanse for stil og struktur. Word-filen bygges fra grunnen i kode,
ikke via mal-substitusjon (sak S19 kan endre dette).

Norsk språk, FIN-tallformat (komma som desimaltegn, mellomrom som
tusenseparator, "pst." for prosent, "mrd. kroner" for milliarder),
plasseringstabell og figurer i tråd med malen.

Omfang: L. Avhengigheter: M7.5.

## 6. Tidsestimat

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

## 7. Åpne saker som må besluttes før utvikling starter

| Sak | Beskrivelse | Frist |
|---|---|---|
| S19 | Skal flak-malen `flak-mal.docx` ligge i repoet som referanse, eller skal docx-generering bygges fra grunnen i kode uten referansemal? | Før M7.6 |
| S20 | Hvilke målepunkt skal flaket vise i tabell 1? Excel-flaket viser 9 rader. Skal denne være konfigurerbar, eller låst til malens struktur? | Før M7.5 |
| S21 | Hvordan kommuniseres metodisk migrering til brukerne? Forslag: "Hva er endret"-seksjon i brukerveiledning, kort merknad i dashboardets header i en overgangsperiode, og varsel til kjente brukere via vanlig kanal. | Før M7.3 |

Lukket: S17 (BNP/befolkning-kilde - besvart 2026-05-11 med Kiel for BNP og
WDI for folketall). S18 (versjonering av `Country data`) - utgår fordi
Country data ikke lenger trengs som separat fil; konstantene leses direkte
fra Kiel-XLSX hver release.

## 8. Risiko

| ID | Risiko | Sannsynlighet | Konsekvens | Tiltak |
|---|---|---|---|---|
| R15 | Redistr-kolonnen avviker mer fra rå-kolonnen enn forventet for Norge | Lav | Middels | M7.0 kvantifiserer dette før utrulling. |
| R16 | Docx-generering klientside fungerer dårlig på iOS/Safari | Middels | Middels | Test tidlig i M7.6. Fallback: server-side via en lett funksjon - krever ny S-sak om hosting. |
| R17 | Brukere som kjenner dagens tall blir forvirret av metodebytte | Middels | Middels | Tydelige metode-merknader. M7.3 har egen leveranse for kommunikasjon (S21). |
| R18 | EU-fordelingsnøkkelen i Kiels XLSX kan endre struktur mellom releaser | Lav | Middels | Eksplisitte kolonnekontrakter i `parse_eu_aid_shares()`. Workflow oppretter Issue ved feil (samme mønster som dagens parser). |
| R19 | Kiels 2021-BNP kan oppleves utdatert mot 2026-data | Middels | Lav | Tydelig metode-merknad. Merknad i veiledning: "BNP-tallene er Kiels egne 2021-tall for å sikre stabile sammenligninger på tvers av Kiel-releaser." |
| R20 | Brukere oppdager at WDI-baserte tall i tidligere kommunikasjon ikke matcher nye tall i dashboardet | Lav | Middels | Migreringskommunikasjon i M7.3 inkluderer en kort "Hva er endret"-seksjon med dato og hvilke verdier som er berørt. |

## 9. Konsekvenser for eksisterende kode og dokumentasjon

- `parse_kiel.py` får tre nye parse-funksjoner og utvidet `Aktivitet`-modell.
- `normalize.py` produserer nye hovedverdier basert på redistr.
- `fetch_wdi.py` og `fetch-wdi.yml` slankes til kun folketall.
- `dashboard.js` får to nye globale brytere som styrer alle hovedvisninger.
- `brukerveiledning.md` får ny "Hva er endret"-seksjon (S21).
- `prosjektplan.md` får M7 som ny milepæl i seksjon 5, endringslogg i
  seksjon 12 oppdateres.
- `docs/qa/qa-rapport-release28.md` får erstatning eller oppdatering med
  ny metode.
- `CLAUDE.md` trenger ingen endringer.

## 10. Rollefordeling

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

*Plan oppdateres etter at S19-S21 er besvart. Endelig versjon godkjennes
av prosjekteier før utvikling på `feature/m7-metodisk-migrering` starter.*
