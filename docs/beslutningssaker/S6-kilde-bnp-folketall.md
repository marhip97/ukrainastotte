# Beslutningssak S6: Kilde og årstall for BNP og folketall

**Sak-ID:** S6
**Dato løftet:** 2026-04-22
**Dato besluttet:** 2026-04-22
**Frist for beslutning:** Før M3-avslutning
**Utarbeidet av:** `prosjektleder` (med faglig innspill fra `analytiker`)
**Mottaker:** Prosjekteier
**Status:** Besluttet - Verdensbanken WDI med MRV

---

## 1. Hvorfor dette er en beslutningssak

Nøkkeltall 2 (**andel av BNP**) og 3 (**per capita**) krever to ikke-Kiel
datapunkter per giverland: **brutto nasjonalprodukt** (BNP) og **folketall**.
Valg av kilde og årstall påvirker:

- **Sammenlignbarhet mellom land.** Forskjellige statistikkbyråer bruker
  ulike definisjoner og revisjonsrutiner.
- **Nivået på Norges andel.** BNP-tall svinger med oljepriser, og
  folketallet har vokst med ca. 1 % per år de siste årene.
- **Hvor oppdaterte tallene er.** Enkelte land revideres sent; andre har
  foreløpige estimater lenge før endelige tall.

Et metodisk valg må tas eksplisitt og dokumenteres, slik at dashboardets
nøkkeltall kan reproduseres og forsvares.

## 2. Alternativer vurdert

- **A. Verdensbanken WDI** (verdensbank.org / api.worldbank.org). Én kilde
  for alle 42 giverland, stabilt offentlig API, nominell BNP i USD og total
  folketall. Oppdateres årlig med siste endelige tall.
- **B. IMF World Economic Outlook**. Oppdateres to ganger per år med
  estimater for inneværende år. Gir ferskere tall, men er *prognoser* som
  revideres - mindre egnet for historisk analyse.
- **C. OECD.Stat**. Høyeste kvalitet for OECD-land, men dekker ikke alle
  Kiels giverland (India, Kina, Taiwan, Malta, Kypros, Bulgaria, Romania
  og Kroatia mangler). Ville kreve blandet kilde.
- **D. Nasjonale kilder**. Høy presisjon per land, men urimelig komplekst
  for 40+ land og kan gi ikke-sammenlignbare definisjoner.

## 3. Beslutning

**Alternativ A valgt: Verdensbanken WDI, med "Most Recent Value"-strategi**
(`MRV=1` i API-kallet).

- **Indikatorer:** `NY.GDP.MKTP.CD` (BNP i løpende USD) og `SP.POP.TOTL`
  (total folketall).
- **Årstall:** Nyeste tilgjengelige endelige tall per land (typisk 2024
  for utviklede land, 2023 for enkelte). Dokumenteres per land i
  `data/reference/wdi.json`.
- **Valutakonvertering:** Kiel-støtte oppgis i EUR. For BNP-andel
  konverteres støtten til USD med rate 1.08 (rimelig snitt 2023-2024);
  raten er parameteriserbar i koden for senere justering. Per capita
  beregnes direkte i EUR per innbygger (ingen konvertering).
- **Utelatte aktører:** EU (Commission and Council), Den europeiske
  investeringsbanken og Taiwan utelates fra BNP-/per capita-beregninger
  (enten ikke land eller ikke dekket av WDI).

## 4. Begrunnelse

Prosjekteier prioriterte **mest mulig oppdaterte tall**. Verdensbanken
oppdaterer WDI årlig og leverer 2024-tall for de fleste utviklede
økonomier. IMF ville gitt enda ferskere *estimater*, men fordi Kiel-støtte
er observert (ikke prognoser), er det mer metodisk ryddig å
sammenligne observert støtte mot observert BNP. OECD ville vært mer
presist for enkeltland, men krever blandet kilde for å dekke alle 42
giverland - unødvendig kompleksitet.

## 5. Konsekvenser

- Analyse-modulen `src/analyze/noekkeltall_relative.py` beregner
  `andel_bnp_pct` og `per_capita_eur` fra Kiel-summary + WDI-JSON.
- Ingest-modulen `src/ingest/fetch_wdi.py` henter WDI via månedlig
  workflow (`.github/workflows/fetch-wdi.yml`).
- Dashboardet viser referanseåret i en metode-notat der det er relevant,
  og utelater land uten WDI-data fra BNP-/capita-rangeringer.

## 6. Dokumentasjon

- Kilde: Verdensbanken, *World Development Indicators*,
  <https://data.worldbank.org/>.
- API-dokumentasjon: <https://datahelpdesk.worldbank.org/knowledgebase/articles/889392>.
- Lokalt cache: `data/reference/wdi.json`.
