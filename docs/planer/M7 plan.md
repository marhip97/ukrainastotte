# M7 Flak-generering og metodisk samkjøring med excel-arbeidsverktøy - plan

**Status:** Utkast til godkjenning hos prosjekteier.
**Dato:** 2026-05-11
**Forutsetninger:** M6.3 lukket. Dashboard i ren driftsfase. Brukerne har levert
excel-arbeidsverktøy (`2026-04_Kiel_data_FINs_håndtering.xlsx`) og flak-mal
(`Støtte_til_Ukraina_-_Kiel-instituttets_tall.docx`) som grunnlag for nye
funksjonelle krav.

## 1. Bakgrunn

Brukerne har historisk brukt et excel-arbeidsverktøy ved siden av dashboardet
for å produsere flak til intern bruk og ekstern kommunikasjon. Excelen
inneholder tre arbeidsark - "Aggregert per land", "2025" og "2026" - som
implementerer en metode som avviker fra dashboardets nåværende beregninger
på fem viktige punkter, jf. seksjon 2. Brukerne ønsker (a) at dashboardet
kan reprodusere excel-tallene, og (b) en funksjon for å generere flak som
Word-fil basert på dashboardets data.

## 2. Metodiske avvik mellom excel og dashboard

| Tema | Excel (brukernes metode) | Dashboardet i dag |
|---|---|---|
| Tidsperiode | Velger år (2025 = `month` i [36, 49], 2026 = [48, 61]) | Kumulativt 2022→ |
| Datofiltrering | Filtrerer på `month_exists_dummy = 1` | Tidsserien filtrerer udaterte rader, hero/rangering/scatter inkluderer dem |
| Verdikolonne | `tot_sub_activity_value_EUR_redistr` (redistribuert) | `tot_sub_activity_value_EUR` (rå) |
| EU-fordeling | Allokerer EU-institusjoners støtte ut på medlemsland via `EU share allocations` | EU-institusjoner som separat giver |
| Befolkning og BNP | Fast 2021-BNP og fast befolkning fra egen `Country data`-tabell | Verdensbanken WDI med ferskeste tilgjengelige år |

## 3. Føringer fra prosjekteier

Tre føringer er allerede besluttet og legges til grunn:

- **F1 (flak-format):** Flaket lastes ned som Word-fil i tråd med mal.
  Ingen interaktiv tekstredigering i dashboardet. Brukeren redigerer i Word
  etter nedlasting.
- **F2 (EU-fordeling):** Inkluderes som valgbar bryter ved siden av
  eksisterende visninger - ikke som ny standardvisning.
- **F3 (EU-bryterens scope):** EU-fordeling brukes kun på akkumulerte tall
  (2022 til siste tilgjengelige måned). For enkeltår-visninger (2025, 2026)
  brukes alltid kun direkte bilateral støtte uten EU-fordeling. Dette
  samsvarer med hvordan excelen og flaket faktisk fungerer.

## 4. Leveranseomfang

M7 deles i seks delfaser. Hver delfase blir én pull request mot `main`.

### 4.1 Verifiseringssteg (før utvikling)

Før koding starter: kjør et engangs-skript mot brukernes excel-fil og
mål nøyaktig hvor mye Norges tall endrer seg når man går fra
`tot_sub_activity_value_EUR` til `tot_sub_activity_value_EUR_redistr`.
Resultatet dokumenteres i denne planen og brukes som gyldenverdi i
krysssjekk-testene i M7.3.

Krever ingen kodeendringer i repoet. Skriptet kjøres lokalt mot den
opplastede excel-filen. Estimert tid: under en time.

### 4.2 M7.1 Parser-utvidelse

Utvide `src/ingest/parse_kiel.py` til å lese:

- `tot_sub_activity_value_EUR_redistr` (kolonne R i bilateral-arket -
  merk samme kolonnebokstav som dagens verdi, ulikt feltnavn). Sjekkes
  via kolonnenavn, ikke posisjon.
- `month` (kolonne AV) og `month_exists_dummy` (kolonne BF).
- En ny `parse_country_data`-funksjon som leser arket "Country data"
  med kolonnene `Land`, `Befolkning (mill.)`, `EU share allocations`,
  `EU share commitments`, `NATO`, `Europa`, `BNP mill EUR`.

Datamodellen utvides: `Aktivitet` får nye felter `verdi_eur_redistr`,
`maaned_nr`, `maaned_finnes`. Ny dataklasse `LandReferanse` for
Country data-tabellen.

Tester: ny fixture med redistr-kolonne, maaned-kolonne og Country data.
Eksisterende tester må fortsatt passere.

