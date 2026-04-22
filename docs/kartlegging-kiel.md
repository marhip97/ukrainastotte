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
- **Siste kjente utgave:** Release 23 (april 2025); dekker allokeringer fram til februar 2026.
- **Filformat:** XLSX (primær). PDF-rapporter og notater finnes som supplement.
- **Oppdateringsfrekvens:** Uregelmessig, typisk 2-4 utgivelser per år.

## 2. Datainnhold

- **Land:** 41 giverland (EU-stater, G7, samt Australia, Sør-Korea, Tyrkia, Norge, New Zealand, Sveits, Kina, Taiwan, India, Island) pluss EU-institusjoner som separat aktør.
- **Kategorier:** Militær, finansiell, humanitær.
- **Faser:**
  - *Commitments* - offentlig lovet.
  - *Allocations* - øremerket/spesifisert for levering (Kiels foretrukne hovedmål).
  - *Disbursements* - faktisk utbetalt (mest komplett for finansiell støtte, koblet mot Ukrainas finansministerium).
- **Flyktningkostnader:** egen komponent, separat fra direkte støtte. Estimert ca. 155 mrd. EUR for EU-medlemsstater feb 2022 - aug 2025.
- **In-kind militærstøtte:** verdsatt til markedspris, øvre grense brukes ved tvil; nasjonal valuta-rapportering fra givere brukes som utgangspunkt.

## 3. Lisens og gjenbruk

Ikke eksplisitt avklart på web-sidene som ble sjekket. Må verifiseres ved nedlasting (kolofon i XLSX og metodenotat). Standard for Kiel Working Papers er som regel fri akademisk/journalistisk bruk med kildehenvisning. Avklares ved første datahenting av `dataingenior`.

## 4. Risiko og observasjoner

- **R1 (filstrukturendring):** Release 23 er siste kjente. Mellom releaser kan Kiel endre kolonneoppsett - parser må ha eksplisitte kolonnesjekker og kontraktstester.
- **R2 (URL-endring):** Domenet har allerede endret seg fra `ifw-kiel.de` til `kielinstitut.de`. Parser bør parametrisere base-URL og ha alternativ kilde.
- **Tilgangsblokkering:** Automatiske `WebFetch`-kall ble blokkert med HTTP 403 under kartleggingen. Løsning: sett egnet `User-Agent` og håndter eventuelle cookie-wallene. Alternativ distribusjonskanal finnes via EconStor (`https://www.econstor.eu/handle/10419/262746`) for tidlige versjoner.

## 5. Føringer for parser-design (M2)

- Datamodellen må bevare *alle tre* faser (commitment/allocation/disbursement) pluss flyktningkostnader som egen komponent - direkte konsekvens av S2-beslutningen (alternativ D).
- Parser må skrive rådata uendret til `data/raw/` og produsere normalisert utgave i `data/processed/` (jf. CLAUDE.md kvalitetskrav).
- Ved parsing-feil eller manglende kolonner skal parser falle tilbake til forrige kjente utgave og opprette Issue via datakilde-malen.

## 6. Foreslåtte neste steg i M2

1. Manuell nedlasting av siste XLSX; committes uendret til `data/raw/release-23/`.
2. Utforskende analyse av kolonnestruktur i notebook under `src/ingest/`.
3. Første iterasjon av parser med eksplisitte kolonnekontrakter.
4. Valideringsregler mot delmål 2 (fange ~95 % åpenbare feil).

---

*Kilder: Kiel Institute sine publiseringssider og metodenotater (se URL-er over), samt sekundærkilder (CEPR VoxEU, EconStor).*
