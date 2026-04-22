# Beslutningssak S2: Hva skal inngå i "Norges støtte til Ukraina"?

**Sak-ID:** S2
**Dato løftet:** 2026-04-22
**Frist for beslutning:** Før M3-oppstart (uke 5)
**Utarbeidet av:** `prosjektleder` (med faglig innspill fra `analytiker`)
**Mottaker:** Prosjekteier
**Status:** Åpen, til beslutning

---

## 1. Hvorfor dette er en beslutningssak

Begrepet "Norges støtte til Ukraina" ser ut som et enkelt tall, men er det
ikke. Det samme landets støtte kan framstå svært ulikt avhengig av hvilke
regnemåter man velger. Valgene er i hovedsak:

1. **Teller vi utbetalt, allokert eller lovet?**
2. **Regner vi med innenlandske flyktningkostnader (kostnader Norge bærer
   for ukrainske flyktninger som oppholder seg i Norge)?**
3. **Hvordan håndterer vi indirekte bidrag via EU-instrumenter, NATO-fond
   og multilaterale kanaler?**
4. **Regner vi markedsverdi eller bokført verdi for donert materiell (f.eks.
   brukt militært utstyr)?**

Dette er ikke tekniske valg - de har direkte politisk implikasjon for
hvordan Norge framstår i rangeringer. Prosjekteier må derfor beslutte hvilken
definisjon som ligger til grunn, før analysemodulen (M3) bygges. CLAUDE.md og
prosjektplanens seksjon 8.2 krever eskalering av "metodiske valg med politisk
implikasjon", og denne saken er et typeeksempel.

---

## 2. Kort om Kiel Institute sin metodikk

Kiel Institute publiserer tall i flere lag. Hovedinndelingen er:

- **Kategorier:** Militær støtte, finansiell støtte, humanitær støtte.
- **Fase:** *Commitments/allocations* (hva som er lovet/øremerket) og
  *disbursements/deliveries* (hva som faktisk er utbetalt eller levert).
  Kiel publiserer i hovedsak tall på allokeringer, men rapporterer
  progresjon mot utbetaling der det er kjent.
- **Normaliseringer:** Kiel viser både absolutte tall (EUR og USD),
  andel av BNP, og per capita.
- **Sær-ordninger:** Kiel har separate oppgjør for innenlandske flyktning-
  kostnader (refugee cost estimates), og publiserer ofte tall både med
  og uten disse. EU-bidrag (Kommisjonen sine egne utbetalinger) telles
  som egen aktør, mens medlemsstatenes bidrag til EU-instrumenter (EPF,
  MFA, EIB) vanligvis tilordnes den enkelte stat.

> Merknad: Detaljene i Kiel sin metodikk bekreftes endelig av
> `dataingenior`-rollen i M2 når vi henter inn datasettet. Vurderingene
> under er basert på Kiel sine publiserte rapporter og metodologi-notater.

---

## 3. Alternativer for prosjektets hoveddefinisjon

Vi står i praksis overfor fire hovedalternativer. Alle handler om hvilket
tall som blir "overskriftstallet" i dashboardet. Uansett valg kan andre
varianter vises som underordnede visualiseringer.

### Alternativ A: Kun utbetalt/levert støtte, eksklusive flyktningkostnader

- **Hva teller:** Kun det som faktisk er utbetalt eller levert til Ukraina.
- **Hva teller ikke:** Lovet, men ikke utbetalt. Innenlandske flyktning-
  kostnader.
- **Fordeler:** Mest "strengt" mål - viser reell støtte som har nådd Ukraina.
  Vanskelig å manipulere politisk.
- **Ulemper:** Underestimerer Norges innsats sammenlignet med land som
  har kort vei fra lovnad til utbetaling. Krever god datakvalitet på
  utbetalingsfase, som Kiel selv advarer om kan være mangelfull for noen
  land og perioder.
- **Politisk framstilling:** Kan framstå "mindre gunstig" for Norge hvis
  norske lovnader ligger foran utbetalingstakten.

### Alternativ B: Kiel sin hovedinndeling (allokeringer) eksklusive flyktningkostnader

- **Hva teller:** Alt som er allokert/øremerket (inkludert ikke-utbetalt).
- **Hva teller ikke:** Innenlandske flyktningkostnader.
- **Fordeler:** Direkte sammenlignbart med Kiel sine publiserte hovedfigurer
  og rangeringer - lav risiko for metodisk avvik. Det er dette tallet som
  dominerer internasjonal debatt.
- **Ulemper:** Fanger ikke opp kostnader Norge bærer innenlands for
  ukrainske flyktninger, som er en reell budsjettpost.
- **Politisk framstilling:** Nøytralt. Samsvarer med internasjonal
  standard-framstilling.

### Alternativ C: Kiel sin hovedinndeling **inklusive** flyktningkostnader

- **Hva teller:** Alle allokeringer pluss dokumenterte innenlandske
  flyktningkostnader.
- **Fordeler:** Fanger total belastning landet påtar seg, inkludert
  byrden av å ta imot ukrainske flyktninger. Land med mange flyktninger
  (f.eks. Polen, Tyskland) kommer høyere.
- **Ulemper:** Omdiskutert metodisk - mange mener innenlandske
  flyktningkostnader ikke er "støtte til Ukraina", men humanitær
  kostnad for mottakerlandet. Gir ikke direkte sammenligning med Kiel
  sitt hovedtall.
- **Politisk framstilling:** Kan virke fordelaktig for land med mange
  flyktninger, ugunstig for mindre "flyktning-tunge" land. Norge ligger
  typisk mellom - noen tusen mottatte flyktninger relativt til BNP.

### Alternativ D: Flermåls-tilnærming - vis flere definisjoner side ved side

