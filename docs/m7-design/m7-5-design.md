# M7.5 Designnotat - Flak-forhåndsvisning og nedlasting

**Status:** Utkast til prosjekteier-godkjenning.
**Dato:** 2026-05-11.
**Forutsetninger:** M7.4 ferdig (periode-bryter og EU-bryter virker).
S20 besluttet: tabell 1 låst til malens 9 rader i første versjon.
S19 besluttet: `flak-mal.docx` legges i `src/dashboard/maler/` ved M7.6-start
og brukes som visuell referanse.
**Designprinsipp F5:** designet beholdes i tråd med M6.3.

## 1. Hva M7.5 leverer

En **flak-forhåndsvisning** plassert i bunnen av dashboardet, og en
**"Last ned flak (.docx)"-knapp** like ved. Forhåndsvisningen er
ikke-redigerbar (per F1) - innholdet styres av dashboardets aktive
tilstand: valgt periode, valgt EU-fordeling og valgt valuta.

M7.6 leverer selve docx-genereringen klientside. M7.5 leverer kun
HTML-forhåndsvisningen og knappen som per nå **stubbes** med en
"Kommer i M7.6"-merknad inntil M7.6-implementasjonen er på plass.

## 2. Plassering

Flak-forhåndsvisningen legges som ny `section.graf` **nederst** i
hovedinnholdet, etter scatter plot og tidsserie. Begrunnelse: flaket
oppsummerer det brukerne nettopp har lest. Det matcher flytmønsteret
"først analyse, så eksport".

```
┌──────────────────────────────────────────────────────────────────┐
│ Hero-seksjon (KPI, brytere)                                      │
│ Komparativ blokk (filter + landprofil)                           │
│ Rangering (topp 15)                                              │
│ Tidsserie                                                        │
│ Scatter                                                          │
├──────────────────────────────────────────────────────────────────┤
│ ╔══════════════════════════════════════════════════════════════╗ │ ← ny
│ ║ Flak: Norges Ukraina-støtte                  [Last ned .docx]║ │
│ ║                                                              ║ │
│ ║ Tabell 1 (9 rader)                                           ║ │
│ ║ Figur 1, 2, 3 (sammendrag-thumbnails)                        ║ │
│ ║                                                              ║ │
│ ║ Forhåndsvisningen reflekterer dashboardets aktive tilstand.  ║ │
│ ║ Endringer i periode, EU eller valuta oppdaterer dette flaket.║ │
│ ╚══════════════════════════════════════════════════════════════╝ │
└──────────────────────────────────────────────────────────────────┘
```

## 3. Tabell 1 - antatte 9 rader (S20)

Per S20-beslutningen er tabellen låst til excel-malens struktur i første
versjon. Siden `flak-mal.docx` ikke er i repoet ennå (kommer i M7.6),
**antas** følgende 9 rader basert på fasitverdier og typiske flak-format
hos FIN. Disse må bekreftes mot malen før implementering:

| # | Målepunkt | Eksempel (Norge kumulativt EKSKL EU) |
|---|---|---|
| 1 | Total allokering (mrd. EUR / mrd. NOK) | 10,01 / 116,9 |
| 2 | Andel av BNP (pst.) | 2,45 |
| 3 | Per innbygger (EUR / NOK) | 1 796 / 20 982 |
| 4 | Rangering blant giverland | 10 av 42 |
| 5 | Total forpliktelse (mrd. EUR / mrd. NOK) | 24,72 / 288,7 |
| 6 | Militær allokering (mrd. EUR) | 6,19 |
| 7 | Finansiell allokering (mrd. EUR) | 2,03 |
| 8 | Humanitær allokering (mrd. EUR) | 1,78 |
| 9 | Endring siden forrige Kiel-utgivelse | (vises når release ≥ 2) |

Norske tallformat: komma som desimaltegn, ikke-brytende mellomrom som
tusenseparator, "pst." for prosent, "mrd. kroner" / "mrd. EUR" som enhet
(per M7-planen seksjon 5.7).

For enkeltår-tilstand viser tabellen samme 9 rader men med årsspesifikke
verdier (rad 9 utgår siden endring kun gir mening kumulativt).

For INKL EU-tilstand viser tabellen Norges tall uendret (Norge er ikke
EU-medlem). For andre land hadde tabellen vist INKL EU-totaler, men
flaket er per S20 og F1 **fokusert på Norge**.

## 4. Figur 1-3 - antatt innhold

Tre figurer som thumbnails i forhåndsvisningen, og som faktiske grafer
i docx-en (M7.6). Antakelser:

