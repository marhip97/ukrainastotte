# Prosjektplan: Dashboard for Ukraina-støtte basert på Kiel-data

**Versjon:** 1.0
**Dato opprettet:** 22. april 2026
**Prosjekteier:** [Brukerens navn]
**Prosjektleder:** Claude Code (agent: `prosjektleder`)
**Status:** Planlegging / Oppstart

---

## 1. Sammendrag

Prosjektet skal utvikle et automatisert verktøy som henter inn, analyserer og visualiserer data fra Kiel Institute for the World Economy sin *Ukraine Support Tracker*. Leveransen er et HTML-basert dashboard med særlig fokus på Norges støtte til Ukraina, sett i kontekst av øvrige giverland. Dashboardet skal kunne oppdateres løpende når Kiel publiserer nye datasett.

Kiel Institute publiserer jevnlig oppdaterte tall på militær, finansiell og humanitær støtte fra vestlige land til Ukraina. Dataene er en sentral referanse i internasjonal politisk og økonomisk debatt om byrdefordelingen i støtten til Ukraina. Et norskfokusert dashboard vil gjøre det lettere å kommunisere Norges bidrag i relative termer (andel av BNP, per capita, absolutte tall) og følge utviklingen over tid.

---

## 2. Problem- og målbeskrivelse

### 2.1 Problembeskrivelse

Data fra Kiel publiseres i Excel- og PDF-format med relativt kompleks struktur, og krever betydelig manuelt arbeid for å trekke ut norsk-relevante innsikter. Det finnes i dag ikke et lett tilgjengelig norskspråklig verktøy som automatisk henter, normaliserer og visualiserer disse dataene med Norge som referansepunkt. Dette gjør det tungvint å følge utviklingen over tid og å bruke tallene i analyser, medieinnslag, utredninger og politisk diskusjon.

### 2.2 Hovedmål

Utvikle et driftsklart, selvoppdaterende dashboard som gir brukere rask innsikt i Norges støtte til Ukraina sammenlignet med andre giverland, basert på Kiel Institute sine data.

### 2.3 Delmål (SMART)

1. **Datainnhenting:** Automatisert nedlasting og parsing av siste tilgjengelige Kiel-data innen 4 uker fra prosjektoppstart.
2. **Datakvalitet:** Valideringsregler som fanger opp minst 95 prosent av åpenbare datafeil (manglende verdier, formatfeil, plutselige hopp) før visualisering.
3. **Analyse:** Beregning av minst seks standardiserte nøkkeltall for Norge (absolutt støtte, andel BNP, per capita, fordeling militær/finansiell/humanitær, rangering blant giverland, endring siste kvartal).
4. **Visualisering:** HTML-dashboard med minst fire interaktive visualiseringer, lastetid under 3 sekunder på standard bredbånd.
5. **Oppdatering:** Automatisk oppdateringsmekanisme som kan kjøres manuelt eller på planlagt intervall, med tydelig sist oppdatert-markering.
6. **Dokumentasjon:** Komplett teknisk dokumentasjon og brukerveiledning på norsk ved prosjektslutt.

---

## 3. Omfang (scope)

### 3.1 Innenfor scope

- Henting av data fra Kiel Institute Ukraine Support Tracker (offentlig publiserte filer).
- Datavask, normalisering og lagring i strukturert format.
- Analysemodul med Norge-fokuserte nøkkeltall og sammenligninger.
- HTML-dashboard med interaktive grafer.
- Automatisk oppdateringsmekanisme.
- Dokumentasjon og kildekode i GitHub-repository.

### 3.2 Utenfor scope

- Data fra andre kilder enn Kiel Institute (for eksempel SIPRI, NATO, enkeltstatenes forsvarsdepartementer). Kan vurderes i fase 2.
- Prognoser eller prediktive modeller for fremtidig støtte.
- Flerspråklig versjon (kun norsk i første versjon, evt. engelsk i fase 2).
- Mobilapplikasjon (kun responsivt webdashboard).
- Kvalitativ analyse av støtteeffektivitet eller politisk kontekst.

---

## 4. Prosjektorganisasjon og roller

### 4.1 Prosjekteier

**Prosjekteier (brukeren)** har det overordnede ansvaret for prosjektets retning og beslutninger. Prosjekteier:

