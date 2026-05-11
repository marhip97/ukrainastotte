# M7.4 Designnotat - Periode-bryter og EU-bryter

**Status:** Utkast til prosjekteier-godkjenning.
**Dato:** 2026-05-11.
**Forutsetninger:** M7.2 og M7.3 ferdige. CSV-ene `country_summary_eu.csv`
og `country_summary_aar.csv` ligger i `data/processed/`.
**Designprinsipp F5:** designet beholdes i tråd med M6.3-leveransen.
Ingen nye farger, fonter eller graftyper. Tokens fra `tokens.css` og
komponentstil fra `dashboard.js` gjenbrukes uten endring.

## 1. Hva M7.4 leverer

To nye globale brytere som styrer alle hovedvisninger i dashboardet:

1. **Periode-bryter** med valgene **Kumulativt** (default) | **2025** | **2026**.
2. **EU-bryter** med valgene **EKSKL EU** (default) | **INKL EU**.

Reglene mellom dem er definert av prosjekteierbeslutningene F2 og F3:

- **F2:** EU-fordeling er valgbar bryter, ikke ny standardvisning.
- **F3:** EU-bryter brukes kun på kumulative tall. For enkeltår er
  bryteren grået ut og låst på EKSKL EU.

## 2. Plassering

Begge bryterne plasseres i `hero-seksjon`-toppen, ved siden av eksisterende
valuta-bryter (EUR/NOK). De danner en horisontal toggle-bar med tre grupper:

```
┌─────────────────────────────────────────────────────────────────┐
│  Valuta:  [EUR]  [NOK]    Periode:  [Kumulativt]  [2025]  [2026] │
│                            EU:      [EKSKL]  [INKL] (grå ved år) │
└─────────────────────────────────────────────────────────────────┘
```

Markup-mønster speiler eksisterende `.valuta-toggle`-blokk (radio-knapper
med visuell `pill`-stil), så strukturen er forutsigbar for skjermlesere.

Mobile (under 720 px breakpoint): bryterne stables vertikalt i samme
rekkefølge (valuta → periode → EU). Hver toggle beholder full bredde.

## 3. Periode-bryter

### Tilstander

| Valg | Datakilde | Hva som filtreres |
|---|---|---|
| Kumulativt (default) | `country_summary_eu.csv` | Hele perioden 2022 → siste Kiel-release |
| 2025 | `country_summary_aar.csv` (filtrert på aar=2025) | Aktiviteter med `month_exists_dummy=1` og month 37-48 |
| 2026 | `country_summary_aar.csv` (filtrert på aar=2026) | Aktiviteter med month_exists_dummy=1 og month 49-60 |

### Dynamisk år-liste

Dropdown bygges runtime: året 2025 og fremover hentes fra
`country_summary_aar.csv` ved å lese unike `aar`-verdier som har minst
ett land med data. Det betyr at når Kiel publiserer Release 29 (data til
mai 2026), kommer 2026 automatisk inn uten kodeendring. Når 2027-data
foreligger, kommer 2027 inn.

Sorteringsrekkefølge: `Kumulativt` først, deretter år i fallende
rekkefølge (nyeste først). Det matcher hvordan brukerne tenker -
"siste år" øverst etter helhetsbildet.

## 4. EU-bryter

### Tilstander

| Periode | EU-valg | Verdi som vises |
|---|---|---|
| Kumulativt | EKSKL (default) | `country_summary_eu.csv` kolonne `total_allocation` |
| Kumulativt | INKL | `country_summary_eu.csv` kolonne `total_allocation_inkl_eu` |
| Enkeltår | EKSKL (låst) | `country_summary_aar.csv` (bryter grå ut) |
| Enkeltår | INKL (utilgjengelig) | — |

### Grået-ut-tilstand

Ved enkeltårs-valg legges `aria-disabled="true"` og `disabled` på
INKL-radio-knappen. Visuelt: opacity 0,4 på `.eu-toggle`-blokk og en
liten tekstmerknad:

