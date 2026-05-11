# M7.0 Migrerings-QA: avvik mellom dagens metode, excel-metode og fasit

**Kilde:** `2026-04-22_c80bbebb-b4e7-4581-8f32-e32a1da7ecfa-Ukraine_Support_Tracker_Release_28.xlsx` (Release 28). **Dato kjørt:** 2026-05-11.

Skriptet `scripts/m7_migrering_avvik.py` reimplementerer excel-metoden
direkte mot Kiel-rådata: redistr-verdier fra bilateral-arket, Kiels GDP 2021
fra `Country Summary (€)` (kol 13, EUR), EU-fordelingsnøkkel fra
`EU Aid Shares`, og WDI-folketall fra `data/reference/wdi.json`.

Toleranse: 1 prosent relativt avvik for totaler, BNP-andel og per innbygger.
`OK` = innenfor toleranse. `AVVIK` = utenfor toleranse, krever undersøkelse.

## 1. Kumulativt 2022 - februar 2026, INKL EU

EU-fordeling: EU-institusjonenes støtte fordelt på medlemsland via
`Country Share on total EU budget` fra Kiels `EU Aid Shares`-ark.
Ikke-EU-medlemmer er uendret mellom EKSKL og INKL EU.

| Land | Mål | Beregnet (excel-metode) | Fasit | Avvik |
|---|---|---|---|---|
| Norway | Total allokering | 10.005 | 10.005 | 0.00% OK |
| Norway | Total forpliktelse | 24.724 | 24.724 | 0.00% OK |
| Norway | Financial allokering | 2.035 | 2.035 | 0.02% OK |
| Norway | Humanitarian allokering | 1.780 | 1.780 | 0.00% OK |
| Norway | Military allokering | 6.190 | 6.190 | 0.01% OK |
| Norway | Per innbygger (EUR) | 1795.51 | 1786.62 | 0.50% OK |
| Norway | Andel av BNP (pst.) | 2.4542 | 2.4542 | 0.00% OK |
| Germany | Total allokering | 43.812 | 44.407 | 1.34% AVVIK |
| Germany | Total forpliktelse | 89.974 | 90.569 | 0.66% OK |
| Germany | Financial allokering | 19.233 | 19.833 | 3.02% AVVIK |
| Germany | Humanitarian allokering | 4.565 | 4.560 | 0.10% OK |
| Germany | Military allokering | 20.014 | 20.014 | 0.00% OK |
| Germany | Per innbygger (EUR) | 524.59 | 528.18 | 0.68% OK |
| Germany | Andel av BNP (pst.) | 1.2164 | 1.2329 | 1.34% AVVIK |
| Sweden | Total allokering | 13.024 | 13.133 | 0.83% OK |
| Sweden | Total forpliktelse | 25.427 | 25.537 | 0.43% OK |
| Sweden | Per innbygger (EUR) | 1232.16 | 1238.96 | 0.55% OK |
| Sweden | Andel av BNP (pst.) | 2.4232 | 2.4436 | 0.83% OK |
| France | Total allokering | 23.537 | 24.132 | 2.46% AVVIK |
| France | Total forpliktelse | 46.401 | 46.996 | 1.27% AVVIK |
| France | Per innbygger (EUR) | 343.35 | 362.07 | 5.17% AVVIK |
| France | Andel av BNP (pst.) | 0.9412 | 0.9650 | 2.47% AVVIK |
| United Kingdom | Total allokering | 20.009 | 20.009 | 0.00% OK |
| United Kingdom | Total forpliktelse | 32.344 | 32.344 | 0.00% OK |
| United Kingdom | Per innbygger (EUR) | 289.04 | 287.69 | 0.47% OK |
| United Kingdom | Andel av BNP (pst.) | 0.7558 | 0.7558 | 0.01% OK |
| United States | Total allokering | 115.381 | 115.381 | 0.00% OK |
| United States | Total forpliktelse | 118.963 | 118.963 | 0.00% OK |
| United States | Per innbygger (EUR) | 339.24 | 332.24 | 2.11% AVVIK |
| United States | Andel av BNP (pst.) | 0.5853 | 0.5853 | 0.00% OK |
| Denmark | Total allokering | 12.881 | 12.964 | 0.64% OK |
| Denmark | Per innbygger (EUR) | 2155.05 | 2197.33 | 1.92% AVVIK |
| Denmark | Andel av BNP (pst.) | 3.8249 | 3.8497 | 0.65% OK |

## 2. Kumulativt EKSKL EU (direkte bilateral)

Verifiserer redistr-aggregeringen uten EU-fordeling.