- Godkjenner prosjektplan, scope-endringer og leveranser.
- Mottar statusrapporter fra prosjektleder (se seksjon 11).
- Tar stilling til saker som eskaleres fra prosjektleder.
- Prioriterer mellom konkurrerende krav og ønsker.

### 4.2 Prosjektgruppen (Claude Code-agenter)

Prosjektet gjennomføres av spesialiserte agenter i Claude Code. Hver agent har et tydelig ansvarsområde.

| Rolle | Agent-navn | Hovedansvar | Kompetanseprofil |
|---|---|---|---|
| Prosjektleder | `prosjektleder` | Koordinering, statusrapportering til prosjekteier, eskalering, oppdatering av status- og fremdriftsprotokoll | Prosjektstyring, risikohåndtering, kommunikasjon |
| Dataingeniør | `dataingenior` | Henting, parsing, validering og lagring av Kiel-data | Python, pandas, web scraping, Excel/PDF-parsing, datamodellering |
| Dataanalytiker | `analytiker` | Beregning av nøkkeltall, sammenligninger, trendanalyse | Statistikk, økonomiske indikatorer, normalisering (BNP/capita) |
| Frontend-utvikler | `frontend` | HTML-dashboard, visualiseringer, interaktivitet, responsivt design | HTML, CSS, JavaScript, D3.js eller Plotly, UX-prinsipper |
| Kvalitetssikrer | `qa` | Testing, validering av output, gjennomgang før leveranse | Testmetodikk, dataverifisering, kritisk blikk |
| DevOps / Drift | `devops` | GitHub-oppsett, CI/CD, automatisk oppdatering, deploy | Git, GitHub Actions, automatisering |

### 4.3 Kommunikasjonslinjer

Alle agenter rapporterer til prosjektleder-agenten. Prosjektleder er eneste kontaktpunkt mot prosjekteier. Dette sikrer at prosjekteier ikke blir overveldet med detaljer, samtidig som all informasjon samles hos en ansvarlig.

---

## 5. Leveranser og milepæler

Prosjektet deles i fem faser. Hver fase har en tydelig leveranse som godkjennes av prosjekteier før neste fase starter.

| Milepæl | Leveranse | Estimert tid fra oppstart | Godkjennes av |
|---|---|---|---|
| M1: Oppstart | Godkjent prosjektplan, GitHub-repo opprettet, arbeidsflyt dokumentert | Uke 1 | Prosjekteier |
| M2: Datapipeline | Kiel-data hentes automatisk og lagres strukturert; valideringsregler på plass | Uke 3 | Prosjekteier |
| M3: Analysemodul | Nøkkeltall beregnet og verifisert; Norge-sammenligninger klare | Uke 5 | Prosjekteier |
| M4: Dashboard MVP | HTML-dashboard med grunnleggende visualiseringer lanseres | Uke 7 | Prosjekteier |
| M5: Produksjon | Automatisk oppdatering, dokumentasjon ferdig, overlevering til drift | Uke 9 | Prosjekteier |

Etter M5 går prosjektet over i driftsfase (se seksjon 10).

---

## 6. Teknisk arkitektur

### 6.1 Teknologivalg (foreløpig)

- **Språk:** Python for datainnhenting og analyse (pandas, requests, openpyxl, pdfplumber).
- **Lagring:** CSV- eller Parquet-filer i repo for enkel versjonskontroll; eventuelt SQLite for mer struktur.
- **Dashboard:** Statisk HTML med JavaScript-biblioteker. Plotly eller D3.js for visualiseringer. Vurderer også Observable Framework eller Quarto for rask iterasjon.
- **Hosting:** GitHub Pages for enkel, gratis statisk hosting.
- **Automatisering:** GitHub Actions for planlagt kjøring av datainnhenting.

Endelig teknologivalg besluttes i M1 av prosjektleder etter input fra dataingeniør og frontend-utvikler. Vesentlige avvik eskaleres til prosjekteier.

### 6.2 Dataflyt

```
Kiel Institute (kilde)
        |
        v
[dataingenior] Nedlasting og parsing
        |
        v
[dataingenior] Validering og normalisering
        |
        v
Rådata + ren data (versjonert i repo)
        |
        v
[analytiker] Beregning av nøkkeltall
        |
        v
Analysefiler (JSON/CSV)
        |
        v
[frontend] Rendering av dashboard
        |
        v
Publisert dashboard (HTML)
```

---