> *EU-fordeling er kun tilgjengelig på kumulative tall.*

Når periode endres tilbake til Kumulativt, gjenoppstår bryteren med
sist valgte EU-tilstand (huskes i `sessionStorage`).

### Hva INKL EU faktisk gjør

For EU-medlemsland: `total_allocation_inkl_eu` og
`total_commitment_inkl_eu` fra Kiels pre-aggregerte verdier brukes
(per S23-beslutning). For ikke-EU-medlemmer (Norge, UK, USA, m.fl.)
er INKL og EKSKL identiske og bryterens påvirkning er null.

Eksempel: Tyskland EKSKL = 25,3 mrd EUR, INKL = 44,4 mrd EUR.
Norge EKSKL = INKL = 10,0 mrd EUR.

## 5. Hero-seksjon (Norge-fokus)

### Kumulativ tilstand (uendret fra M6.3)

Fire kort på 2x2-rutenett: total allokering, BNP-andel, per innbygger,
forpliktelse. Tall fra `country_summary_eu.csv` eller
`country_summary_relative.csv`.

### Enkeltår-tilstand (ny)

Samme 2x2-rutenett, men tallene erstattes med år-spesifikke verdier
fra `country_summary_aar.csv`:

- **Total allokering 2025** = 4,68 mrd EUR (Norge)
- **Andel av BNP 2025** = 1,15 %
- **Per innbygger 2025** = 839 EUR
- **Forpliktelse 2025** = beregnet fra activity_value-summen for året

Hver KPI får liten ekstra etikett under tallet: "i 2025" eller "i 2026"
slik at brukeren ikke forveksler enkeltår med kumulativt. Eksempel
etikettstil: `<span class="kpi-periode-merknad">i 2025</span>`.

## 6. Rangering, scatter og komparativ profil

### Rangering (topp 15)

- **Kumulativt:** rangering på `total_allocation` (EKSKL eller INKL EU
  basert på bryter). Som M6.3 i dag.
- **Enkeltår:** rangering på `total_allocation` for valgt år. Land uten
  data i året (typisk små bidragsytere) faller naturlig ut.

Visualiseringen (Plotly horizontal bar) er uendret. Bare datasettet
bytter.

### Scatter plot (Andel BNP × Per capita)

- **Kumulativt:** uendret fra M6.3 - Kiel-BNP og kumulative per capita
  verdier.
- **Enkeltår:** akser med årets verdier. Tittel oppdateres til
  "Andel BNP (2025) × Per capita (2025) EUR".

### Komparativ landprofil (Norge + sammenligningsland)

- **Kumulativt:** uendret.
- **Enkeltår:** hver KPI-rad viser årets verdi i stedet for kumulative.
  Land uten data i året viser "—" (em-dash) i samme kolonne. Multivelger
  og hurtigknapper (Norden/EU/G7/NATO) påvirkes ikke.

### Tidsseriegraf

Tidsseriegrafen er **uavhengig** av periode-bryteren. Den viser alltid
hele tidsperioden 2022 → siste data, fordi den er en utvikling-over-tid-
graf. Toggle akkumulert/per måned beholdes som i M6.3.

## 7. Tilstandslagring

Periode-valg lagres i `sessionStorage["m7_periode"]`. EU-valg lagres i
`sessionStorage["m7_eu"]`. Verdier overlever sideoppdateringer i samme
fane, men reset ved ny fane. Det matcher hvordan eksisterende
valuta-bryter fungerer.

## 8. Tilgjengelighet

- Radio-knapper med `aria-label` og synlige labels.
- Grået-ut INKL-knapp: `aria-disabled="true"` og `disabled`-attributt.
- Tekstmerknad ved grå ut: `role="status"` for skjermlesere.
- Tastatur: pil-taster navigerer innen toggle-grupper (native radio-oppførsel).
- Fargekontrast: minimum 4,5:1 mot bakgrunn, samme som eksisterende
  toggles.

