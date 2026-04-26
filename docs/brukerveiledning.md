# Brukerveiledning - SFSs Ukraina-støtte overvåker

Dashboardet finnes på <https://ukrainastotte.netlify.app/>. Dette
dokumentet hjelper journalister, utredere, forskere og andre som vil
bruke tallene i analyser eller omtale.

## 1. Hva dashboardet viser

Dashboardet henter data fra [Kiel Institute Ukraine Support
Tracker](https://www.kielinstitut.de/topics/war-against-ukraine/ukraine-support-tracker/)
og presenterer Norges bidrag i tre dimensjoner:

- **Absolutt** - milliarder euro i støtte.
- **Relativt mot BNP** - andel av norsk BNP.
- **Per innbygger** - euro per innbygger.

I tillegg vises Norges rangering blant 40+ giverland på hvert av
disse målene, sammenligning mot utvalgte land, månedlig tidsserie,
og automatisk endringstekst etter hver Kiel-utgivelse.

> Skjermbilde 1: Forsiden av dashboardet. Hero-tallet (Norges total
> allokering) er størst, med tre støtte-tall (endring, rangering,
> andel av BNP) til høyre.
>
> *Plassholder for skjermbilde - legges inn manuelt fra
> <https://ukrainastotte.netlify.app/>.*

## 2. Nøkkeltall øverst

### 2.1 Hero-tallet og tre støtte-tall

Øverst vises **Norges totale allokering** med stor skrift som det
dominerende tallet. Til høyre vises tre støtte-kort:

| Kort                    | Betydning                                                        |
|-------------------------|------------------------------------------------------------------|
| Endring siden forrige rapport | Endring i total allokering fra forrige Kiel-utgivelse, i milliarder euro. |
| Rangering blant giverland | Norges plassering blant giverland på total allokering. |
| Andel av BNP            | Total allokering som prosent av Norges BNP (Verdensbanken 2024). |

### 2.2 Sekundære nøkkeltall

Under hero-kortene vises tre sekundære nøkkeltall i kompakt format:

- **Per innbygger**: total støtte delt på folketallet.
- **Rangering BNP-andel**: Norges plassering på BNP-andel.
- **Rangering per capita**: Norges plassering på per innbygger.

### 2.3 Viktig om sammenligning med Kiels "årlige" tall

Kiel publiserer både årlige tall (f.eks. "Norge allokerte 3,6 mrd EUR
i 2025") og kumulative. Dashboardet viser **kumulativt** - summen
siden krigens start. Derfor er våre BNP-andeler høyere enn
enkeltårs-tall. Det er tilsiktet: brukeren skal se totalbyrden, ikke
bare siste års bidrag.

## 3. Endringstekst (automatisk)

Rett under nøkkeltallene vises en **automatisk generert tekst** som
oppsummerer endringen siden forrige Kiel-utgivelse. Eksempel:

> "Norges totale støtte til Ukraina økte med 1,5 milliarder euro
> (+15 %) siden forrige Kiel-rapport. Økningen kommer hovedsakelig
> fra nye militære allokeringer. Norge er nå rangert som det 8.
> største giverlandet, opp fra 10. plass. Tallene kan inneholde
> retroaktive korrigeringer fra Kiel mellom releaser."

Teksten genereres deterministisk fra deltaer mellom siste to lagrede
utgivelser. Den vises ikke før det finnes minst to utgivelser i
arkivet. Bruk den som utgangspunkt, men dobbeltsjekk tallene mot
selve dashboardet før publisering.

## 4. Filter "Sammenlign Norge med ..."

I en lyseblå filterboks kan du velge ett eller flere land. Valget
styrer tre seksjoner samtidig:

- **Komparativ landprofil** (kort-grid).
- **Topp 15 giverland** (rangeringsgraf - valgte land får mørkere blå).
- **Sammenheng mellom mål** (scatter - valgte land får tekst-etikett).

### 4.1 Multivelger

Hold inne **Ctrl** (Windows) eller **Cmd** (Mac) for å velge flere
land. Default er Norge + Tyskland + Frankrike + Storbritannia.

### 4.2 Hurtigknapper for landgrupper

Fem knapper velger forhåndsdefinerte grupper:

- **Standard** - Norge + Tyskland + Frankrike + Storbritannia.
- **Norden** - Norge, Sverige, Danmark, Finland, Island.
- **EU** - alle 27 EU-medlemmer i datasettet.
- **G7** - Canada, Frankrike, Tyskland, Italia, Japan, Storbritannia, USA.
- **NATO** - alle NATO-medlemmer som er i Kiel-datasettet (32 land).

> Skjermbilde 2: Filter-seksjonen. *Plassholder.*

## 5. Komparativ landprofil

Hvert valgt land får et kort med samme nøkkeltall: total allokering,
forpliktelse, andel av BNP, per innbygger, tre rangeringer, og
endring siden forrige release. Norge-kortet skiller seg ut med blå
ramme og lys blå bakgrunn.

På desktop vises 4 kort per rad, 2 på nettbrett, og 1 per rad på
mobil.

> Skjermbilde 3: Komparativ profil med Norge + Tyskland + Frankrike +
> Storbritannia. *Plassholder.*

## 6. Fordeling av Norges støtte

Stablet horisontal stolpegraf som viser hvor mye av Norges støtte
som er militær, finansiell og humanitær. Hvert segment har inline
prosent (f.eks. "62 %") og hover-tooltip med eksakt verdi.

Visningsbryteren over grafen lar deg bytte mellom **allokering**
(default) og **forpliktelse**.

## 7. Topp 15 giverland

Sortert horisontal stolpegraf for valgt mål. Norge har en lyseblå
bakgrunnsstripe gjennom hele raden så øyet finner Norge raskt. Land
valgt i filteret (Tyskland/Frankrike/Storbritannia som default) får
mørkere blå farge.

### Last ned PNG

Knappen "Last ned PNG" øverst i seksjonen lager en PNG-fil av grafen
(1200×700 px). Bruk gjerne i artikler og presentasjoner. Filnavnet
inkluderer dato (`kiel-rangering-YYYY-MM-DD.png`) for sporbarhet.

## 8. Tidsserie - støtte per måned

Linje- eller stolpegraf som viser månedlig støtte fra valgte land.
Fire kontroller over grafen:

| Kontroll | Valg |
|---|---|
| Modus    | **Akkumulert** (default - sum til hvert tidspunkt) eller **Per måned** (rådata). |
| Mål      | Allokering eller Forpliktelse. |
| Kategori | Total, Militær, Finansiell eller Humanitær. |
| Valuta   | EUR (default) eller NOK. |

NOK-modusen bruker historisk EUR/NOK-kurs på utbetalingsdato (eller
forrige bankdag som fallback). Hentes daglig fra Norges Bank.

Aktiviteter uten dato i Kiel-datasettet er utelatt fra tidsserien
(de er fortsatt med i totalsummene andre steder).

> Skjermbilde 4: Tidsserie i akkumulert modus, total allokering, EUR.
> *Plassholder.*

## 9. Sammenheng mellom mål (scatter)

Scatter-graf der hvert punkt er ett giverland. Default akser:
**Andel av BNP** mot **Per innbygger**. Begge akser kan byttes via
dropdownene. Norge er framhevet som størst punkt med mørk ramme.
Land valgt i filteret får tekst-etikett ved siden av punktet.

> Skjermbilde 5: Scatter med Norge i øvre høyre kvadrant. *Plassholder.*

## 10. Visningsbryteren (Norge i fordeling)

Bryteren over fordelings-grafen ("Visning") styrer hvilken
dimensjon som vises:

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

## 11. Slik tolker du tallene riktig

### 11.1 Kumulativt vs. årlig

Dashboardets hovedtall er **kumulative** fra januar 2022. Kiels
presseoppslag bruker ofte **enkeltår** (f.eks. "0,25 % av BNP i
2025"). Før du siterer, sjekk at tidsrom stemmer.

### 11.2 Allokering vs. forpliktelse vs. utbetalt

- **Forpliktelse** = "vi har lovet dette".
- **Allokering** = "vi har øremerket dette for konkret levering".
- **Utbetalt** = "pengene er faktisk overført" (gjelder kun finansiell
  støtte).

Tre visninger gir tre ulike svar på "hvor mye har Norge støttet?".
Alle er legitime; bruk det som passer artikkelen.

### 11.3 Euro vs. norske kroner

Kiel rapporterer i euro. Dashboardet kan vise NOK i tidsserien
basert på historiske EUR/NOK-kurser fra Norges Bank (S8). I andre
seksjoner vises EUR uten konvertering. NOK-totaler over flere år er
sum av historiske dagskurser, ikke en fastkurs - dette gjør tallene
tidsriktige men kan virke rotete hvis du forventer "én kurs".

### 11.4 Hvilke land er inkludert

Kiel sporer 41-42 giverland: EU-medlemmer, G7, Australia, Sør-Korea,
Tyrkia, Norge, New Zealand, Sveits, Kina, Taiwan, India og Island.
EU-institusjoner og Den europeiske investeringsbanken er med som
separate "givere" i Kiels tall.

For BNP-andel og per capita **utelater** vi EU-institusjonene, EIB og
Taiwan fordi Verdensbanken ikke har BNP-data for disse.

## 12. Eksport av data

I bunnen av siden ligger seksjonen "Last ned data (CSV/JSON)".
Klikk for å utvide en liste over alle datafilene som driver
dashboardet:

- `country_summary.csv` - aggregat per land (€ mrd).
- `country_summary_relative.csv` - andel BNP og per innbygger.
- `country_summary_endring.csv` - endring siden forrige release.
- `country_summary_nok.csv` - aggregat per land i NOK.
- `bilateral_activities.csv` - alle aktiviteter (langformat).
- `financial_disbursements.csv` - månedlige finansielle utbetalinger.
- `tidsserier_maanedlig.csv` - månedlige aggregater (EUR og NOK).
- `endringstekst.json` - automatisk generert endringstekst.
- `metadata.json` - kildefil, sha256, prosesseringsdato.

For PNG-eksport av rangerings-grafen: bruk "Last ned PNG"-knappen
i seksjon 7.

## 13. Tilgjengelighet

Dashboardet er bygget mot WCAG 2.2 AA:

- Trykk **Tab** ved sidelasting for å hoppe direkte til
  hovedinnholdet via "Hopp til hovedinnholdet"-lenken.
- Alle kontroller (multivelger, dropdowns, knapper) er tastatur-
  navigerbare.
- Tidsseriegrafen har en visuelt skjult tabell-versjon som
  skjermlesere kan navigere.
- Tooltips fungerer både ved museover og ved fokus.
- Hvis du har skrudd på "redusert bevegelse" i operativsystemet,
  blir alle animasjoner deaktivert.

Tilgjengelighet sjekkes automatisk med axe-core ved hver PR
(`.github/workflows/a11y.yml`). Send oss gjerne tilbakemelding hvis
du opplever problemer.

## 14. Forbehold og kilder

- **Hovedkilde**: Kiel Institute for the World Economy, *Ukraine
  Support Tracker* (publisert kvartalsvis). Lisens: offentlig
  tilgjengelig; vi reproduserer tall uten egen metodisk justering.
- **BNP og folketall**: Verdensbanken, *World Development Indicators*
  (WDI). Nyeste endelige tall per land (typisk 2024).
- **Valutakurser**: Norges Bank, daglige observasjoner av EUR/NOK
  fra 2022-01-01 og fremover.
- **Oppdateringsfrekvens**: Dashboardet sjekker Kiels side hver mandag
  og Norges Banks kurser hver dag. Når en ny utgivelse kommer, hentes,
  normaliseres og publiseres den automatisk i løpet av 1-2 timer.
- **Kvalitetskontroll**: Hver utgivelse krysssjekkes mot Kiels
  publiserte headline-figurer. Se `docs/qa/` for rapport per
  utgivelse.

## 15. Kjente dataavvik

Noen avvik finnes i Kiels rådata og reproduseres i dashboardet:

- For enkelte land er **commitment lavere enn allocation** (Australia,
  Irland, Italia, Slovakia). Dette skyldes at allocation inkluderer
  overførsler fra eksisterende lagre uten tilsvarende budsjettmessig
  commitment.
- For enkelte land er **finansielle utbetalinger høyere enn
  financial allocation** (Tyskland, Storbritannia). Dette skyldes
  tidsforskyvninger og at noen utbetalinger tilhører EU-lånemekanismer.

Begge avvik er beskrevet i `docs/qa/qa-rapport-release28.md`.

## 16. Spørsmål og feilrapportering

- Faglige spørsmål om Kiels metodikk: se [Kiel Institute sine
  egne sider](https://www.kielinstitut.de/topics/war-against-ukraine/ukraine-support-tracker/)
  eller [FAQ i tracker-datasettet](https://www.kielinstitut.de/publications/ukraine-support-tracker-data-6453/).
- Feil eller spørsmål om dashboardet: opprett Issue i
  [GitHub-repoet](https://github.com/marhip97/ukrainastotte/issues).