- **Hva teller:** Ikke én hoveddefinisjon. Dashboardet har en bryter eller
  tydelig dokumenterte parallelle tall: utbetalt, allokert, allokert
  inklusive flyktningkostnader.
- **Fordeler:** Full transparens. Gir både journalistisk og politisk
  forsvarlig dokumentasjon uavhengig av hvem som leser dashboardet.
- **Ulemper:** Mer kompleksitet i både analysemodul og frontend. Krever
  tydelig UX for at brukeren ikke forvirres. Risiko for at hvert publikum
  sakser det tallet som passer narrativet.
- **Politisk framstilling:** Mest robust mot anklager om tendensiøsitet.

---

## 4. Prosjektleders vurdering

Prosjektet har tre målgrupper (jf. `README.md` og `prosjektplan.md`
seksjon 2.2): journalister/utredere, forskere, og politikere/embetsverk.
Alle tre har ulike krav:

- **Journalister** trenger ett klart overskriftstall og mulighet for å
  begrunne det faglig.
- **Forskere** trenger flere mål og full sporbarhet til Kiel-kilden.
- **Politikere** trenger å kunne sammenligne Norge mot andre land uten
  at metoden virker valgt for å favorisere ett narrativ.

Et rent alternativ A eller C vil tilfredsstille kun ett publikum og skape
metodedebatt hos de andre. Alternativ B er "safe default" og samsvarer med
Kiel sin hovedfigur, men forkaster informasjon som mange norske brukere vil
forvente å se (flyktningkostnader). Alternativ D løser begge - men øker
utviklingsomfanget.

**Det er prosjektleders vurdering at ekstra-kompleksiteten i alternativ D
er håndterbar innenfor M3/M4 hvis vi tar den med i analysemoduldesignet
fra start. Kostnaden ved å måtte rebygge senere (hvis vi først velger B og
så får krav om D) er større.**

---

## 5. Tilrådning

Prosjektleder tilråder **Alternativ D med Alternativ B som utgangspunkt
("default view")**:

1. **Dashboardet har en tydelig definert standardvisning** som følger
   Kiel sin hovedinndeling (allokeringer, eksklusive flyktningkostnader) -
   alternativ B. Dette sikrer direkte sammenlignbarhet med Kiel sine
   publiserte rangeringer og reduserer risiko for at prosjektet blir
   beskyldt for å velge metode selektivt.
2. **Brukeren kan bytte til alternative visninger** via en tydelig
   bryter/nedtrekk: "Kun utbetalt" (alternativ A) og "Inkludert
   flyktningkostnader" (alternativ C).
3. **Hver visning er merket med metodenotat** som forklarer hva som
   inngår og hvor Kiel er kilden for delene.
4. **Alle tall publiseres i absolutte kroner/euro, per capita, og som
   andel av BNP** - uavhengig av hvilken visning brukeren har valgt.
5. **Indirekte bidrag via EU-instrumenter** tilordnes Norge i tråd med
   Kiel sin metodikk (typisk basert på finansieringsnøkkel hvis
   relevant). Vi gjør dette eksplisitt synlig i metodenotatet.
6. **Markedsverdi vs. bokført verdi for materiell:** Vi følger Kiel sin
   valgte verdsetting. Det er ikke i prosjektets scope å gjøre egen
   verdsetting av donert militært utstyr.

Denne tilnærmingen gir oss:
- **Lav metodisk risiko** (Kiel-kompatibilitet i hovedvisningen).
- **Full transparens** (alle tre varianter tilgjengelig, godt dokumentert).
- **Politisk forsvarlighet** (ingen skjulte valg).
- **Håndterbar teknisk kompleksitet** (samme underliggende datamodell,
  kun aggregeringslag som varierer).

---

## 6. Konsekvenser for videre prosjekt

Ved godkjenning av tilrådningen:

- **M2 Datapipeline:** `dataingenior` må hente inn Kiel-data som bevarer
  *alle tre fasene* (utbetalt, allokert, og komponent for flyktning-
  kostnader) for alle land - ikke bare for Norge. Dette gir litt mer
  dataarbeid, men er nødvendig for D.
- **M3 Analysemodul:** `analytiker` designer beregninger som parametriseres
  på valgt definisjon. Hvert nøkkeltall beregnes i tre varianter og lagres
  eksplisitt.
- **M4 Dashboard MVP:** `frontend` bygger inn en tydelig definisjonsbryter
  med standard = B. UX-testing må inkludere at brukeren faktisk forstår
  hva bryteren gjør.
- **Validering:** Alle tre visninger krysssjekkes mot Kiel sine publiserte
  figurer der de finnes.

Ved valg av alternativ B (bare én definisjon) reduseres omfanget i M3 og
M4 merkbart, men vi bygger inn en begrensning som vil være vanskelig å
endre senere uten modell-omskrivning.

---

## 7. Beslutning fra prosjekteier

*Fylles inn av prosjekteier:*

- [ ] **Alternativ A** (kun utbetalt, eksklusive flyktningkostnader)
- [ ] **Alternativ B** (Kiel-hovedinndeling, eksklusive flyktningkostnader)
- [ ] **Alternativ C** (Kiel-hovedinndeling, inklusive flyktningkostnader)
- [ ] **Alternativ D** (flermåls-tilnærming med standard = B) - *prosjektleders tilrådning*
- [ ] Annet / ønsker justering: ______________________________

**Dato for beslutning:**
**Signatur:** prosjekteier

---

*Når beslutning er tatt, lukkes S2 i `prosjektplan.md` seksjon 11.3 og
føres i endringsloggen. Valget dokumenteres i `docs/metode.md` (opprettes
ved M3-start).*