## 9. Wireframe - kumulativt vs. enkeltår

### Kumulativt (default)

```
┌──────────────────────────────────────────────────────────────────┐
│ SFSs Ukraina-støtte overvåker                                    │
│ Norges støtte basert på Kiel...                                  │
│ Sist oppdatert: 22. april 2026                                   │
│ ⓘ Metode oppdatert mai 2026: se 'Hva er endret'                  │
├──────────────────────────────────────────────────────────────────┤
│ [EUR] [NOK]   Periode: [Kumulativt] [2025] [2026]   EU: [EKSKL] [INKL]│
├──────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┐                                    │
│ │ 10,01 mrd   │ 2,45 %      │   ← KPI-kort (kumulative tall)     │
│ │ Tot. alloc. │ Andel BNP   │                                    │
│ ├─────────────┼─────────────┤                                    │
│ │ 1 796 EUR   │ 24,72 mrd   │                                    │
│ │ Per innb.   │ Forpliktelse│                                    │
│ └─────────────┴─────────────┘                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Enkeltår = 2025

```
┌──────────────────────────────────────────────────────────────────┐
│ [EUR] [NOK]   Periode: [Kumulativt] [2025] [2026]   EU: ░EKSKL░ ░INKL░│
│                       *EU kun på kumulative tall*                │
├──────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┐                                    │
│ │ 4,68 mrd    │ 1,15 %      │   ← KPI-kort (kun 2025)            │
│ │ Tot. alloc. │ Andel BNP   │                                    │
│ │ i 2025      │ i 2025      │                                    │
│ ├─────────────┼─────────────┤                                    │
│ │ 839 EUR     │ —           │                                    │
│ │ Per innb.   │ Forpliktelse│                                    │
│ │ i 2025      │ (kun kum.)  │                                    │
│ └─────────────┴─────────────┘                                    │
└──────────────────────────────────────────────────────────────────┘
```

Merk i 2025-tilstand:
- EU-bryter grået ut med statustekst.
- Hver KPI har "i 2025"-etikett.
- "Forpliktelse"-kortet kan vise enkeltårsverdi hvis vi har activity-data
  per måned (vi har det per M7.2-implementering), eller "—" hvis vi vurderer
  at månedlig commitment ikke er meningsfullt. **Anbefaling: vise
  enkeltårsverdi**, siden vi allerede beregner det i `country_summary_aar.csv`.

## 10. Implementeringsomfang (Steg 2)

Filer som endres:

- `src/dashboard/index.html` - to nye toggle-grupper i hero-seksjonen,
  KPI-kort får conditional periode-etikett.
- `src/dashboard/dashboard.js` - state-håndtering for periode og EU,
  conditional CSV-lesing, oppdaterte filterfunksjoner for rangering/
  scatter/komparativ.
- `src/dashboard/styles.css` - styling for `.periode-toggle`,
  `.eu-toggle`, `.kpi-periode-merknad` og grået-ut-tilstand.

Estimat: L (2-3 dager). Tester verifiserer at riktige CSV-er leses i
hver tilstand og at grået-ut-logikken signaliseres korrekt.

## 11. Spørsmål til prosjekteier før implementering

1. **Forpliktelse i enkeltår-tilstand:** vis enkeltårsverdi (anbefalt)
   eller skjul kortet helt og vis "—"?
2. **År-rekkefølge i bryter:** *Kumulativt → 2026 → 2025* (nyeste år
   først) som anbefalt, eller *Kumulativt → 2025 → 2026* (kronologisk)?
3. **Default ved første besøk:** Kumulativt + EKSKL (M7-plan F2/F4
   tilsier dette). Bekreft.
4. **Tidsseriegrafen** holdes utenfor periode-bryteren (alltid hele
   perioden). Bekreft.

Implementering starter når disse fire er besvart.