Omfang: M. Avhengigheter: ingen.

### 4.3 M7.2 Aggregering per år og EU-fordeling

Ny modul `src/analyze/aar_aggregat.py` med tre funksjoner:

- `aggregerPerAar(aktiviteter, aar)`: summerer redistr-verdier per
  land/kategori/mål for et gitt år, filtrert på `month_exists_dummy = 1`
  og månedsintervall (jf. excel-formelen).
- `fordelEuStotte(summary, country_data)`: tar et kumulativt summary og
  fordeler EU-institusjonenes støtte ut på medlemsland via
  `EU share allocations`/`EU share commitments`.
- `noekkeltallPerAar(aggregater, country_data)`: beregner per innbygger
  og som andel av BNP basert på `Country data` (fast befolkning og
  2021-BNP, ikke WDI). Dette er bevisst - excelen bruker faste verdier
  for å sikre at tallene er sammenlignbare på tvers av releaser.

`normalize.py` utvides til å skrive `data/processed/country_summary_aar.csv`
med dimensjonene (land, aar, kategori, maal, verdi_eur_mrd, per_capita_eur,
andel_bnp_pct). Filen produseres for hvert tilgjengelig år samt for
kumulativ periode.

Tester: gylne verdier for Norge 2025 (3,63 mrd. EUR ekskl. EU iht. excel),
Tyskland og Sverige.

Omfang: L. Avhengigheter: M7.1.

### 4.4 M7.3 Krysssjekk mot excel

`scripts/qa_krysssjekk.py` utvides med ny sjekkgruppe som verifiserer
at dashboardets nye tall samsvarer med excel-tallene innenfor 1 prosent
toleranse for:

- Norge 2025 allokering ekskl. EU (gylden verdi: 3,63 mrd. EUR)
- Norge 2026 allokering ekskl. EU
- Norge kumulativt allokering inkl. EU (gylden verdi: tba fra
  verifiseringsskriptet)
- Tyskland og Sverige for de samme tre målepunktene

QA-rapport oppdateres når sjekkene er på plass.

Omfang: S. Avhengigheter: M7.2.

### 4.5 M7.4 Dashboard-utvidelse: per år og EU-bryter

To nye kontroller på dashboardet:

- **Periode-bryter** ved siden av eksisterende visning: "Kumulativt"
  (default) eller spesifikt år (2022, 2023, 2024, 2025, 2026). Når et år
  er valgt, leser dashboardet `country_summary_aar.csv` og oppdaterer
  hero, rangering, scatter og komparativ profil. EU-bryteren grås ut
  (jf. F3).
- **EU-bryter** "Inkl. EU-andel": kun synlig når periode = "Kumulativt".
  Når slått på, brukes EU-fordelte verdier i alle nøkkeltall, rangeringer
  og kart. Default av.

Metode-merknader oppdateres slik at hver visning forklarer hvilke valg
som er aktive, og hvorfor enkeltår ikke kan kombineres med EU-fordeling.

Omfang: L. Avhengigheter: M7.2, M7.3.

### 4.6 M7.5 Flak-forhåndsvisning

Ny seksjon i dashboardet, eller egen side under `/flak`, som viser
nøyaktig hvilke tall og figurer som vil havne i Word-flaket gitt
aktive bryterinnstillinger:

- Tabell 1 (plasseringer per kategori) genereres dynamisk.
- Figurene 1-3 (allokert 2025: absolutt, per innbygger, andel av BNP)
  rendres som forhåndsvisning.
- "Last ned flak (.docx)"-knapp øverst i seksjonen.

Ingen redigerbar tekst. Hvis tallene ser feil ut, justerer brukeren
filtre i dashboardet og laster ned på nytt.

Omfang: M. Avhengigheter: M7.4.

### 4.7 M7.6 Docx-generering klientside

JavaScript-modul som genererer Word-fil basert på flak-malen levert av
brukerne. Bruker en lett npm-pakke (kandidat: `docx` via CDN-distribusjon
fra esm.run eller jsdelivr) som lar oss bygge .docx fra JavaScript uten
serverside-prosessering.

Maldokumentet (`Støtte_til_Ukraina_-_Kiel-instituttets_tall.docx`)
legges i repoet under `src/dashboard/maler/flak-mal.docx` og brukes som
referanse for stil og struktur. Ferdig fil bygges fra grunnen av i kode
(ikke via mal-substitusjon), siden klientside-biblioteker for
mal-substitusjon i Word er umodne.

