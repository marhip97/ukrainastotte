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

### 11.2 Åpne saker til avklaring hos prosjekteier

*(Ingen åpne saker. Alle vedtatte saker er lukket og ført i 11.3.)*

### 11.3 Lukkede saker

| ID | Dato løftet | Dato lukket | Sak | Utfall |
|---|---|---|---|---|
| S1 | 2026-04-22 | 2026-04-22 | Godkjenning av prosjektplan v1.0 | Godkjent av prosjekteier. Danner grunnlag for oppstart av M2. |
| S2 | 2026-04-22 | 2026-04-22 | Definisjonsvalg for "Norges støtte til Ukraina" | Prosjekteier valgte **alternativ D med B som standardvisning** - flermåls-tilnærming med Kiel-hovedinndeling som default, og underordnede visninger for "kun utbetalt" og "inkludert flyktningkostnader". Se `docs/beslutningssaker/S2-definisjon-av-norges-stotte.md` for føringer. |
| S3 | 2026-04-22 | 2026-04-22 | Hosting av dashboardet | Prosjekteier valgte **GitHub Pages** (prosjektleders tilrådning). Automatisk deploy via GitHub Actions. Vurderes på nytt kun hvis prosjektet senere får behov for server-side prosessering, noe som ikke er i scope. |
| S4 | 2026-04-22 | 2026-04-22 | Branch-navnkonvensjon (agent-indusert `claude/...` vs. `feature/...` i CLAUDE.md) | Prosjekteier valgte omdøping til `feature/m1-oppstart`. Konsekvens: fremtidige branches følger `feature/<kort-beskrivelse>` som definert i CLAUDE.md. |
| S5 | 2026-04-22 | 2026-04-22 | Godkjenning av M1-leveransen (pull request mot `main`) | Pull request #1 godkjent og merget av prosjekteier. M1 satt til Ferdig. |

### 11.4 Milepælsstatus

| Milepæl | Planlagt uke | Status | Kommentar |
|---|---|---|---|
| M1: Oppstart | Uke 1 | Ferdig | Levert via PR #1 og godkjent 2026-04-22. |
| M2: Datapipeline | Uke 3 | Pågår | Kildekartlegging ferdig (`docs/kartlegging-kiel.md`). Neste: manuell nedlasting av Release 23 til `data/raw/`, utforskende analyse, parser-prototype med kolonnekontrakter. |
| M3: Analysemodul | Uke 5 | Ikke startet | Parametriseres på S2-valgt definisjon; tre varianter av hvert nøkkeltall. |
| M4: Dashboard MVP | Uke 7 | Ikke startet | Hosting besluttet (S3: GitHub Pages). Må ha tydelig definisjonsbryter iht. S2-beslutningen. |
| M5: Produksjon | Uke 9 | Ikke startet | GitHub Actions for automatisk datauthenting og Pages-deploy. |

---

## 12. Endringslogg for prosjektplanen

| Versjon | Dato | Endring | Utført av |
|---|---|---|---|
| 1.0 | 2026-04-22 | Første versjon opprettet | prosjektleder |

---

*Dette dokumentet er et levende dokument og oppdateres av prosjektleder-agenten gjennom hele prosjektets levetid. Vesentlige endringer i plan, scope eller mål krever godkjenning fra prosjekteier.*