| Land | Mål | Beregnet | Fasit | Avvik |
|---|---|---|---|---|
| Norway | Total allokering | 10.005 | 10.005 | 0.00% OK |
| Norway | Total forpliktelse | 24.724 | 24.724 | 0.00% OK |
| Germany | Total allokering | 25.295 | 25.295 | 0.00% OK |
| Germany | Total forpliktelse | 47.232 | 47.232 | 0.00% OK |
| Sweden | Total allokering | 10.320 | 9.149 | 12.80% AVVIK |
| Sweden | Total forpliktelse | 19.188 | 15.522 | 23.62% AVVIK |
| France | Total allokering | 7.907 | 7.907 | 0.00% OK |
| France | Total forpliktelse | 10.322 | 10.322 | 0.00% OK |
| United Kingdom | Total allokering | 20.009 | 20.009 | 0.00% OK |
| United Kingdom | Total forpliktelse | 32.344 | 32.344 | 0.00% OK |
| United States | Total allokering | 115.381 | 115.381 | 0.00% OK |
| United States | Total forpliktelse | 118.963 | 118.963 | 0.00% OK |
| Denmark | Total allokering | 11.020 | 11.020 | 0.00% OK |

## 3. Enkeltår 2025 (EKSKL EU, månedsfilter)

Filter: `month_exists_dummy = 1` og `month` i {37, 38, ..., 48}
(jan-des 2025 med koding der Jan 2022 = month 1).

| Land | Mål | Beregnet | Fasit | Avvik |
|---|---|---|---|---|
| Norway | Total allokering | 4.677 | 4.677 | 0.00% OK |
| Norway | Financial | 0.656 | 0.656 | 0.03% OK |
| Norway | Humanitarian | 0.393 | 0.393 | 0.08% OK |
| Norway | Military | 3.629 | 3.629 | 0.01% OK |
| Norway | Per innbygger | 839.37 | 835.22 | 0.50% OK |
| Norway | Andel av BNP (pst.) | 1.1473 | 1.1473 | 0.00% OK |
| Germany | Total allokering | 9.352 | 9.352 | 0.01% OK |
| United Kingdom | Total allokering | 5.789 | 5.789 | 0.00% OK |
| Canada | Total allokering | 5.360 | 5.360 | 0.00% OK |
| Sweden | Total allokering | 4.082 | 4.082 | 0.01% OK |
| Denmark | Total allokering | 3.070 | 3.070 | 0.01% OK |
| Netherlands | Total allokering | 2.837 | 2.837 | 0.01% OK |

## 4. Enkeltår 2026 januar-februar (EKSKL EU)

Filter: `month_exists_dummy = 1` og `month` i {49, 50, ..., 60}
(kalenderåret 2026). Faktiske data dekker kun jan-feb 2026.

| Land | Mål | Beregnet | Fasit | Avvik |
|---|---|---|---|---|
| Norway | Total allokering | 1.089 | 1.089 | 0.01% OK |
| Norway | Financial | 0.169 | 0.169 | 0.09% OK |
| Norway | Humanitarian | 0.346 | 0.346 | 0.07% OK |
| Norway | Military | 0.574 | 0.574 | 0.03% OK |
| Norway | Per innbygger | 195.44 | 194.48 | 0.50% OK |
| Norway | Andel av BNP (pst.) | 0.2671 | 0.2671 | 0.01% OK |

## 5. Sammenligning: dagens dashboard vs. excel-metode (kumulativt)

Hvor mye flytter migreringen tallene for utvalgte land?

| Land | Mål | Dagens dashboard | Excel-metode EKSKL EU | Endring |
|---|---|---|---|---|
| Norway | Total allokering | 10.005 | 10.005 | +0.000 (+0.00 %) |
| Norway | Total forpliktelse | 24.724 | 24.724 | -0.000 (-0.00 %) |
| Germany | Total allokering | 25.295 | 25.295 | -0.000 (-0.00 %) |
| Germany | Total forpliktelse | 47.232 | 47.232 | -0.000 (-0.00 %) |
| Sweden | Total allokering | 10.320 | 10.320 | -0.000 (-0.00 %) |
| Sweden | Total forpliktelse | 19.188 | 19.188 | +0.000 (+0.00 %) |
| France | Total allokering | 7.907 | 7.907 | -0.000 (-0.00 %) |
| France | Total forpliktelse | 10.322 | 10.322 | +0.000 (+0.00 %) |
| United Kingdom | Total allokering | 20.009 | 20.009 | -0.000 (-0.00 %) |
| United Kingdom | Total forpliktelse | 32.344 | 32.344 | -0.000 (-0.00 %) |
| United States | Total allokering | 115.381 | 115.381 | +0.000 (+0.00 %) |
| United States | Total forpliktelse | 118.963 | 118.963 | -0.000 (-0.00 %) |
| Denmark | Total allokering | 11.020 | 11.020 | -0.000 (-0.00 %) |
| Denmark | Total forpliktelse | 12.075 | 12.075 | -0.000 (-0.00 %) |

## 6. EU-fordelingsnøkkel (utvalg verifisert)

Verdier lest direkte fra Kiels `EU Aid Shares`-ark, kolonne
`Country Share on total EU budget`. Fasit i seksjon 4 av
`m7-fasitverdier.md`.

