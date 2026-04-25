# M6.3 Designdokumentasjon - dashboardet

Denne mappen inneholder designgrunnlaget for milepæl M6.3 (Visuelt
redesign) i prosjektplanen. Dokumentene er sekvensielle: hvert
dokument bygger på det forrige.

## Dokumenter

1. [`01-principles.md`](01-principles.md) - Designprinsipper.
   Målgruppe, visuelt hierarki, typografi og farger, prinsipper
   for datavisualisering (Tufte/Few/Munzner), tilgjengelighet
   etter WCAG 2.2 AA.
2. [`02-information-architecture.md`](02-information-architecture.md) -
   Informasjonsarkitektur og layout. Seksjonsinndeling,
   prioritering above/mid/below the fold, 12-kolonne grid med
   tre breakpoints, og ASCII-wireframe for desktop og mobil.
3. [`03-components-and-charts.md`](03-components-and-charts.md) -
   Komponenter og grafer. Komponentbibliotek (KPI-kort, tabell,
   filtre, knapper, tilstander), graftyper koblet til datatyper,
   per-graf spesifikasjon, fargepalett som hex og Plotly-tema,
   interaksjonsmønstre.
4. [`04-implementation-plan.md`](04-implementation-plan.md) -
   Implementasjonsplan. Teknologivalg basert på dagens kodebase,
   12 utviklingssteg i prioritert rekkefølge, avhengighetskart,
   risikovurdering R10-R14, test- og roll-back-strategi.

## Sammendrag (maks 30 linjer)

M6.3 omarbeider dashboardet visuelt uten å endre datapipelinen.
Hovedgrep:

- **Hierarki først.** Norges total allokering blir hero-tall i
  3 rem; tre støttetall rundt. Resten plasseres i tre nivåer
  etter brukerintensjon (faktasjekk → sammenligning → utforsking).
- **Fra rød til blå.** Aksenten endres fra dagens
  `#d71418` til en blå palett (`#1d3557` primær). Norsk rødt
  beholdes for negativ delta og som detalj.
- **12-kolonne fluid grid** med tre breakpoints (768/1100 px) og
  konsekvent gutter, sidemargs- og seksjonsavstand.
- **Donut erstattes** av stablet horisontal stolpe for bedre
  andelssammenligning.
- **Direkte etikettering** i scatter, dempede gridlinjer, alle
  y-akser starter på 0, norsk tallformat med mellomrom.
- **Eksport.** PNG per graf via Plotly `downloadImage`. CSV-zip
  i footer.
- **Land-gruppefiltre.** Hurtigknapper for Norden/EU/G7/NATO som
  styrer komparativ profil, rangering og scatter via en delt
  tilstand.
- **WCAG 2.2 AA verifisert** med kontraståttesjekk, tastaturflyt,
  skjult tabell-fallback for tidsserie og `prefers-reduced-motion`.

Estimert leveringstid 8-16 utviklingsdager - i overkant av
prosjektplanens M6.3-estimat på 1 uke. Eskalering til prosjekteier
behandles før utvikling starter.