## 7. Risikohåndtering

| ID | Risiko | Sannsynlighet | Konsekvens | Tiltak | Ansvarlig |
|---|---|---|---|---|---|
| R1 | Kiel endrer filformat eller struktur på data | Middels | Høy | Robust parsing med eksplisitte sjekker; fallback til forrige versjon ved parsing-feil | dataingenior |
| R2 | Kiel endrer URL eller publiseringsfrekvens | Lav | Middels | Dokumentert kildeoversikt; overvåking av tilgjengelighet; manuelt nedlastingsalternativ | dataingenior |
| R3 | Feil i analyse gir misvisende tall | Middels | Svært høy | Krysssjekk mot publiserte tall fra Kiel; enhetstester; QA-gjennomgang før publisering | qa, analytiker |
| R4 | Dashboard lastetid blir for høy | Lav | Middels | Forhåndsberegning av aggregater; lazy loading av grafer | frontend |
| R5 | Scope creep ved underveis-ønsker | Middels | Middels | Scope-endringer krever eksplisitt godkjenning av prosjekteier | prosjektleder |
| R6 | Misforståelser mellom prosjekteier og agenter | Middels | Middels | Tydelige statusrapporter; eskalering ved tvil; skriftlige beslutninger i protokollen | prosjektleder |
| R7 | GitHub-konflikter ved parallell utvikling | Lav | Lav | Tydelig branching-strategi; små, hyppige commits | devops |

Risikomatrisen gjennomgås ved hver milepæl og oppdateres ved behov.

---

## 8. Kvalitetssikring og eskaleringspunkter

### 8.1 Kvalitetssikring

- Alle analyser verifiseres mot minst én publisert Kiel-figur før de går i dashboardet.
- All kode gjennomgås av QA-agenten før merge til `main`.
- Dashboardet testes visuelt på minst tre skjermstørrelser.
- Dokumentasjon oppdateres parallelt med kode, ikke til slutt.

### 8.2 Når saker eskaleres til prosjekteier

Prosjektleder løfter saker til prosjekteier i følgende tilfeller:

1. **Scope-endring:** Når det vurderes å legge til eller fjerne funksjonalitet utover det som er avtalt.
2. **Tidsavvik:** Når en milepæl er forsinket med mer enn én uke.
3. **Metodiske valg med politisk implikasjon:** For eksempel hvordan Norges støtte skal defineres (inkluderes lovnader eller kun utbetalt? Inkluderes flyktningkostnader innenlands?). Dette er ikke tekniske valg - det er definisjonsvalg som prosjekteier må ta stilling til.
4. **Datakvalitetsproblemer:** Når Kiel-data ikke kan hentes eller tolkes pålitelig.
5. **Teknologivalg med langsiktig konsekvens:** For eksempel valg av dashboard-rammeverk som binder prosjektet til en bestemt plattform.
6. **Ressursbehov:** Hvis prosjektet trenger tilgang til eksterne tjenester, betalte verktøy eller ytterligere datakilder.

Eskaleringer dokumenteres i status- og fremdriftsprotokollen (seksjon 11).

---

## 9. GitHub-arbeidsflyt (pedagogisk forklaring for prosjekteier)

Denne seksjonen er skrevet for deg som prosjekteier. Målet er at du skal forstå hvordan koden utvikles og endres, og hvordan du kan følge med uten å måtte være utvikler selv.

### 9.1 Hva er GitHub, og hvorfor bruker vi det?

GitHub er en tjeneste for å lagre kode på en måte som gjør at man kan spore hver eneste endring over tid. Tenk på det som en logg der hver lille endring er datostemplet og signert av den som gjorde den. Hvis noe går galt, kan man gå tilbake til hvordan koden så ut før. Hvis flere jobber sammen (slik vi gjør med flere agenter), kan arbeidet slås sammen på en kontrollert måte.

### 9.2 Hovedbegreper du bør kjenne til

- **Repository (repo):** Selve prosjektmappen. Alt som tilhører prosjektet ligger her.
- **Commit:** En lagret endring. Som å lagre et dokument, men med en kort beskrivelse av hva som ble endret.
- **Branch:** En parallell versjon av koden. Tenk på det som en arbeidskopi der man kan prøve ting uten å påvirke hovedversjonen.
- **Main (hovedbranch):** Den offisielle, stabile versjonen. Her skal alt være som skal produksjon.
- **Pull request (PR):** En forespørsel om å flette endringer fra en branch inn i main. Dette er sjekkpunktet der QA-agenten og prosjektleder går gjennom koden før den godkjennes.
- **Issue:** En registrering av en oppgave, en feil eller et forslag. Brukes til å holde oversikt.