- **Figur 1 - Topp 15 giverland.** Horizontal stolpegraf på total
  allokering. Speiler dashboardets rangering-seksjon.
- **Figur 2 - Norge over tid.** Akkumulert tidsserie 2022→ for Norges
  total allokering. Speiler tidsseriegrafen.
- **Figur 3 - Andel BNP vs. per innbygger.** Scatter med Norge fremhevet.
  Speiler scatter-graf.

For enkeltår-tilstand erstattes figurene:

- Figur 1 - Topp 15 i året.
- Figur 2 - Norge i året, måned for måned.
- Figur 3 - Andel BNP × per innbygger i året.

Begrunnelse: flaket skal kunne stå alene som dokument, og de tre figurene
gir samme dekning som dashboardets hovedvisninger.

## 5. Knapp - "Last ned flak (.docx)"

Plassering: øverst til høyre i flak-seksjonens header, ved siden av
seksjonstittelen. Stil: primær-knapp-stil fra `tokens.css` (samme stil
som "Last ned PNG"-knappen i rangering).

I M7.5 er knappen disabled med tooltip "Kommer i M7.6" inntil M7.6 er
implementert. Det gjør det tydelig hva som er ferdig og hva som kommer.

Etter M7.6 vil knappen kalle `genererFlakDocx(state)` som returnerer
en Blob, og initierer en download med filnavn `Norges-Ukraina-stotte-{periode}-{dato}.docx`.

## 6. Tilstandskobling

Flaket reagerer på alle tre globale brytere:

| Bryter | Påvirkning |
|---|---|
| Valuta (EUR/NOK) | Tall i tabell 1 vises i valgt valuta. Figur 1 og 2 bruker valgt valuta som akseenhet. Figur 3 (scatter) er valuta-uavhengig. |
| Periode (kumulativt/2025/2026) | Tabell 1 viser års-spesifikke verdier ved enkeltår. Figurer skifter til års-spesifikke. |
| EU-fordeling (EKSKL/INKL) | Norge påvirkes ikke. Figur 1 (topp 15) endrer rekkefølge i INKL-modus. Tabell 1 forblir Norge-fokusert. |

Forhåndsvisningen oppdateres samtidig med resten av dashboardet (i samme
`tegn()`-kall).

## 7. Tilgjengelighet

- Tabell 1 markeres opp som `<table>` med `<caption>`, `<thead>`,
  `<tbody>`. Skjermlesere får meningsfull struktur.
- Figur-thumbnails har `alt`-tekst med kort norsk beskrivelse av hva
  grafen viser.
- Knappen har `aria-label="Last ned flak som Word-dokument"` og
  `aria-disabled="true"` i M7.5.

## 8. Implementeringsomfang (Steg 2)

Filer som endres:

- `src/dashboard/index.html` - ny `<section>` med id `flak-seksjon`,
  inneholder tabell-skall og figur-containere.
- `src/dashboard/dashboard.js` - ny `tegnFlakForhandsvisning()`-funksjon
  som kalles fra `tegn()`-loopen.
- `src/dashboard/styles.css` - styling for `.flak-seksjon`, `.flak-tabell`,
  `.flak-figurer`, `.flak-knapp-disabled`.

Estimat: M (1-2 dager). Tester verifiserer at tabellen rendres med riktige
verdier per tilstand og at figur-thumbnails-genererte Plotly-grafer
matcher hoved-grafene.

## 9. Spørsmål til prosjekteier før implementering

1. **Bekreftelse av tabell 1 sine 9 rader (seksjon 3).** Stemmer disse med
   FINs excel-mal, eller skal noen byttes ut? Hvis du har malen
   tilgjengelig nå, send gjerne over en kort liste av radene så jeg
   speiler dem eksakt. Hvis ikke kan vi gå videre med min antakelse og
   justere når malen kommer inn ved M7.6-start.
2. **Figur 1-3 (seksjon 4).** Speiler de aktuelle dashboard-grafene
   (rangering, tidsserie, scatter). Bekreft, eller foreslå andre tre.
3. **Knapp-tilstand i M7.5.** Stubbet med "Kommer i M7.6"-melding er
   tilrådning. Alternativ: skjul knappen helt til M7.6 - mindre rotete.
   Min tilrådning er stubbet siden brukerne får signal om hva som kommer.
4. **Plassering nederst.** Per seksjon 2 er flaket nederst i dashboardet.
   Alternativ: under komparativ profil (mer fremtredende). Min tilrådning
   er nederst siden det er en eksport-funksjon, ikke en analysefunksjon.

Implementering starter når disse fire er besvart.
