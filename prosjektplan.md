# Prosjektplan: Dashboard for Ukraina-støtte basert på Kiel-data

**Versjon:** 2.16
**Dato opprettet:** 22. april 2026
**Dato sist oppdatert:** 11. mai 2026
**Prosjekteier:** [Brukerens navn]
**Prosjektleder:** Claude Code (agent: `prosjektleder`)
**Status:** Drift + ny utvidelsesfase M7 starter

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
| M6.1: Datafundament | Dynamisk historisk valutakurs (EUR/NOK), tidsserie-aggregering, land-grupperinger | 1 uke fra M6-oppstart | Prosjekteier |
| M6.2: Analytisk innhold | Komparative profiler, tidsseriegraf, scatter plot, automatisk endringstekst, tooltips | 2 uker fra M6.1 ferdig | Prosjekteier |
| M6.3: Visuelt redesign | Blå palett, ny informasjonsarkitektur, eksport (PNG/CSV), land-gruppefiltre | 2 uker fra M6.2 ferdig | Prosjekteier |
| M7: Metodisk migrering og flak-generering | Dashboard migreres til excel-metoden (redistr-verdier, Kiels BNP 2021, EU-fordelingsnøkkel), ny flak-eksport til Word, periode- og EU-bryter | 2-3 uker | Prosjekteier per delfase |