### 9.3 Arbeidsflyten vi skal bruke

Vi bruker en enkel og robust flyt som passer prosjektets størrelse:

1. **Main-branchen er alltid stabil.** Alt som ligger der, skal være testet og fungere.
2. **Alt arbeid skjer på egne branches.** Når dataingeniør-agenten skal lage parsing av Kiel-data, opprettes en branch med navn som `feature/kiel-parser`. All utvikling skjer der.
3. **Når noe er ferdig, lages en pull request.** QA-agenten går gjennom, prosjektleder godkjenner, og endringen flettes inn i main.
4. **Små, hyppige commits.** Hver commit skal gjøre én ting og ha en tydelig beskrivelse. Dette gjør det lett å finne feil senere.

### 9.4 Hvordan du som prosjekteier følger med

Du trenger ikke å kunne Git for å følge prosjektet. På GitHub kan du:

- Se en **aktivitetslogg** på forsiden som viser hva som har skjedd sist.
- Åpne **Pull requests**-fanen for å se hva som er under vurdering.
- Åpne **Issues**-fanen for å se hva som ligger på vent eller pågår.
- Lese **README.md** for en oppdatert beskrivelse av prosjektet.
- Lese **prosjektplan.md** (denne filen) for status og fremdrift.

### 9.5 Commit-meldinger - hvordan lese dem

Vi bruker et enkelt format: `type: kort beskrivelse`. Eksempler:

- `feat: legg til parsing av Kiel sitt Excel-ark` - ny funksjonalitet
- `fix: rett beregning av BNP-andel for Norge` - en feilretting
- `docs: oppdater README med installasjonsveiledning` - dokumentasjon
- `refactor: rydd i datavalidering` - omstrukturering uten ny funksjonalitet
- `test: legg til test for valutakonvertering` - tester

Når du ser på historikken, skal du kunne lese commit-meldingene som en slags dagbok over prosjektet.

### 9.6 Hva du bør gjøre som prosjekteier

- **Ikke commit direkte til main.** La agentene jobbe i branches og lever pull requests.
- **Godkjenn pull requests når du får beskjed.** Prosjektleder varsler når noe venter på godkjenning. Du trenger ikke lese all kode, men du bør bekrefte at leveransen stemmer med det som var avtalt.
- **Stol på QA-agenten for teknisk gjennomgang.** Din rolle er å sjekke at det riktige er bygget, ikke at det er bygget riktig.
- **Bruk Issues når du har ønsker eller spørsmål.** Da blir det dokumentert og prioritert på linje med annet.

### 9.7 Repo-struktur

Foreslått mappestruktur:

```
ukraina-dashboard/
├── README.md              # Oversikt og kom-i-gang
├── prosjektplan.md        # Denne filen
├── data/
│   ├── raw/               # Rådata fra Kiel (ikke redigeres manuelt)
│   └── processed/         # Renset og normalisert data
├── src/
│   ├── ingest/            # Datainnhenting
│   ├── analyze/           # Beregninger
│   └── dashboard/         # HTML/JS/CSS
├── tests/                 # Automatiserte tester
├── docs/                  # Dokumentasjon
└── .github/
    └── workflows/         # Automatisk oppdatering
```

---

## 10. Drifts- og vedlikeholdsplan

Når M5 er nådd, går prosjektet over i drift. Drift innebærer:

- **Automatisk datauthenting:** GitHub Actions kjører planlagt (foreslått ukentlig) og henter nye data hvis tilgjengelig.
- **Varsling ved feil:** Hvis datauthenting feiler, opprettes automatisk en Issue slik at ansvarlig agent blir varslet.
- **Kvartalsvis gjennomgang:** Prosjektleder gjennomgår dashboardet og vurderer om det trengs oppdateringer basert på endringer hos Kiel eller tilbakemeldinger.
- **Årlig større revisjon:** Vurdering av om dashboardet bør utvides eller moderniseres.

Prosjekteier varsles kvartalsvis med en kort driftsrapport.

---

## 11. Status- og fremdriftsprotokoll

