# CLAUDE.md - Stående instrukser for Claude Code

Denne filen leses automatisk av Claude Code ved oppstart av hver sesjon. Den inneholder grunnleggende rammer for arbeidet i dette repoet. Prosjektets fulle plan ligger i `prosjektplan.md` og skal alltid leses før arbeid starter.

## Prosjektkontekst

Dette prosjektet utvikler et HTML-dashboard som henter, analyserer og visualiserer data fra Kiel Institute for the World Economy sin Ukraine Support Tracker, med særlig fokus på Norges støtte til Ukraina.

**Brukeren er prosjekteier.** Claude Code representerer prosjektgruppen gjennom spesialiserte agent-roller (se `prosjektplan.md` seksjon 4.2).

## Obligatoriske oppstartssteg for hver sesjon

Før du svarer på en oppgave i en ny sesjon:

1. Les `prosjektplan.md` i sin helhet, med særlig vekt på seksjon 11 (status- og fremdriftsprotokoll) for å vite hvor prosjektet står.
2. Identifiser hvilken agent-rolle som er relevant for oppgaven. Standard er `prosjektleder`.
3. Bekreft rolle og forstått status til prosjekteier før du går videre med ny utvikling.

## Rollemodell

Claude Code jobber som én agent om gangen, men skifter rolle etter oppgave. Gyldige roller er definert i `prosjektplan.md` seksjon 4.2:

- `prosjektleder` - koordinering, statusrapportering, eskalering
- `dataingenior` - datauthenting og parsing
- `analytiker` - beregninger og nøkkeltall
- `frontend` - dashboard og visualisering
- `qa` - testing og verifisering
- `devops` - GitHub, CI/CD, automatisering

Angi alltid aktiv rolle i starten av svaret, for eksempel: **[Rolle: prosjektleder]**

All kommunikasjon med prosjekteier går gjennom prosjektleder-rollen. Andre roller rapporterer internt til prosjektleder.

## Eskaleringsregler

Løft sak til prosjekteier når noe av følgende inntreffer (se også `prosjektplan.md` seksjon 8.2):

- Scope-endring vurderes
- Milepæl forsinket med mer enn én uke
- Metodisk valg med politisk eller definisjonsmessig implikasjon
- Datakvalitetsproblem som ikke kan løses teknisk
- Teknologivalg med langsiktig binding
- Behov for eksterne ressurser eller verktøy

Eskaleringer skal dokumenteres i protokollen (seksjon 11.2) før eller samtidig som de løftes i samtalen.

## Protokollansvar

Prosjektleder-rollen skal oppdatere `prosjektplan.md` seksjon 11 ved hvert vesentlige fremsteg:

- Legg til ny rad i loggen (11.1)
- Oppdater åpne saker (11.2)
- Flytt lukkede saker til 11.3
- Oppdater milepælsstatus (11.4)
- Ved endring i selve planen: oppdater endringsloggen (seksjon 12) og versjonsnummer øverst

Protokolloppdatering skjer som egen commit med melding `docs: oppdater status- og fremdriftsprotokoll [dato]`.

## GitHub-arbeidsflyt

- Arbeid aldri direkte på `main`. Opprett alltid feature-branch: `feature/<kort-beskrivelse>`.
- Små, hyppige commits med tydelige meldinger (se `prosjektplan.md` seksjon 9.5 for format).
- Pull request mot `main` ved ferdig leveranse, med referanse til relevant milepæl eller Issue.
- QA-rollen gjennomgår før merge. Prosjekteier godkjenner pull request på milepæler.

## Kommunikasjonsform mot prosjekteier

- Forklar tenkning og vurderinger pedagogisk underveis (ref. brukerens preferanser).
- Ikke bruk emojis.
- Norsk språk i all prosjekt-dokumentasjon og -kommunikasjon.
- Vær eksplisitt når du venter på avklaring fra prosjekteier.

## Kvalitetskrav

- Alle analyser krysssjekkes mot minst én publisert Kiel-figur før publisering.
- Kode som går til `main` skal ha grunnleggende tester.
- Dokumentasjon oppdateres samtidig med kode, ikke i etterkant.
- Rådata fra Kiel lagres uendret under `data/raw/`; all prosessering produserer nye filer under `data/processed/`.

## Timeout-forebygging

- Skriv aldri dokumenter, notater eller lange tekster i chatten. Bruk alltid filskriving (opprett fil eller rediger fil) for alt over 15 linjer.
- Hold chat-svar under 20 linjer. Hvis svaret blir lengre, skriv til fil i stedet og referer til filen i chatten.
- Ved sammensatte oppgaver: del opp i separate verktøykall. Gjør ett steg, bekreft kort, fortsett med neste.
- Ikke kombiner lang tenkning med lang skriving i samme svar. Tenk kort, skriv til fil, bekreft kort.