Norsk språk, FIN-tallformat (komma som desimaltegn, mellomrom som
tusenseparator, "pst." for prosent, "mrd. kroner" for milliarder),
plasseringstabell og figurer i tråd med malen.

Omfang: L. Avhengigheter: M7.5.

## 5. Tidsestimat

Skala: S = ½-1 dag, M = 1-2 dager, L = 2-3 dager.

| Delfase | Omfang | Dager |
|---|---|---|
| Verifisering | (under 1 time) | 0 |
| M7.1 Parser-utvidelse | M | 1-2 |
| M7.2 Aggregering per år | L | 2-3 |
| M7.3 Krysssjekk | S | 0,5-1 |
| M7.4 Dashboard-utvidelse | L | 2-3 |
| M7.5 Flak-forhåndsvisning | M | 1-2 |
| M7.6 Docx-generering | L | 2-3 |
| **Sum** | | **9-14 dager** |

Estimert leveringstid: omtrent 2 ukers utviklingstid.

## 6. Åpne saker som må besluttes før utvikling starter

| Sak | Beskrivelse | Frist |
|---|---|---|
| S17 | Skal befolkning og BNP være fast (excel-metoden) eller fra WDI (dashboardet i dag)? Excel bruker 2021-BNP og fast befolkning. Dashboardet bruker ferskeste WDI-tall. For M7 foreslås at flak-tallene bruker excel-metoden (sikrer reproduserbarhet mot excel), men at dashboardet beholder WDI som default for ordinære visninger. | Før M7.2 |
| S18 | Skal `Country data`-tabellen versjoneres i repoet som `data/reference/country_data.csv`, eller hentes dynamisk fra excel-filen hver gang? Foreslås versjonering, slik at tallene er stabile mellom releaser. | Før M7.1 |
| S19 | Skal flak-malen `flak-mal.docx` ligge i repoet, eller skal docx-generering bygges fra grunnen i kode uten referansemal? | Før M7.6 |
| S20 | Hvilke målepunkt skal flaket vise i tabell 1? Excel-flaket viser 9 rader. Skal denne være konfigurerbar, eller låst til malens struktur? | Før M7.5 |

## 7. Risiko

| ID | Risiko | Sannsynlighet | Konsekvens | Tiltak |
|---|---|---|---|---|
| R15 | Redistr-kolonnen avviker mer fra rå-kolonnen enn forventet, særlig for Norge i 2025 | Lav | Middels | Verifiseringssteget før utvikling kvantifiserer dette. Hvis avviket er stort, må kommunikasjonen rundt skiftet i dashboardet håndteres tydelig. |
| R16 | Docx-generering klientside fungerer dårlig på iOS/Safari | Middels | Middels | Test tidlig (allerede i M7.6 første dag). Fallback: server-side via en lett funksjon - krever ny S-sak om hosting. |
| R17 | Excel-metoden og dashboardet kan vise to forskjellige tall for samme spørsmål, noe som kan forvirre brukerne | Middels | Middels | Tydelige metode-merknader på hver visning. Brukerveiledning utvides med kort sammenligning av excel- og dashboard-tall. |
| R18 | EU-fordelingsnøkkelen i `Country data` er en momentanstørrelse - den kan endre seg over tid (Brexit, utvidelser) | Lav | Lav | Versjoner `country_data.csv`. Dokumenter at den er kopiert fra excel pr. dato XX og må oppdateres manuelt ved EU-endringer. |

## 8. Konsekvenser for eksisterende kode og dokumentasjon

- `parse_kiel.py` og `normalize.py` får nye felter i `Aktivitet` og ny
  CSV `country_summary_aar.csv`.
- `dashboard.js` får to nye globale brytere som styrer alle hovedvisninger.
- `brukerveiledning.md` utvides med kort metode-forklaring av enkeltår-
  visning og EU-fordeling.
- `prosjektplan.md` får M7 som ny milepæl i seksjon 5, og endringslogg
  i seksjon 12 oppdateres.
- `CLAUDE.md` trenger ingen endringer.

## 9. Rollefordeling

| Delfase | Primær rolle |
|---|---|
| Verifisering | dataingenior |
| M7.1 Parser-utvidelse | dataingenior |
| M7.2 Aggregering per år | analytiker |
| M7.3 Krysssjekk | qa |
| M7.4 Dashboard-utvidelse | frontend |
| M7.5 Flak-forhåndsvisning | frontend |
| M7.6 Docx-generering | frontend |

---

*Plan oppdateres etter at S17-S20 er besvart. Endelig versjon godkjennes
av prosjekteier før utvikling på `feature/m7-flak-generering` starter.*