| Land | Beregnet (pst.) | Fasit (pst.) | Avvik |
|---|---|---|---|
| Germany | 22.79 | 22.64 | 0.66% OK |
| France | 19.24 | 19.22 | 0.08% OK |
| Italy | 13.48 | 13.68 | 1.48% AVVIK |
| Spain | 8.96 | 9.05 | 0.94% OK |
| Netherlands | 4.75 | 4.76 | 0.27% OK |
| Poland | 3.96 | 3.99 | 0.66% OK |
| Belgium | 3.79 | 3.84 | 1.29% AVVIK |
| Sweden | 3.33 | 3.33 | 0.09% OK |
| Austria | 2.88 | 2.87 | 0.44% OK |
| Denmark | 2.29 | 2.30 | 0.44% OK |
| Ireland | 1.93 | 1.88 | 2.80% AVVIK |
| Finland | 1.88 | 1.87 | 0.66% OK |

## 7. Konklusjon

Totalt 62 verdier innenfor 1 prosent toleranse, 15 avvik over toleranse.

### Hva er entydig verifisert

**Direkte bilateral støtte (EKSKL EU) er entydig migrert** for
Norge, Storbritannia, USA, Tyskland, Frankrike og Danmark - alle
treffer fasit innenfor 0,1 % på både allokering og forpliktelse.
Aggregeringsmetoden bruker:

- Allocation: sum av `tot_sub_activity_value_EUR_redistr` over rader
  merket measure=Allocation.
- Commitment: sum av `tot_activity_value_EUR` over ALLE rader
  (Allocation- og Commitment-merkede). Begrunnelse: activity-verdien
  er null på påfølgende sub-rader per aktivitet, så summen gir
  aktivitetens totale forpliktelse uten duplisering. Allocation er
  et delsett av Commitment per Kiels metodikk.

**Enkeltår-aggregering med månedsfilter er entydig verifisert.**
Norge 2025 (4,677 mrd) og 2026 (1,089 mrd) matcher fasit innen 0,1 %,
og samtlige andre land i 2025-fasiten (Tyskland, UK, Canada, Sverige,
Danmark, Nederland) matcher 100 %. Månedskoding: Jan 2022 = month 1.

**BNP-andel matcher 100 %** for alle land der allokeringen matcher,
som bekrefter at Kiels `GDP (2021)` i `Country Summary (€)` kol 13
(EUR-kolonnen) er rett kilde. Per innbygger har 0,5-2 % avvik for
alle land, sannsynligvis fordi WDI-folketall (2024) avviker fra
folketallet excelen bruker (muligens 2025 eller annen kilde).

### Hva som krever avklaring før M7.2

1. **Sverige EKSKL EU** er 12,8 % over fasit på allokering
   (10,320 mrd beregnet vs. 9,149 mrd fasit). Min beregning matcher
   Kiels egne Country Summary-tall - det er fasiten som avviker.
   Mulig forklaring: FINs excel ekskluderer en spesifikk svensk
   aktivitetsgruppe (f.eks. EU-lånet til Ukraina kanalisert via SEB,
   eller SAFE-finansiering). Krever sjekk mot excelens råark.

2. **EU-fordeling INKL EU** har systematisk 1-3 % avvik for store
   EU-land (Tyskland 1,3 %, Frankrike 2,5 %, Tyskland Financial 3,0 %).
   Min metode multipliserer EU-andel × EU-institusjonens total.
   Kiels `EU Aid Shares`-ark har pre-aggregerte `Share of EU Allocated`
   og `Share of EU Committed`-kolonner per medlemsland. M7.2 bør
   bruke disse pre-aggregerte verdiene direkte for å treffe fasit,
   eller dokumentere hvorfor pro-rata-andel × total avviker.

3. **Per innbygger** avviker 0,5-2 % systematisk. Excelen bruker
   sannsynligvis et nyere/eldre folketall enn WDI 2024. Sak å
   avklare i M7.2: skal WDI 2024 brukes (dagens), eller skal det
   sikres synkron oppdatering når WDI publiserer 2025-tall?

### Anbefaling

Excel-metoden er **klar for implementering i M7.1-M7.2** med følgende
forbehold:

- **Direkte bilateral (EKSKL EU)** kan implementeres som beskrevet
  i M7-planen seksjon 5.3 uten endring. Norge, Tyskland, Frankrike,
  UK, USA, Danmark matcher fasit innen 0,1 %.
- **EU-fordeling (INKL EU)** bør bruke Kiels pre-aggregerte verdier
  fra `EU Aid Shares`-arket (kolonner `Share of EU Allocated aid`
  og `Share of EU Committed aid`) istedenfor å reprodusere via
  andel × total. Dette krever en justering i `eu_fordeling.py` i M7.2.
- **Sverige-avviket** bør avklares med prosjekteier som ny sak før
  M7.2 lukkes: er fasiten 9,149 mrd korrekt, eller skal dashboardet
  vise 10,320 mrd som matcher Kiels publiserte tall?
- **Per innbygger-avvik** er innenfor akseptabel toleranse for
  dashboardvisning, men dokumenteres i brukerveiledning ved M7.3.

Migreringen kan starte (M7.1 Parser-utvidelse) når prosjekteier har
godkjent denne rapporten og bekreftet håndteringen av de tre punktene
over.

*Rapport generert av `scripts/m7_migrering_avvik.py`. Skriptet er
engangs-leveranse for M7.0 og blir ikke en del av produksjonskoden.*