Denne protokollen oppdateres av prosjektleder-agenten gjennom hele prosjektet. Hver oppdatering har dato, fase, status, hva som er gjort, hva som er neste steg, og eventuelle saker som er løftet til prosjekteier.

### 11.1 Logg

| Dato | Fase | Status | Oppsummering | Ansvarlig | Saker til prosjekteier |
|---|---|---|---|---|---|
| 2026-04-22 | M1: Oppstart | Planlegging | Prosjektplan utarbeidet og klar for godkjenning. | prosjektleder | Godkjenning av prosjektplan; bekreftelse av scope og milepæler. |
| 2026-04-22 | M1: Oppstart | Under godkjenning | Prosjekteier godkjente prosjektplan v1.0 (S1) og valgte å omdøpe arbeidsbranchen til `feature/m1-oppstart` (S4). Repo-strukturen fra seksjon 9.7 er opprettet med `.gitkeep`-plassholdere. `README.md`, `.gitignore`, Issue-maler og PR-mal er lagt til. M1-leveransen klar for pull request mot `main`. | prosjektleder | Godkjenning av M1-leveranse (pull request). |
| 2026-04-22 | M1: Oppstart | Ferdig | Pull request #1 godkjent og merget til `main` av prosjekteier. Strukturell M1-leveranse fullført. Beslutningssak S2 (definisjon av "Norges støtte") utarbeidet som dokument under `docs/beslutningssaker/` med fire alternativer og tilrådning D. | prosjektleder | Beslutning på S2 før M3-oppstart. |
| 2026-04-22 | Mellom M1 og M2 | Ferdig | PR #2 merget. Beslutningssak S2 i main. | prosjektleder | — |
| 2026-04-22 | Mellom M1 og M2 | Besluttet | Prosjekteier valgte **alternativ D med alternativ B som standardvisning** for S2. Dashboardet får tre visninger (kun utbetalt / Kiel-hovedinndeling / inkludert flyktningkostnader) med Kiel-hovedinndeling som default. Føringer for M2-M4 dokumentert i beslutningsdokumentet. | prosjektleder | — |
| 2026-04-22 | Mellom M1 og M2 | Besluttet | Prosjekteier besluttet **GitHub Pages** som hosting for dashboardet (S3). GitHub Actions vil brukes til automatisk deploy. Ingen eksterne kontoer involvert. | prosjektleder | — |
| 2026-04-22 | M2: Datapipeline | Pågår | Kildekartlegging av Kiel Ukraine Support Tracker gjennomført. Notat i `docs/kartlegging-kiel.md` dekker publiseringskanaler, filformat (XLSX, Release 23, data fram til feb 2026), metodikk (commitments/allocations/disbursements), flyktningkostnader, lisens og risiko (domene-endring ifw-kiel.de→kielinstitut.de, 403 på WebFetch). CLAUDE.md utvidet med seksjon om timeout-forebygging. | dataingenior, prosjektleder | — |
| 2026-04-22 | M2: Datapipeline | Pågår | Automatisk henting etablert: `src/ingest/fetch_kiel.py` + workflow `.github/workflows/fetch-kiel.yml` (ukentlig cron + manuell trigger, committer ny fil via github-actions-bot, oppretter Issue ved feil). Parser-skjelett `src/ingest/parse_kiel.py` med eksplisitte kolonnekontrakter (`KolonneKontraktFeil`). To enhetstester i `tests/test_parse_kiel.py` passerer mot generert fixture. `requirements.txt` opprettet. Sandkassen tillater ikke direkte nedlasting fra Kiel, så verifisering mot ekte fil skjer først når workflow har kjørt eller fil lastes ned manuelt. | dataingenior | — |
| 2026-04-22 | M2: Datapipeline | Pågår | Workflow kjørt i GitHub - hentet Release 28 (~10 MB) til `data/raw/kiel/`. Parser omskrevet mot ekte struktur: to datastruktur (Aktivitet, LandSummary), lesing av begge hovedark (`Bilateral Assistance, MAIN DATA` og `Country Summary (€)`), strippet whitespace i kategori. 4 tester passerer, inkl. kryssjekk mot Norges total-allocation (10.0 mrd EUR). Kartleggingsnotatet oppdatert med verifisert struktur og kjente nøkkeltall for Norge. | dataingenior | — |
| 2026-04-22 | M2: Datapipeline | Pågår | Test-CI lagt til (`.github/workflows/tests.yml`) - kjører pytest automatisk ved PR og push til main. Sikrer at parser-kontrakt og kryssjekk-tester alltid er grønne før merge. | devops | — |
| 2026-04-22 | M2: Datapipeline | Pågår | Normalisering implementert (`src/ingest/normalize.py`) - produserer `data/processed/{country_summary.csv, bilateral_activities.csv, metadata.json}`. 43 land og 5565 aktivitetsrader fra Release 28. Workflow `fetch-kiel.yml` utvidet til å kjøre normalize etter fetch og committe både raw og processed i samme commit; oppretter Issue hvis enten henting eller normalisering feiler. To nye tester (6/6 grønne). | dataingenior | — |
| 2026-04-22 | M2: Datapipeline | Pågår | Utvidet validering: `validate_summary` i `parse_kiel.py` sjekker komponentsummer, `commitment >= allocation`, negative og urimelig høye verdier. Fant tre ekte dataavvik i Release 28 (Australia, Irland, Italia har `total_commitment < total_allocation` med små marginer). Parser filtrerer "Total"/"EU"-aggregatrader. 11/11 tester grønne. | dataingenior | — |
| 2026-04-22 | M2: Datapipeline | **Ferdig** | Disbursement-kobling: `parse_financial_disbursements` leser arket `Financial disb per Month (€)` (månedlige utbetalinger per land, € mrd). 131 utbetalinger fra 23 land i Release 28; Norge har 5 utbetalinger (sum 0.65 mrd EUR). `normalize.py` produserer `data/processed/financial_disbursements.csv`. Kartleggingsnotat oppdatert med at arket kun dekker finansielle budget support-utbetalinger. 13/13 tester grønne. **M2 er dermed fullført iht. plan**; M3 Analysemodul kan starte. | dataingenior, prosjektleder | — |
| 2026-04-22 | M3: Analysemodul | Pågår | Første tre av seks nøkkeltall implementert i `src/analyze/noekkeltall.py`: absolutt støtte (allocation + commitment), fordeling militær/finansiell/humanitær (prosent), rangering blant giverland. Tre tester + kryssjekk mot Norges publiserte tall (10.01 mrd EUR allocation, 24.72 mrd commitment, 61.9 % militær, rangering 10 allocation / 5 commitment blant 42 land). 16/16 tester grønne. Gjenstår: BNP-andel, per capita, endring siste kvartal. | analytiker | — |
| 2026-04-22 | M3: Analysemodul | Pågår | Nøkkeltall 6 (endring) implementert som `src/analyze/endring.py` - tar to `LandSummary`-lister og returnerer delta per land. Meningsfullt resultat krever minst to releaser i `data/raw/kiel/`; fungerer som ren-funksjon allerede nå. Ny sak **S6** åpnet for kildevalg til BNP-andel og per capita (nøkkeltall 2+3); prosjektleders forslag er Verdensbanken WDI med 2023-tall. 3 nye tester (19/19 grønne). | analytiker, prosjektleder | S6: kildevalg for BNP/folketall (nøkkeltall 2+3). |
| 2026-04-22 | M4: Dashboard MVP | Pågår | Skjelett av HTML-dashboard i `src/dashboard/` (index.html, styles.css, dashboard.js). Leser `data/processed/country_summary.csv` ved runtime. Viser fire nøkkeltall for Norge (total allocation, total commitment, rangering allocation, rangering commitment), fordelingsdiagram (Plotly donut) og rangering topp 15 (Plotly bar). Visningsbryter for allocation/commitment iht. S2-beslutningen. Verifisert lokalt via `python -m http.server`. Pages-deploy kommer i neste PR. | frontend | — |
| 2026-04-22 | M4: Dashboard MVP | Pågår | Hosting-omvalg (**S7**): GitHub Pages krever offentlig repo på gratisplanen. Prosjekteier valgte **Netlify** i stedet - støtter private repo-er gratis. Netlify-prosjekt opprettet og koblet til `main`. Ny `netlify.toml` + `scripts/build-netlify.sh` bygger `_site/` og speiler deploy-strukturen. PR #15 (GitHub Pages) lukket uendret. | devops, prosjektleder | — |
| 2026-04-22 | M4: Dashboard MVP | Pågår | **Dashboard live på <https://ukrainastotte.netlify.app/>**. PR #16 merget, Netlify bygde og publiserte automatisk. README oppdatert med URL. | devops, prosjektleder | — |
| 2026-04-22 | M4: Dashboard MVP | Pågår | Tredje S2-visning "kun utbetalt" lagt til i dashboardet. Leser `financial_disbursements.csv`, summerer per land, og viser rangering + tydelig merknad om at utbetalingsarket bare dekker finansielle budget support (ikke militær/humanitær). Netlify-build oppdatert til å sette `window.DISB_PATH`. Alle tre S2-visninger nå tilgjengelig iht. plan. | frontend, prosjektleder | — |
| 2026-04-22 | M3: Analysemodul | Pågår | S6 lukket: prosjekteier valgte Verdensbanken WDI med "Most Recent Value"-strategi (ferskeste endelige tall per land). Ny modul `src/ingest/fetch_wdi.py` henter BNP (NY.GDP.MKTP.CD) og folketall (SP.POP.TOTL) for 38+ av Kiels 42 giverland (EU-institusjoner, EIB og Taiwan utelatt). Ny workflow `.github/workflows/fetch-wdi.yml` kjører månedlig + manuelt og committer `data/reference/wdi.json`. Ny `src/analyze/noekkeltall_relative.py` beregner BNP-andel (%) og per capita (EUR/innbygger). Tre tester (22/22 grønne). Dashboard-integrasjon kommer i egen PR når workflow har produsert wdi.json. | dataingenior, analytiker, prosjektleder | — |
| 2026-04-23 | M3/M4 | Pågår | WDI-workflow kjørt: `data/reference/wdi.json` dekker 40 av 42 giverland med 2024-tall. `normalize.py` utvidet til å skrive `country_summary_relative.csv` når `wdi.json` finnes. Dashboard utvidet med to nye nøkkeltall-kort (andel av BNP, per innbygger) og to nye rangeringskort. Visningsbryteren har nå fem valg: allokering, forpliktelse, utbetalt, andel BNP, per innbygger. `docs/beslutningssaker/S6-kilde-bnp-folketall.md` opprettet. Norge: 2,23 % av BNP, 1796 EUR/innbygger. Fem av seks M3-nøkkeltall ferdig og visualisert (siste er kvartalsendring - beregnes, men ikke visualisert ennå). | analytiker, frontend, prosjektleder | — |
| 2026-04-23 | M3: Analysemodul | Pågår | Nøkkeltall 6 (endring siste release) visualisert. `normalize.py` skriver `country_summary_endring.csv` når det finnes ≥2 Kiel-releaser i `data/raw/kiel/`. Dashboard har nytt nøkkeltall-kort "Endring siste release" og ny visningsmodus "Endring siste release" (stolpegraf per komponent for Norge + rangering av endring per giver). Graceful fallback: dashboardet viser "Kun én Kiel-release lagret" så lenge vi bare har release 28. To nye tester (24/24 grønne). M3 er nå funksjonelt komplett; endringstall materialiserer seg automatisk når release 29 hentes. | analytiker, frontend, prosjektleder | — |
| 2026-04-23 | QA Release 28 | Ferdig | Første systematiske QA-krysssjekk utført. `scripts/qa_krysssjekk.py` kjører 103 interne sjekker + verifisering mot Kiel Policy Brief (februar 2026). Resultat: 103 OK, 0 kritiske feil, 6 observerte avvik i Kiels rådata (alle dokumentert og håndtert - Australia/Irland/Italia/Slovakia har commitment<allocation, Tyskland/Storbritannia har disbursement>financial_allocation). Nordic-topprangering bekreftet: Danmark (2,80 %), Estonia (2,40 %), Norge (2,23 %), Sverige (1,85 %) i topp 5 på BNP-andel. Norges 10 mrd EUR konsistent med Kiels 3,6 mrd for 2025 alene + tidligere år. Rapport: `docs/qa/qa-rapport-release28.md`. Data er godkjent for publisering. | qa, prosjektleder | — |
| 2026-04-23 | M5: Produksjon | Pågår | Første M5-leveranser: brukerveiledning på norsk (`docs/brukerveiledning.md`) for journalister/utredere/forskere. Driftoverlevering (`docs/drift/overlevering.md`) med komponentoversikt, driftsjekkliste, varslingsrutiner og fire vanlige driftsscenarier. README oppdatert med lenker og lokal kjøreguide. Punkt 1 i M5 (end-to-end-test av fetch-kiel-workflow) utført av prosjekteier manuelt. | prosjektleder, devops, frontend | — |