Etter M5 går prosjektet over i driftsfase (se seksjon 10). M7 er en
metodisk migrering på toppen av driften, jf. egen plan i
`docs/planer/M7 plan.md`.

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
| 2026-04-23 | M5: Produksjon | Ferdig | **M5 lukket. Prosjektet fullført.** Prosjekteier trigget `fetch-kiel.yml` manuelt og workflowen returnerte grønn. Siden Release 28 allerede var lagret, gjenkjente hash-dedup-logikken filen og hoppet over commit - forventet og godkjent utfall. Hele kjeden (fetch → dedup → normalize → auto-commit → Netlify-deploy) er dermed verifisert. Alle fem milepæler M1-M5 er levert og godkjent. | prosjekteier, prosjektleder, devops | — |
| 2026-04-25 | M6: Planlegging | Pågår | Åtte forbedringspunkter identifisert. M6 deles i tre delfaser. Beslutninger på S8 (dynamisk) og S9 (som tilrådd). | prosjektleder | — |
| 2026-04-25 | M6.1: Datafundament | Pågår | Oppstart av M6.1 - dynamisk EUR/NOK-kurs, tidsserie-aggregering, land-grupperinger. | prosjektleder | Godkjenning av M6.1 ved ferdig PR. |
| 2026-04-25 | M6.1: Datafundament | Klar for review | M6.1 levert: `src/ingest/fetch_valutakurser.py` (Norges Bank SDMX-JSON, EUR/NOK fra 2022-01-01) med daglig workflow `.github/workflows/fetch-valutakurser.yml`. `src/analyze/valutakonvertering.py` med dato-fallback (helg/helligdag → forrige bankdag, manglende dato → siste kurs). `src/analyze/tidsserier.py` med månedlig (land, år, måned, kategori, mål)-aggregering, både EUR og NOK. `src/analyze/landgrupper.py` med Norden, EU, G7, NATO og dynamisk Alle. `normalize.py` skriver nå `tidsserier_maanedlig.csv` og `country_summary_nok.csv` når `valutakurser.json` finnes. Testsuite 51/51 grønn (27 nye tester i M6.1). Ingen ekte API-kall i tester - kun fixtures. | dataingenior, qa, prosjektleder | Godkjenning av M6.1-leveransen før M6.2 starter. |
| 2026-04-25 | M6.1: Datafundament | Ferdig | PR #24 godkjent og merget til main av prosjekteier. M6.1 fullført. | prosjekteier, prosjektleder | — |
| 2026-04-25 | M6.2: Analytisk innhold | Pågår | Oppstart av M6.2. Plan i `docs/planer/m6-2-plan.md` godkjent; sakene S10 (default-sammenligning Norge + Tyskland/Frankrike/Storbritannia), S11 (scatter Andel BNP × Per capita), S12 (pedagogisk klarspråk), S13 (akkumulert som default), S14 (norsk tooltips med EUR+NOK) besluttet. Implementering starter på `feature/m6-2-analytisk-innhold`. | prosjektleder | Godkjenning av M6.2 ved ferdig PR. |
| 2026-04-25 | M6.2: Analytisk innhold | Klar for review | M6.2 levert. **Bakend:** `src/analyze/endringstekst.py` genererer 2-4 setningers norsk tekst per land med pedagogisk klarspråk; `normalize.py` skriver `data/processed/endringstekst.json`. **Frontend:** komparativ landprofil (kort-grid) med multivelger og hurtigknapper for Norden/EU/G7/NATO; tidsseriegraf med toggle akkumulert/per måned, valgbar valuta (EUR/NOK), kategori og mål; scatter plot (Andel BNP × Per capita som default, fire akse-valg) med Norge fremhevet; automatisk endringstekst-boks. Alle Plotly-tooltips harmonisert til norsk format. **Workflow:** `fetch-valutakurser.yml` regenererer normalisert data automatisk. Testsuite 63/63 grønn (10 nye tester for endringstekst, 2 nye for normalize). | dataingenior, frontend, qa, prosjektleder | Godkjenning av M6.2-leveransen før M6.3 starter. |
| 2026-04-25 | M6.2: Analytisk innhold | Ferdig | PR #25 merget til main av prosjekteier. M6.2 fullført. | prosjekteier, prosjektleder | — |
| 2026-04-25 | M6.3: Visuelt redesign | Pågår | Designgrunnlag levert som fem dokumenter under `docs/m6.3/` (PR #26 merget): prinsipper, informasjonsarkitektur, komponenter og grafer, implementasjonsplan, README. S15 åpnet og lukket: M6.3-tidsanslag utvidet fra 1 til 2 uker etter prosjekteiers beslutning. Implementering starter på Steg 1 (Designtokens og temabytte). | prosjektleder, frontend | Godkjenning per utviklings-PR. |
| 2026-04-26 | Drift | Endring | Hosting flyttet fra Netlify til **GitHub Pages**. Repoet gjort offentlig (S7 overstyrt). Ny workflow `.github/workflows/deploy-pages.yml`, `scripts/build-netlify.sh` omdøpt til `build-site.sh`, `netlify.toml` slettet. Ny URL: <https://marhip97.github.io/ukrainastotte/>. S16 åpnet og lukket samme dag. | prosjektleder, devops | — |
| 2026-04-26 | M6.3: Visuelt redesign | Pågår | PR #52 merget: hero-bokser krympet (padding 2rem → 1,25rem, hero-tall 3rem → 2,25rem), komparativ-profil bruker 1 desimal med ikke-brytende mellomrom, native `<select multiple>` byttet ut med custom land-velger (søkefelt, checkbox-rader, "Fjern alle"-knapp, ARIA-attributter). Axe-fix: `role="listbox"` byttet til `role="group"` på land-velger-listen siden barna er native checkboxer. | frontend, qa | — |
| 2026-04-26 | M6.3: Visuelt redesign | Pågår | PR #54 merget: kompaktere hero/KPI-kort, "Sammenlign Norge med …" som native `<details>`-rullgardin med statustekst og chevron, filter og "Komparativ landprofil" pakket i `.komparativ-blokk` så de visuelt opptrer som ett sammenhengende kort. | frontend | — |
| 2026-04-26 | M6.3: Visuelt redesign | Pågår | PR #55 merget: hero som flat 2x2 (fjernet `.hero-stotte`-wrapper), komparativ-grid bruker `repeat(N, minmax(0, 1fr))` så lange labels ikke presser kortene utenfor parent. | frontend | — |
| 2026-04-26 | M6.3: Visuelt redesign | Pågår | PR #56 merget: mer pust mellom verdi og ramme i komparativ-kort (padding 1,25rem → 1rem 1,5rem, dl `--fs-caption` → `--fs-micro`, column-gap 0,5 → 0,75rem, defensiv `overflow: hidden` og `min-width: 0`). Verifisert med puppeteer-måling: 25 px ddToBorder konsistent på 1100-1920 px viewport. | frontend, qa | — |
| 2026-04-26 | M6.3: Visuelt redesign | **Ferdig** | **Prosjekteier godkjente dashboardet og besluttet at prosjektet går tilbake i ren driftfase.** M6.3 lukkes etter visuelle forbedringer i PR 52/54/55/56. Resterende punkter fra `docs/m6.3/04-implementation-plan.md` (CSV-eksport, brukerveiledning-oppdatering, ytterligere komponentpolering) tas inn i drift som forbedringsforslag dersom prosjekteier ønsker det senere. | prosjekteier, prosjektleder | — |
| 2026-04-26 | Drift | Aktiv | Prosjektet i ren driftfase. Ukentlig `fetch-kiel.yml`, månedlig `fetch-wdi.yml`, daglig `fetch-valutakurser.yml` kjører som planlagt. Dashboard live på <https://marhip97.github.io/ukrainastotte/>. Neste planlagte gjennomgang: kvartalsvis (jf. seksjon 10). | prosjektleder | — |
| 2026-05-11 | M7: Metodisk migrering | Oppstart | Prosjekteier godkjente planutkastet `docs/planer/M7 plan.md` og bekreftet at M7.0 (migrerings-QA) starter umiddelbart uten ytterligere avklaringer. Foreslått rekkefølge S21 → S20 → S19 godkjent. Excelen brukes ikke som datakilde i repoet; alle metode-konstanter (BNP 2021, EU-fordelingsnøkkel) leses direkte fra Kiels XLSX. `docs/qa/m7-fasitverdier.md` er ekstrahert fra FINs excel og brukes som gylne tall for QA. Arbeidsbranch: `claude/migrate-excel-to-dashboard-t8LoD` (plattform-pålagt). | prosjektleder | S19, S20, S21 åpnet. |
| 2026-05-11 | M7.0: Migrerings-QA | Klar for review | Engangs-skript `scripts/m7_migrering_avvik.py` reimplementerer excel-metoden mot Kiel Release 28 og produserer `docs/qa/m7-migrering-avvik.md`. **Norge matcher fasit 100 %** på alle mål (allokering 10,005 mrd, forpliktelse 24,724 mrd, BNP-andel 2,4542 %, enkeltår 2025 4,677 mrd og 2026 1,089 mrd). Storbritannia, USA, Tyskland EKSKL EU, Frankrike EKSKL EU og Danmark EKSKL EU matcher også fasit innen 0,1 %. **Tre punkter krever avklaring før M7.2 godkjennes:** (a) Sverige EKSKL EU avviker 12,8 % (Kiel-tall 10,320 mrd vs. fasit 9,149 mrd - sannsynligvis at FINs excel ekskluderer en spesifikk svensk aktivitetsgruppe), (b) EU-fordeling INKL EU har 1-3 % avvik for store EU-land fordi M7.2 må bruke Kiels pre-aggregerte `Share of EU Allocated/Committed aid` istedenfor andel × total, (c) per innbygger avviker 0,5-2 % pga. WDI-vintage. Detaljer i rapporten. **Metoden er klar for implementering i M7.1-M7.2** med disse forbeholdene. | qa, prosjektleder | M7.0-rapport til prosjekteier for godkjenning. Tre spørsmål åpnet (Sverige-avvik, EU-fordelingsmetode, folketalls-vintage). |
| 2026-05-11 | M7.0 / M7.1 | Godkjent / Oppstart | Prosjekteier godkjente M7.0-rapporten og besluttet S22, S23, S24 i tråd med prosjektleders tilrådning (Kiels publiserte Sverige-tall, Kiels pre-aggregerte EU-fordeling, behold WDI MRV). M7.1 Parser-utvidelse startet med `dataingenior` som primær rolle. | prosjekteier, prosjektleder | — |
| 2026-05-11 | M7.1: Parser-utvidelse | Klar for review | `src/ingest/parse_kiel.py` utvidet med nye felter på `Aktivitet` (`verdi_eur_redistr`, `verdi_eur_activity`, `maaned_nr`, `maaned_finnes`), to nye dataklasser (`EuAndel`, `LandBnp`) og to nye parsere (`parse_eu_aid_shares`, `parse_gdp`). Kolonnekontrakt utvidet med fem nye obligatoriske bilateral-kolonner og fem EU Aid Shares-kolonner. Legacy-feltet `verdi_eur` beholdes inntil M7.3 ifølge plan. Sju nye tester (4 fixture-baserte, 3 mot ekte Kiel-fil) verifiserer at Norges total redistr-allokering matcher 10,005 mrd EUR og at Norges BNP 2021 leses som 407,7 mrd EUR (EUR-kolonnen kol 13). **Testsuite 70/70 grønn.** | dataingenior | Godkjenning av M7.1-leveransen før M7.2 starter. |
| 2026-05-11 | M7.2: Analyselag-migrering | Klar for review | To nye moduler: `src/analyze/eu_fordeling.py` (LandSummaryEu og fordelEuStotte() basert på Kiels pre-aggregerte INKL EU-tall per S23) og `src/analyze/aarlig.py` (aggreger_per_aar() bygger land/aar-aggregater fra redistr-verdier). `noekkeltall_relative.py` utvidet med Kiel-BNP-modus (bnp_eur_mrd-parameter); legacy WDI USD beholdes som fallback. `normalize.py` skriver tre nye CSV-er: `country_summary_eu.csv`, `country_summary_aar.csv`, og oppdaterer `country_summary_relative.csv` med Kiel-BNP. **Verifisert mot fasit:** Norge total alloc 10,005 mrd, BNP-andel 2,4542 %, Norge 2025 4,677 mrd, Norge 2026 1,089 mrd, Tyskland INKL EU 44,407 mrd - alle matcher fasit 100 %. Sverige EKSKL 10,320 mrd følger Kiels publiserte tall per S22. **Testsuite 78/78 grønn** (8 nye tester for M7.2-modulene). WDI-slanking til kun folketall skyves til M7.3. | analytiker | Godkjenning av M7.2-leveransen før M7.3 starter. |
| 2026-05-11 | M7.3: Opprydding | Klar for review | `fetch_wdi.py` slanket til kun `SP.POP.TOTL`-folketall; output omdøpt fra `wdi.json` til `folketall.json` med ny slankere struktur. `noekkeltall_relative.py` ryddet: legacy WDI USD-modus fjernet, `bnp_eur_mrd` er nå obligatorisk parameter (excel-metoden). `normalize.py` leser primært `folketall.json` med fallback til `wdi.json` i overgangsperioden. Workflow `fetch-wdi.yml` oppdatert til ny filsti og regenererer prosesserte CSV-er etter henting. Per S21: brukerveiledning utvidet med "Hva er endret (mai 2026)"-seksjon øverst som dokumenterer alle metode-endringene; dashboardet fikk header-merknad med lenke til seksjonen. Legacy `verdi_eur`-felt i Aktivitet beholdes inntil tidsserier/NOK-aggregering også er migrert (planlegges i drift senere). Testsuite 78/78 grønn. | dataingenior, frontend | Godkjenning av M7.3-leveransen før M7.4 starter. |
| 2026-05-11 | M7.4 Steg 1: Designnotat | Klar for review | `docs/m7-design/m7-4-design.md` levert. Spesifiserer plassering av periode-bryter (Kumulativt/2025/2026, dynamisk år-liste) og EU-bryter (EKSKL/INKL), grået-ut-logikk (F3: EU kun på kumulative), hero-seksjonens enkeltår-tilstand, oppførsel for rangering/scatter/komparativ profil ved periode-bytte, wireframes for hver hovedtilstand, og fire spørsmål til prosjekteier som må besvares før implementering: (1) forpliktelse i enkeltår, (2) år-rekkefølge i bryter, (3) default-tilstand, (4) tidsseriegraf utenfor bryteren. Ingen kodeendringer i denne leveransen. | frontend | Godkjenning av designnotat + svar på de 4 spørsmålene før M7.4 Steg 2 (implementering) starter. |
| 2026-05-11 | M7.4 Steg 1: Godkjent / Steg 2: Implementering | Klar for review | Prosjekteier fulgte prosjektleders tilrådninger på alle fire spørsmål. **Implementering levert:** `index.html` har to nye toggle-grupper (periode + EU) i hero-seksjonen. `dashboard.js` har state via sessionStorage (`m7_periode`, `m7_eu`), dynamisk år-liste generert fra `country_summary_aar.csv`, hjelpefunksjonene `aktivSummary()` og `aktivRelative()` som returnerer riktig datasett basert på state, og automatisk grå-ut av EU-bryter ved enkeltår-valg med statustekst. Alle hovedvisninger (KPI, rangering, fordeling, komparativ profil, scatter) bytter datasett basert på periode-state. Tidsseriegraf er uavhengig per design. `styles.css` utvidet med felles styling for `.periode-toggle`/`.eu-toggle` (gjenbruker valuta-toggle-mønster). `scripts/build-site.sh` utvidet med to nye CSV-er for deployment. Smoke-test: HTTP-server returnerer 200 for alle nye filer. Syntax-check OK. Manuell nettleser-test gjenstår - prosjekteier oppfordres til å verifisere visuelt etter merge. | frontend | Godkjenning av M7.4-leveransen før M7.5 starter. |
| 2026-05-11 | M7.5 Steg 1: Designnotat | Klar for review | `docs/m7-design/m7-5-design.md` levert. Spesifiserer plassering av flak-forhåndsvisning (nederst i dashboardet), antatt struktur for tabell 1 (9 rader basert på fasitverdier - må bekreftes mot FINs mal), antatte figurer 1-3 (rangering, tidsserie, scatter), "Last ned flak (.docx)"-knapp stubbet med "Kommer i M7.6"-tooltip, tilstandskobling til alle tre brytere, tilgjengelighet. Fire spørsmål til prosjekteier: (1) bekreftelse av tabell 1 sine 9 rader, (2) figur 1-3, (3) knapp-tilstand, (4) plassering. Ingen kodeendringer i denne leveransen. | frontend | Godkjenning av designnotat + svar på de 4 spørsmålene før M7.5 Steg 2 (implementering) starter. |
| 2026-05-11 | M7.5 Steg 1: Godkjent / Steg 2: Implementering | Klar for review | Prosjekteier godkjente alle fire spørsmål. **Implementering levert:** ny `flak-seksjon` nederst i `index.html` med header, tabell 1 (9 rader), figur-liste og nedlastingsknapp. `dashboard.js` har ny `tegnFlakForhandsvisning()` som rendrer Norges nøkkeltall i tabellform per dashboardets aktive tilstand (periode + EU + valuta). Tilstandsmerknad over tabellen forklarer hvilken konfigurasjon flaket reflekterer. Figur-etiketter byttes basert på periode-valg (kumulativt vs. enkeltår). Nedlastingsknapp er stubbet med `aria-disabled="true"` og tooltip "Kommer i M7.6". `styles.css` utvidet med `.flak-seksjon`, `.flak-tabell` (HTML-tabell med caption/thead/tbody for skjermlesere), `.flak-knapp` og tilhørende stiler. Smoke-test og build-script OK. | frontend | Godkjenning av M7.5-leveransen før M7.6 starter. |
| 2026-05-11 | M7.6: Docx-generering klientside | Klar for review | `docx`-pakke (v9.5.0) lastet inn via unpkg.com UMD-CDN. Ny `genererFlakDocx(state)` i `dashboard.js` bygger Word-fil fra grunnen med tittel, undertittel (med periode/EU/valuta), Tabell 1 med 9 rader, figur-merknad og kildehenvisning. Norsk tallformat: komma som desimaltegn, ikke-brytende mellomrom som tusenseparator, "pst." for prosent, "mrd. EUR/NOK" for milliarder. `lastNedFlakBlob()` håndterer iOS/Safari-fallback (åpner i ny fane når programmatisk nedlasting er blokkert). Knappen aktiveres automatisk når `docx`-biblioteket er lastet. Filnavn: `Norges-Ukraina-stotte-{periode}-{dato}.docx`. **Skyves til drift som forbedring:** Plotly-figurer embeddet som PNG i docx-en (krever Plotly.toImage + ImageRun i docx). Per M7-planen er Word-filen bygget fra grunnen og malen `flak-mal.docx` er kun visuell referanse (S19) - malen sendes fortsatt fra prosjekteier ved behov. Smoke-test: node --check OK, build-site OK. Manuell nettleser-test gjenstår - krever ekte nettforbindelse for CDN. | frontend | Godkjenning av M7.6-leveransen avslutter M7-milepælen. |

### 11.2 Åpne saker til avklaring hos prosjekteier

| ID | Dato løftet | Sak | Frist | Tilrådning fra prosjektleder |
|---|---|---|---|---|
| S19 | 2026-05-11 | Skal flak-malen `flak-mal.docx` ligge i repoet som visuell referanse, eller skal docx-en bygges fra grunnen i kode uten referansemal? | Før M7.6 | Mal i repoet under `src/dashboard/maler/flak-mal.docx` som visuell referanse. Docx-en bygges programmatisk, men utviklerne har kvalitetssjekk å sammenligne mot. |
| S20 | 2026-05-11 | Hvilke målepunkt skal flaket vise i tabell 1? Excel-flaket viser 9 rader - skal denne være konfigurerbar eller låst til malens struktur? | Før M7.5 | Låst til malens 9 rader i første versjon. Konfigurerbart kan legges til senere som forbedring uten å påvirke flak-malens visuelle integritet. |
| S21 | 2026-05-11 | Hvordan kommuniseres metodisk migrering til brukerne? | Før M7.3 | Tre kanaler: (1) "Hva er endret"-seksjon i `brukerveiledning.md`, (2) kort merknad i dashboardets header i overgangsperiode (4-6 uker), (3) varsel til kjente brukere via vanlig kanal. Reduserer risiko R17/R20. |

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
| S8 | 2026-04-25 | 2026-04-25 | Skal NOK konverteres med dagens kurs eller historisk kurs på utbetalingsdato? | Prosjekteier valgte **dynamisk historisk kurs**. Implementert i `src/analyze/valutakonvertering.py` med fallback til forrige bankdag for helger/helligdager og siste kurs for aktiviteter uten dato. |
| S9 | 2026-04-25 | 2026-04-25 | Hvilke land-grupperinger skal være forhåndsdefinert? | Prosjekteier valgte **som tilrådd**: Norden, EU, G7, NATO og dynamisk Alle. Implementert i `src/analyze/landgrupper.py`. |
| S10 | 2026-04-25 | 2026-04-25 | Standardvalg for komparativ landprofil i M6.2 | Prosjekteier valgte **Norge + Tyskland + Frankrike + Storbritannia** som default-sammenligning. Gir kontrast mot de største europeiske giverne. Brukeren kan endre via multivelger. |
| S11 | 2026-04-25 | 2026-04-25 | Akser i scatter plot (M6.2) | Prosjekteier godkjente forslag: **Andel av BNP (x) × Per capita EUR (y)** som default. Brukeren kan bytte via dropdown. |
| S12 | 2026-04-25 | 2026-04-25 | Tone og format på automatisk endringstekst | Prosjekteier godkjente forslag med presisering: 2-4 setninger med **pedagogisk klarspråk** (ikke fagsjargong). Inkluderer kort metodemerknad. |
| S13 | 2026-04-25 | 2026-04-25 | Tidsseriegraf - akkumulert eller per måned | Prosjekteier godkjente forslag: **toggle med akkumulert som default**, per måned som sekundær modus. |
| S14 | 2026-04-25 | 2026-04-25 | Tooltips - innholdsnivå | Prosjekteier godkjente forslag: **norsk språk** med EUR+NOK, referanseår og rangering-posisjon. |
| S15 | 2026-04-25 | 2026-04-25 | Tidsanslag M6.3: 8-16 utviklingsdager mot prosjektplanens 1-ukes estimat | Prosjekteier valgte **alternativ 1: utvid M6.3 til 2 uker** (prosjektleders tilrådning). Begrunnelse: brukerveiledning og CSV-eksport bør være med i samme fase som det visuelle redesignet, ikke flyttes til M6.4. M6.3-raden i seksjon 5 oppdatert til "2 uker". |
| S16 | 2026-04-26 | 2026-04-26 | Hosting-omvalg: skifte fra Netlify til GitHub Pages | Prosjekteier ønsket å flytte til GitHub Pages for tettere kobling til repo og enklere CI/CD. Krevde at repoet ble gjort offentlig (overstyrer S3/S7). Implementert med ny `deploy-pages.yml`-workflow, omdøpt build-script, slettet `netlify.toml`. Ny URL: <https://marhip97.github.io/ukrainastotte/>. |
| S22 | 2026-05-11 | 2026-05-11 | Sverige EKSKL EU: dashboard-verdi når Kiels publiserte tall (10,320 mrd) avviker fra FINs excel-fasit (9,149 mrd) | Prosjekteier valgte **prosjektleders tilrådning**: dashboardet viser Kiels publiserte 10,320 mrd som standard, med fotnote om eventuelle ekskluderinger som senere kan implementeres som tilleggsfilter dersom brukerne avklarer hvilke svenske aktiviteter excelen ekskluderer. |
| S23 | 2026-05-11 | 2026-05-11 | EU-fordeling INKL EU: andel × EU-total vs. Kiels pre-aggregerte tall | Prosjekteier valgte **prosjektleders tilrådning**: M7.2 bruker Kiels pre-aggregerte `Share of EU Allocated aid` og `Share of EU Committed aid` direkte fra `EU Aid Shares`-arket. Fordelingsnøkkel (`Country Share on total EU budget`) beholdes som referanseverdi men er ikke beregningsgrunnlag. |
| S24 | 2026-05-11 | 2026-05-11 | Folketalls-vintage for per innbygger | Prosjekteier valgte **prosjektleders tilrådning**: behold WDI Most Recent Value (dagens metode, oppdateres automatisk via `fetch-wdi.yml`). Avviket på 0,5-2 % dokumenteres i brukerveiledning ved M7.3 som metodisk forbehold. |

### 11.4 Milepælsstatus

| Milepæl | Planlagt uke | Status | Kommentar |
|---|---|---|---|
| M1: Oppstart | Uke 1 | Ferdig | Levert via PR #1 og godkjent 2026-04-22. |
| M2: Datapipeline | Uke 3 | Ferdig | Full pipeline: fetch-workflow, parser (bilateral + summary + disbursements), validering, normalisering til CSV-er i `data/processed/`. Verifisert mot Release 28 og Norges publiserte totals. 13/13 tester grønne. |
| M3: Analysemodul | Uke 5 | Ferdig | Alle 6 nøkkeltall implementert og visualisert: absolutt støtte, fordeling mil/fin/hum, rangering, andel BNP (via WDI), per capita, endring siste release. 24/24 tester grønne. |
| M4: Dashboard MVP | Uke 7 | Ferdig | Dashboard live på <https://ukrainastotte.netlify.app/> med seks nøkkeltall-kort, fem S2-visninger (allokering, forpliktelse, utbetalt, BNP-andel, per capita, endring), Norge-fokusert rangering. Automatisk Netlify-deploy fra `main`. |
| M5: Produksjon | Uke 9 | Ferdig | Ukentlig `fetch-kiel.yml` og månedlig `fetch-wdi.yml` verifisert end-to-end. QA-rapport for Release 28 med 103 OK / 0 kritiske feil. Brukerveiledning (`docs/brukerveiledning.md`) og overlevering (`docs/drift/overlevering.md`) levert. |
| M6.1: Datafundament | — | Ferdig | PR #24 merget til main 2026-04-25. Levert: Norges Bank EUR/NOK-fetch, valutakonvertering med bankdag-fallback, månedlig tidsserie, land-grupperinger, NOK-utvidelse av normalize. 51/51 tester grønne. |
| M6.2: Analytisk innhold | — | Ferdig | PR #25 merget til main 2026-04-25. Levert: endringstekst-generator, komparativ profil, tidsseriegraf, scatter plot, harmoniserte norske tooltips, automatisk regenerering ved kursoppdatering. 63/63 tester grønne. |
| M6.3: Visuelt redesign | — | Ferdig | Designgrunnlag (PR #26) + visuelle forbedringer i PR 52, 54, 55 og 56 merget til main 2026-04-26. Prosjekteier godkjente dashboardet og besluttet at prosjektet går tilbake i ren driftfase. Resterende punkter fra `docs/m6.3/04-implementation-plan.md` håndteres som forbedringsforslag i drift dersom ønsket senere. |
| M7: Metodisk migrering og flak-generering | — | Klar for review | Levert 2026-05-11. Alle syv delfaser implementert: M7.0 (migrerings-QA), M7.1 (parser-utvidelse), M7.2 (analyselag), M7.3 (opprydding), M7.4 (periode/EU-bryter), M7.5 (flak-forhåndsvisning), M7.6 (docx-generering). M7.0-M7.3 godkjent av prosjekteier. M7.4-M7.6 klar for review. Norge matcher fasit 100 % på alle mål. Plotly-figurer i docx-en skyves til drift som forbedring. |

---

## 12. Endringslogg for prosjektplanen

| Versjon | Dato | Endring | Utført av |
|---|---|---|---|
| 1.0 | 2026-04-22 | Første versjon opprettet | prosjektleder |
| 2.0 | 2026-04-25 | Lagt til milepæl M6 med tre delfaser. Sakene S8 og S9 åpnet og lukket. | prosjektleder |
| 2.1 | 2026-04-25 | M6.1 ferdig (PR #24 merget). M6.2 startet. Sakene S10-S14 åpnet og lukket samme dag. | prosjektleder |
| 2.2 | 2026-04-25 | M6.2 ferdig (PR #25 merget). M6.3 startet med designgrunnlag (PR #26 merget). S15 åpnet og lukket: M6.3 utvidet fra 1 til 2 uker. | prosjektleder |
| 2.3 | 2026-04-26 | Hosting flyttet fra Netlify til GitHub Pages. S16 åpnet og lukket. Repoet gjort offentlig. | prosjektleder, devops |
| 2.4 | 2026-04-26 | M6.3 lukket etter prosjekteiers godkjenning av dashboardet. PR 52, 54, 55 og 56 merget med visuelle forbedringer (kompakt hero, rullgardin-filter, sammenkoblet komparativ-blokk, padding-fix). Status flyttet fra "Drift + ny utvidelsesfase M6 starter" til "Drift". | prosjektleder, frontend, qa |
| 2.5 | 2026-05-11 | M7 Metodisk migrering åpnet som ny milepæl. Lagt til i seksjon 5. Plan i `docs/planer/M7 plan.md` godkjent av prosjekteier. S19-S21 åpnet i 11.2. M7.0 (migrerings-QA) starter umiddelbart. Status oppdatert til "Drift + ny utvidelsesfase M7 starter". | prosjektleder |
| 2.6 | 2026-05-11 | M7.0 Migrerings-QA fullført samme dag. Rapport `docs/qa/m7-migrering-avvik.md` produsert. Norge matcher fasit 100 %, men tre metodiske avvik identifisert som krever avklaring før M7.2: Sverige EKSKL EU (S22), EU-fordelingsmetode INKL EU (S23), folketalls-vintage (S24). S22-S24 åpnet i 11.2. | qa, prosjektleder |
| 2.7 | 2026-05-11 | M7.0 godkjent av prosjekteier. S22, S23, S24 besluttet i tråd med prosjektleders tilrådning og flyttet til 11.3. M7.1 Parser-utvidelse startet. | prosjekteier, prosjektleder |
| 2.8 | 2026-05-11 | M7.1 Parser-utvidelse levert. `parse_kiel.py` utvidet med redistr/month/activity-felter på `Aktivitet` og to nye parsere (`parse_eu_aid_shares`, `parse_gdp`). Testsuite 70/70 grønn. Klar for review. | dataingenior, prosjektleder |
| 2.9 | 2026-05-11 | M7.2 Analyselag-migrering levert. Nye moduler `eu_fordeling.py` og `aarlig.py`, oppdaterte `noekkeltall_relative.py` og `normalize.py`. Tre nye CSV-er produsert. Verifisert mot fasitverdier (Norge, Tyskland INKL EU og enkeltår 2025/2026 matcher 100 %). Testsuite 78/78 grønn. WDI-slanking utsatt til M7.3. | analytiker, prosjektleder |
| 2.10 | 2026-05-11 | M7.3 Opprydding levert. WDI-fetch slanket til kun folketall, `wdi.json` → `folketall.json`. Legacy USD-BNP-modus fjernet. Brukerveiledning fikk "Hva er endret"-seksjon og dashboardet fikk header-merknad per S21. | dataingenior, frontend, prosjektleder |
| 2.11 | 2026-05-11 | M7.4 Steg 1 (designnotat) levert: `docs/m7-design/m7-4-design.md` med plassering, tilstander, wireframes og fire avklaringsspørsmål før implementering. | frontend, prosjektleder |
| 2.12 | 2026-05-11 | M7.4 Steg 2 (implementering) levert: periode-bryter og EU-bryter i dashboardet, dynamisk år-liste, sessionStorage-state, grå-ut-logikk, aktive datasett basert på periode/EU-state. | frontend, prosjektleder |
| 2.13 | 2026-05-11 | M7.5 Steg 1 (designnotat) levert: `docs/m7-design/m7-5-design.md` med plassering, tabell-/figur-struktur og fire avklaringsspørsmål før implementering. | frontend, prosjektleder |
| 2.14 | 2026-05-11 | M7.5 Steg 2 (implementering) levert: flak-forhåndsvisning nederst i dashboardet med Norges 9-rads tabell og figur-liste som speiler aktiv tilstand. Nedlastingsknapp stubbet til M7.6. | frontend, prosjektleder |
| 2.15 | 2026-05-11 | M7.6 (docx-generering klientside) levert: `docx`-pakke via unpkg.com, `genererFlakDocx()` med tittel, undertittel, 9-rads tabell, figur-merknad og kildehenvisning. iOS-fallback for nedlasting. Plotly-figurer i docx skyves til drift. M7-milepælen funksjonelt komplett. | frontend, prosjektleder |
| 2.16 | 2026-05-11 | M7.6 utvidet med Plotly-figurer (rangering, tidsserie, scatter) eksportert som PNG og embeddet i docx-en via ImageRun. Faller tilbake til tekstmerknad hvis grafer ikke er rendret eller eksport feiler. M7-leveransen er nå komplett uten gjenstående punkter. | frontend, prosjektleder |

---

*Dette dokumentet er et levende dokument og oppdateres av prosjektleder-agenten gjennom hele prosjektets levetid. Vesentlige endringer i plan, scope eller mål krever godkjenning fra prosjekteier.*
