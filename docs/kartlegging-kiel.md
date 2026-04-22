# Kartlegging: Kiel Ukraine Support Tracker som datakilde

**Dato:** 2026-04-22
**Rolle:** `dataingenior` (rapportert gjennom `prosjektleder`)
**Formål:** Underlag for M2 Datapipeline.

## 1. Publisering og tilgang

- **Hovedside:** `https://www.kielinstitut.de/topics/war-against-ukraine/ukraine-support-tracker`
- **Datapublisering:** `https://www.kielinstitut.de/publications/ukraine-support-tracker-data-6453/`
- **Metodenotat:** `https://www.kielinstitut.de/fileadmin/Dateiverwaltung/Subject_Dossiers_Topics/Ukraine/Ukraine_Support_Tracker/Ukraine_Support_Tracker_-_Research_Note.pdf`
- **Eldre metodeoppdatering (feb 2024):** ligger under `ifw-kiel.de`-domenet - bekrefter at domenet har endret seg fra `ifw-kiel.de` til `kielinstitut.de` (R2-risiko).
- **Kontakt:** `ukrainetracker@kielinstitut.de`
- **Faktisk nedlastet utgave:** **Release 28** (filnavn `<uuid>-Ukraine_Support_Tracker_Release_28.xlsx`, ~10 MB). Den automatiske workflow-en traff altså en nyere utgave enn Release 23 som websøket antydet.
- **Filformat:** XLSX (primær). PDF-rapporter og notater finnes som supplement.
- **Oppdateringsfrekvens:** Uregelmessig, typisk 2-4 utgivelser per år.

## 2. Datainnhold (verifisert mot Release 28)

- **Land:** 44 distinkte givere registrert i bilateral-arket (EU-stater, G7, pluss Australia, Sør-Korea, Tyrkia, **Norge**, New Zealand, Sveits, Kina, Taiwan, India, Island m.fl.). EU-institusjoner er egen aktør.
- **Kategorier (`aid_type_general`):** `Financial`, `Humanitarian`, `Military`. NB: noen rader har trailing whitespace (`Humanitarian `) - parseren normaliserer.
- **Faser (`measure`):** `Allocation` og `Commitment`. Disbursement (faktisk utbetaling) finnes **ikke** i hovedarket, men i eget ark `Financial disb per Month (€)` (månedlige beløp i € mrd). Merknad: dette arket dekker **kun finansielle budget support-utbetalinger** - ikke militær eller humanitær støtte. Norge har 5 utbetalinger siden Mai 2022 som summerer til ca. 0.65 mrd EUR, langt under total_commitment på 24.7 mrd EUR.
- **Hovedark:**
  - `Bilateral Assistance, MAIN DATA` (5580 rader) - langformat, én rad per sub-aktivitet med 89+ kolonner (metadata, verdier i lokal valuta og EUR, våpen-detaljer, geografiske data, dummy-flagg).
  - `Country Summary (€)` - pre-aggregert per land i € mrd (header på rad 8 etter preamble).
  - Ukentlige/månedlige tidsserie-ark (`Allocations per Month ...`, `Commitments per Month ...`).
  - 30+ figur-ark med ferdig formaterte tabeller for Kiels egne visualiseringer.
- **Flyktningkostnader:** rapporteres separat i Kiels egne publikasjoner; ikke identifisert som eget ark i Release 28 (må følges opp når S2-visning "inkludert flyktningkostnader" skal bygges).
- **In-kind militærstøtte:** verdsatt til markedspris; egne kolonner `item`, `item_price_USD`, `item_value_estimate_USD`, m.fl.

## 2b. Kjente nøkkeltall for Norge (Release 28, Country Summary € mrd)

Brukt som gylne verdier i `tests/test_parse_kiel.py::test_krysssjekk_norges_total_allocation`:

| Mål | Verdi (€ mrd) |
|---|---|
| Financial allocation | 2.03 |
| Humanitarian allocation | 1.78 |
| Military allocation | 6.19 |
| **Total allocation** | **10.00** |
| Total commitment | 24.72 |

Gapet commitment→allocation på ca. 14.7 mrd EUR bekrefter Kiels poeng om at allocations er et strengere mål enn commitments - direkte relevant for S2-visningene.

## 3. Lisens og gjenbruk

Ikke eksplisitt avklart på web-sidene som ble sjekket. Må verifiseres ved nedlasting (kolofon i XLSX og metodenotat). Standard for Kiel Working Papers er som regel fri akademisk/journalistisk bruk med kildehenvisning. Avklares ved første datahenting av `dataingenior`.

## 4. Risiko og observasjoner

- **R1 (filstrukturendring):** Release 23 er siste kjente. Mellom releaser kan Kiel endre kolonneoppsett - parser må ha eksplisitte kolonnesjekker og kontraktstester.
- **R2 (URL-endring):** Domenet har allerede endret seg fra `ifw-kiel.de` til `kielinstitut.de`. Parser bør parametrisere base-URL og ha alternativ kilde.
- **Tilgangsblokkering:** Automatiske `WebFetch`-kall ble blokkert med HTTP 403 under kartleggingen. Løsning: sett egnet `User-Agent` og håndter eventuelle cookie-wallene. Alternativ distribusjonskanal finnes via EconStor (`https://www.econstor.eu/handle/10419/262746`) for tidlige versjoner.

## 5. Føringer for parser-design (M2)

- Datamodellen må bevare begge faser (`Allocation` og `Commitment`) fra `measure`-kolonnen. Utbetaling/disbursement krever kobling mot `Financial disb per Month (€)`-arket og er eget arbeid.
- Flyktningkostnader ikke funnet i Release 28 som separat ark - må avklares når tredje S2-visning bygges (kan kreve supplering fra Kiels notater eller egen kalkulasjon).
- Parser må skrive rådata uendret til `data/raw/` og produsere normalisert utgave i `data/processed/` (jf. CLAUDE.md kvalitetskrav).
- Ved parsing-feil eller manglende kolonner skal parser falle tilbake til forrige kjente utgave og opprette Issue via datakilde-malen.

## 6. Status etter første nedlasting

1. ~~Manuell nedlasting~~ → **automatisert** via `.github/workflows/fetch-kiel.yml`. Release 28 ligger i `data/raw/kiel/`.
2. **Utforskende analyse gjennomført** direkte mot XLSX - strukturen dokumentert i seksjon 2 over.
3. **Parser implementert** i `src/ingest/parse_kiel.py` med kontrakter for begge hovedark. Testet med fixture og kryssjekket mot ekte fil.
4. **Valideringsregler** - foreløpig dekket av kontraktsfeil + kryssjekk Norge allocation. Utvides i M3.

---

*Kilder: Kiel Institute sine publiseringssider og metodenotater (se URL-er over), samt sekundærkilder (CEPR VoxEU, EconStor).*