### 11.2 Åpne saker til avklaring hos prosjekteier

*(Ingen åpne saker.)*

### 11.3 Lukkede saker

| ID | Dato løftet | Dato lukket | Sak | Utfall |
|---|---|---|---|---|
| S1 | 2026-04-22 | 2026-04-22 | Godkjenning av prosjektplan v1.0 | Godkjent av prosjekteier. Danner grunnlag for oppstart av M2. |
| S2 | 2026-04-22 | 2026-04-22 | Definisjonsvalg for "Norges støtte til Ukraina" | Prosjekteier valgte **alternativ D med B som standardvisning** - flermåls-tilnærming med Kiel-hovedinndeling som default, og underordnede visninger for "kun utbetalt" og "inkludert flyktningkostnader". Se `docs/beslutningssaker/S2-definisjon-av-norges-stotte.md` for føringer. |
| S3 | 2026-04-22 | 2026-04-22 | Hosting av dashboardet | Prosjekteier valgte **GitHub Pages** (prosjektleders tilrådning). Automatisk deploy via GitHub Actions. Vurderes på nytt kun hvis prosjektet senere får behov for server-side prosessering, noe som ikke er i scope. |
| S4 | 2026-04-22 | 2026-04-22 | Branch-navnkonvensjon (agent-indusert `claude/...` vs. `feature/...` i CLAUDE.md) | Prosjekteier valgte omdøping til `feature/m1-oppstart`. Konsekvens: fremtidige branches følger `feature/<kort-beskrivelse>` som definert i CLAUDE.md. |
| S5 | 2026-04-22 | 2026-04-22 | Godkjenning av M1-leveransen (pull request mot `main`) | Pull request #1 godkjent og merget av prosjekteier. M1 satt til Ferdig. |
| S6 | 2026-04-22 | 2026-04-22 | Kildevalg for BNP og folketall (nøkkeltall 2 og 3) | Prosjekteier prioriterte mest oppdaterte tall. Valg: **Verdensbanken WDI med MRV (Most Recent Value)** - gir ferskeste endelige tall per land (typisk 2024 for utviklede land). Referanseår dokumenteres per land i `data/reference/wdi.json`. EU-institusjoner, EIB og Taiwan utelatt fra WDI-henting (ikke land eller ikke dekket). |
| S7 | 2026-04-22 | 2026-04-22 | Hosting-omvalg - GitHub Pages krever offentlig repo | Prosjekteier valgte **Netlify** (gratis private repo). GitHub Pages-workflow (PR #15) lukket uendret. S3 overstyres av dette valget. |

### 11.4 Milepælsstatus

| Milepæl | Planlagt uke | Status | Kommentar |
|---|---|---|---|
| M1: Oppstart | Uke 1 | Ferdig | Levert via PR #1 og godkjent 2026-04-22. |
| M2: Datapipeline | Uke 3 | Ferdig | Full pipeline: fetch-workflow, parser (bilateral + summary + disbursements), validering, normalisering til CSV-er i `data/processed/`. Verifisert mot Release 28 og Norges publiserte totals. 13/13 tester grønne. |
| M3: Analysemodul | Uke 5 | Pågår | 3 av 6 nøkkeltall ferdig (absolutt, fordeling, rangering). Gjenstår: BNP-andel, per capita, endring siste kvartal. |
| M4: Dashboard MVP | Uke 7 | Pågår | Skjelett bygget (fire nøkkeltall + to Plotly-grafer + visningsbryter). Gjenstår: Pages-deploy, integrasjon av BNP/per-capita etter S6, endring-graf når historikk finnes. |
| M5: Produksjon | Uke 9 | Ikke startet | GitHub Actions for automatisk datauthenting og Pages-deploy. |

---

## 12. Endringslogg for prosjektplanen

| Versjon | Dato | Endring | Utført av |
|---|---|---|---|
| 1.0 | 2026-04-22 | Første versjon opprettet | prosjektleder |

---

*Dette dokumentet er et levende dokument og oppdateres av prosjektleder-agenten gjennom hele prosjektets levetid. Vesentlige endringer i plan, scope eller mål krever godkjenning fra prosjekteier.*
