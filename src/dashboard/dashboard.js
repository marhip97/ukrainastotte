// Leser country_summary.csv og rendrer Norges nøkkeltall + topp-liste.
// Stien er konfigurerbar via window.DATA_PATH (brukes ved deploy).

const DATA_PATH = window.DATA_PATH || "../../data/processed/country_summary.csv";
const META_PATH = window.META_PATH || "../../data/processed/metadata.json";
const DISB_PATH = window.DISB_PATH || "../../data/processed/financial_disbursements.csv";
const REL_PATH = window.REL_PATH || "../../data/processed/country_summary_relative.csv";
const ENDR_PATH = window.ENDR_PATH || "../../data/processed/country_summary_endring.csv";
const TIDSSERIE_PATH = window.TIDSSERIE_PATH || "../../data/processed/tidsserier_maanedlig.csv";
const ENDRTEKST_PATH = window.ENDRTEKST_PATH || "../../data/processed/endringstekst.json";
const VALUTAKURSER_PATH = window.VALUTAKURSER_PATH || "../../data/reference/valutakurser.json";
// M7.4: nye CSV-er for INKL EU og enkeltår.
const EU_PATH = window.EU_PATH || "../../data/processed/country_summary_eu.csv";
const AAR_PATH = window.AAR_PATH || "../../data/processed/country_summary_aar.csv";

// Speiler src/analyze/landgrupper.py (S9). Aliaser inkludert for robusthet.
const LAND_GRUPPER = {
  Norden: ["Norway", "Sweden", "Denmark", "Finland", "Iceland"],
  EU: [
    "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
    "Czech Republic", "Denmark", "Estonia", "Finland", "France",
    "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia",
    "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland",
    "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden",
  ],
  G7: ["Canada", "France", "Germany", "Italy", "Japan", "United Kingdom", "United States"],
  NATO: [
    "Albania", "Belgium", "Bulgaria", "Canada", "Croatia", "Czechia",
    "Czech Republic", "Denmark", "Estonia", "Finland", "France",
    "Germany", "Greece", "Hungary", "Iceland", "Italy", "Latvia",
    "Lithuania", "Luxembourg", "Montenegro", "Netherlands",
    "North Macedonia", "Norway", "Poland", "Portugal", "Romania",
    "Slovakia", "Slovenia", "Spain", "Sweden", "Turkey", "Turkiye",
    "United Kingdom", "United States",
  ],
};

// S10-default for komparativ profil: Norge + Tyskland, Frankrike, Storbritannia.
const KOMPARATIV_DEFAULT = ["Norway", "Germany", "France", "United Kingdom"];

// Oversettelse fra Kiels engelske landsnavn til norsk visningsnavn.
// CSV-data beholder engelsk (data-koblingen krever det). Visningen
// (KPI, grafer, tooltips, kort) bruker norsk navn via norsk()-helperen.
const LAND_TIL_NORSK = {
  "Albania": "Albania",
  "Australia": "Australia",
  "Austria": "Østerrike",
  "Belgium": "Belgia",
  "Bulgaria": "Bulgaria",
  "Canada": "Canada",
  "China": "Kina",
  "Croatia": "Kroatia",
  "Cyprus": "Kypros",
  "Czechia": "Tsjekkia",
  "Czech Republic": "Tsjekkia",
  "Denmark": "Danmark",
  "Estonia": "Estland",
  "Finland": "Finland",
  "France": "Frankrike",
  "Germany": "Tyskland",
  "Greece": "Hellas",
  "Hungary": "Ungarn",
  "Iceland": "Island",
  "India": "India",
  "Ireland": "Irland",
  "Italy": "Italia",
  "Japan": "Japan",
  "Korea, Rep.": "Sør-Korea",
  "Latvia": "Latvia",
  "Lithuania": "Litauen",
  "Luxembourg": "Luxembourg",
  "Malta": "Malta",
  "Montenegro": "Montenegro",
  "Netherlands": "Nederland",
  "New Zealand": "New Zealand",
  "North Macedonia": "Nord-Makedonia",
  "Norway": "Norge",
  "Poland": "Polen",
  "Portugal": "Portugal",
  "Romania": "Romania",
  "Slovakia": "Slovakia",
  "Slovenia": "Slovenia",
  "South Korea": "Sør-Korea",
  "Spain": "Spania",
  "Sweden": "Sverige",
  "Switzerland": "Sveits",
  "Turkey": "Tyrkia",
  "Turkiye": "Tyrkia",
  "United Kingdom": "Storbritannia",
  "United States": "USA",
  "EU (Commission and Council)": "EU (Kommisjonen og Rådet)",
  "EU Institutions": "EU-institusjoner",
  "European Investment Bank": "Den europeiske investeringsbanken",
  "Taiwan": "Taiwan",
};

function norsk(land) {
  return LAND_TIL_NORSK[land] || land;
}

// Plotly-tema som speiler designtokens (M6.3 § 3.4.4). Leses fra
// :root via getComputedStyle slik at tokens.css er én sannhet.
function token(navn, fallback) {
  try {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(navn).trim();
    return v || fallback;
  } catch (e) {
    return fallback;
  }
}

function tema() {
  const fg = token("--neutral-900", "#1a1a1a");
  const muted = token("--neutral-600", "#555555");
  const grid = token("--neutral-200", "#e0e0e0");
  const accent = token("--blue-500", "#1d3557");
  const fontFamily = token("--font-sans",
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
  const akse = {
    gridcolor: grid,
    linecolor: grid,
    tickfont: { color: muted, family: fontFamily, size: 12 },
    title: { font: { color: muted, family: fontFamily, size: 13 } },
    zeroline: true,
    zerolinecolor: muted,
    zerolinewidth: 1,
  };
  return {
    font: { family: fontFamily, color: fg, size: 13 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    xaxis: { ...akse },
    yaxis: { ...akse },
    hoverlabel: {
      bgcolor: accent,
      bordercolor: accent,
      font: { color: "#ffffff", family: fontFamily, size: 12 },
    },
    margin: { t: 24, r: 16, b: 56, l: 64 },
  };
}

function flett(...lag) {
  // Dyp-flett av Plotly-layout (overrides etter tema()-defaults).
  const ut = {};
  for (const l of lag) {
    for (const k in l) {
      const v = l[k];
      if (v && typeof v === "object" && !Array.isArray(v) && ut[k] && typeof ut[k] === "object") {
        ut[k] = flett(ut[k], v);
      } else {
        ut[k] = v;
      }
    }
  }
  return ut;
}

function visFeil(tekst) {
  const el = document.getElementById("feilmelding");
  el.textContent = tekst;
  el.classList.remove("skjult");
}

function parseCsv(tekst) {
  // Pythons csv-modul skriver CRLF som linjeskift. Splitt på begge
  // varianter så siste kolonne ikke får et hengende \r-tegn.
  const linjer = tekst.trim().split(/\r?\n/);
  const header = linjer[0].split(",");
  return linjer.slice(1).map((linje) => {
    const verdier = linje.split(",");
    const rad = {};
    header.forEach((k, i) => {
      rad[k] = verdier[i];
    });
    return rad;
  });
}

// M7.4: state for periode-bryter og EU-bryter.
function lesPeriode() {
  const v = sessionStorage.getItem("m7_periode");
  if (v === "kumulativt" || /^\d{4}$/.test(v || "")) return v;
  const radio = document.querySelector('input[name="periode"]:checked');
  return radio ? radio.value : "kumulativt";
}

function lesEu() {
  if (lesPeriode() !== "kumulativt") return "ekskl";
  const v = sessionStorage.getItem("m7_eu");
  if (v === "ekskl" || v === "inkl") return v;
  const radio = document.querySelector('input[name="eu"]:checked');
  return radio ? radio.value : "ekskl";
}

function settPeriode(p) {
  sessionStorage.setItem("m7_periode", p);
}

function settEu(e) {
  sessionStorage.setItem("m7_eu", e);
}

/**
 * Returner aktivt summary-datasett basert på periode og EU-state.
 * Output har samme felter som country_summary.csv (`total_allocation`,
 * `financial_allocation`, etc.) slik at tegnXX-funksjonene kan brukes
 * uendret. For INKL EU mappes `total_allocation_inkl_eu` ned til
 * `total_allocation`. For enkeltår filtreres `aarRader` på året.
 */
function aktivSummary(kumRader, euRader, aarRader, periode, eu) {
  if (periode === "kumulativt") {
    if (eu === "inkl" && euRader.length > 0) {
      const euIdx = {};
      euRader.forEach((r) => { euIdx[r.land] = r; });
      return kumRader.map((r) => {
        const e = euIdx[r.land];
        if (!e) return r;
        return Object.assign({}, r, {
          total_allocation: e.total_allocation_inkl_eu,
          total_commitment: e.total_commitment_inkl_eu,
        });
      });
    }
    return kumRader;
  }
  // Enkeltår: filtrer aarRader. Returner objekter med felt som matcher
  // country_summary.csv-strukturen.
  return aarRader
    .filter((r) => String(r.aar) === String(periode))
    .map((r) => ({
      land: r.land,
      er_eu_medlem: "",  // ikke i aar-CSV
      er_geografisk_europa: "",
      financial_allocation: r.financial_allocation,
      humanitarian_allocation: r.humanitarian_allocation,
      military_allocation: r.military_allocation,
      total_allocation: r.total_allocation,
      financial_commitment: r.financial_commitment,
      humanitarian_commitment: r.humanitarian_commitment,
      military_commitment: r.military_commitment,
      total_commitment: r.total_commitment,
    }));
}

/**
 * Returner aktive relative tall (BNP-andel og per capita).
 * For kumulativt: country_summary_relative.csv.
 * For enkeltår: hentes fra aarRader (samme år) med felt
 * `andel_bnp_pct` og `per_capita_eur`.
 */
function aktivRelative(relRader, aarRader, periode) {
  if (periode === "kumulativt") {
    return relRader;
  }
  return aarRader
    .filter((r) => String(r.aar) === String(periode))
    .map((r) => ({
      land: r.land,
      total_allocation_eur_mrd: r.total_allocation,
      andel_bnp_pct: r.andel_bnp_pct,
      per_capita_eur: r.per_capita_eur,
      bnp_eur_mrd: "",
      folketall: "",
      referanseaar_bnp: "",
      referanseaar_folketall: "",
    }));
}

function periodeEtikett(periode) {
  if (periode === "kumulativt") return "kumulativt 2022-2026";
  return "i " + periode;
}

function lesValuta() {
  const valgt = document.querySelector('input[name="valuta"]:checked');
  return valgt ? valgt.value : "eur";
}

function lesKompModus() {
  const valgt = document.querySelector('input[name="komp-modus"]:checked');
  return valgt ? valgt.value : "enkeltland";
}

// Hvilke grupper som vises som gjennomsnitt-kort. Norge ekskluderes
// alltid fra gruppe-snittet selv om den er medlem - slik at Norge-
// kortet og gruppe-kortene gir en meningsfull sammenligning.
const GJENNOMSNITT_GRUPPER = ["Norden", "EU", "G7", "NATO"];

function gjennomsnitt(verdier) {
  const tall = verdier.filter((v) => Number.isFinite(v));
  if (tall.length === 0) return null;
  return tall.reduce((a, b) => a + b, 0) / tall.length;
}

function beregnGruppeProfil(gruppeNavn, alleLandISett, summaryIdx, relIdx, endrIdx) {
  const medlemmer = LAND_GRUPPER[gruppeNavn] || [];
  const land = [...new Set(
    medlemmer.filter((l) => l !== "Norway" && alleLandISett.has(l))
  )];
  if (land.length === 0) return null;

  const samle = (felt, hentVerdi) =>
    land.map((l) => hentVerdi(l, felt)).filter((v) => v !== null);

  const fraSummary = (l, felt) => {
    const r = summaryIdx[l];
    if (!r) return null;
    const v = parseFloat(r[felt]);
    return Number.isFinite(v) ? v : null;
  };
  const fraRel = (l, felt) => {
    const r = relIdx[l];
    if (!r || r[felt] === "" || r[felt] === undefined) return null;
    const v = parseFloat(r[felt]);
    return Number.isFinite(v) ? v : null;
  };
  const fraEndr = (l, felt) => {
    const r = endrIdx[l];
    if (!r) return null;
    const v = parseFloat(r[felt]);
    return Number.isFinite(v) ? v : null;
  };

  return {
    gruppe: gruppeNavn,
    antall: land.length,
    total_allocation: gjennomsnitt(samle("total_allocation", fraSummary)),
    total_commitment: gjennomsnitt(samle("total_commitment", fraSummary)),
    andel_bnp_pct: gjennomsnitt(samle("andel_bnp_pct", fraRel)),
    per_capita_eur: gjennomsnitt(samle("per_capita_eur", fraRel)),
    delta_total_allocation: gjennomsnitt(samle("delta_total_allocation", fraEndr)),
  };
}

// Returnerer siste tilgjengelige EUR/NOK-kurs fra valutakurser.json,
// eller en fornuftig fallback hvis filen mangler. Brukes til å
// approksimere NOK-verdier for delta-tall (endring siste release)
// der vi ikke har en presis NOK-versjon.
let SISTE_KURS = 11.5;
let SISTE_KURS_DATO = null;

function settSisteKurs(valutakurser) {
  if (!valutakurser || !valutakurser.kurser) return;
  const datoer = Object.keys(valutakurser.kurser).sort();
  if (datoer.length > 0) {
    const dato = datoer[datoer.length - 1];
    const k = parseFloat(valutakurser.kurser[dato]);
    if (Number.isFinite(k) && k > 0) {
      SISTE_KURS = k;
      SISTE_KURS_DATO = dato;
    }
  }
}

function oppdaterValutaMerknad(valuta) {
  const el = document.getElementById("valuta-kursmerknad");
  if (!el) return;
  if (valuta !== "nok") {
    el.textContent = "Styrer alle pengetall i dashboardet.";
    return;
  }
  const kurs = SISTE_KURS.toFixed(4).replace(".", ",");
  const datoTekst = SISTE_KURS_DATO || "ukjent dato";
  el.innerHTML =
    "Aggregerte tall (hero, fordeling, rangering, komparativ, scatter) "
    + "konverteres med EUR/NOK-kurs <strong>" + kurs + "</strong> "
    + "per <strong>" + datoTekst + "</strong> "
    + '(<a href="https://www.norges-bank.no/tema/Statistikk/valutakurser/" '
    + 'target="_blank" rel="noopener">Norges Bank</a>). '
    + "Tidsseriegrafen bruker historisk kurs på utbetalingsdato.";
}

// Format en EUR-mrd-verdi i valgt valuta. Tallet i argumentet er
// alltid i EUR (slik CSV-en lagrer det); konverteringen til NOK gjør
// vi her med siste tilgjengelige kurs som fallback.
function formaterMrd(eurMrd, valuta) {
  const v = valuta === "nok" ? eurMrd * SISTE_KURS : eurMrd;
  return v.toFixed(2);
}

function valutaKortNavn(valuta) {
  return valuta === "nok" ? "NOK" : "€";
}

function valutaMrdEnhet(valuta) {
  return valuta === "nok" ? "mrd NOK" : "€ mrd";
}

function tilTall(str) {
  const n = parseFloat(str);
  return Number.isFinite(n) ? n : 0;
}

function sortertEtter(rader, felt) {
  return [...rader].sort((a, b) => tilTall(b[felt]) - tilTall(a[felt]));
}

function sumPerGiver(disbRader) {
  const sum = {};
  for (const r of disbRader) {
    const v = tilTall(r.verdi_eur_mrd);
    sum[r.giver] = (sum[r.giver] || 0) + v;
  }
  return sum;
}

function indekser(relRader) {
  const idx = {};
  for (const r of relRader) {
    idx[r.land] = r;
  }
  return idx;
}

function rangMellomKomplette(rader, felt, land) {
  const med = rader.filter((r) => r[felt] !== "" && r[felt] !== undefined);
  const sortert = [...med].sort((a, b) => tilTall(b[felt]) - tilTall(a[felt]));
  const plass = sortert.findIndex((r) => r.land === land) + 1;
  return { plass, av: sortert.length };
}

function skrivNoekkeltall(norge, rader, relRader, endrRader, valuta) {
  const allocEur = tilTall(norge.total_allocation);
  const visAlloc = valuta === "nok" ? allocEur * SISTE_KURS : allocEur;
  document.getElementById("total-allocation").textContent = visAlloc.toFixed(2);
  document.getElementById("total-allocation-kontekst").textContent =
    valutaMrdEnhet(valuta) + ", kumulativt 2022-2026";

  const sortertAlloc = sortertEtter(rader, "total_allocation");
  const rangAlloc = sortertAlloc.findIndex((r) => r.land === "Norway") + 1;
  document.getElementById("rangering-alloc").textContent =
    rangAlloc + " / " + rader.length;

  const relIdx = indekser(relRader);
  const norgeRel = relIdx["Norway"];
  const enhetPerInn = valuta === "nok" ? "NOK" : "EUR";
  const skala = valuta === "nok" ? SISTE_KURS : 1;
  document.getElementById("per-capita-enhet").textContent = enhetPerInn;
  if (norgeRel) {
    document.getElementById("andel-bnp").textContent =
      tilTall(norgeRel.andel_bnp_pct).toFixed(2) + " %";
    const perCapEur = tilTall(norgeRel.per_capita_eur);
    document.getElementById("per-capita").textContent =
      Math.round(perCapEur * skala).toLocaleString("nb-NO");
    const rBnp = rangMellomKomplette(relRader, "andel_bnp_pct", "Norway");
    const rCap = rangMellomKomplette(relRader, "per_capita_eur", "Norway");
    document.getElementById("rangering-bnp").textContent = rBnp.plass + " / " + rBnp.av;
    document.getElementById("rangering-capita").textContent = rCap.plass + " / " + rCap.av;
  } else {
    document.getElementById("andel-bnp").textContent = "–";
    document.getElementById("per-capita").textContent = "–";
    document.getElementById("rangering-bnp").textContent = "–";
    document.getElementById("rangering-capita").textContent = "–";
  }

  const endrEl = document.getElementById("endring-siste");
  const endrCtx = document.getElementById("endring-siste-kontekst");
  if (endrRader.length === 0) {
    endrEl.textContent = "–";
    if (endrCtx) {
      endrCtx.textContent = "Vises når neste Kiel-utgivelse publiseres.";
    }
  } else {
    if (endrCtx) endrCtx.textContent = valutaMrdEnhet(valuta);
    const endrIdx = indekser(endrRader);
    const norgeEndr = endrIdx["Norway"];
    const dEur = norgeEndr ? tilTall(norgeEndr.delta_total_allocation) : 0;
    const d = valuta === "nok" ? dEur * SISTE_KURS : dEur;
    const tegn = d > 0 ? "+" : "";
    endrEl.textContent = tegn + d.toFixed(2);
  }
}

function tegnFordeling(norge, maal, norgeUtbetalt, norgeRel, norgeEndr, valuta) {
  const graf = document.getElementById("fordeling-graf");
  const enhet = valutaMrdEnhet(valuta);
  if (maal === "endring") {
    if (!norgeEndr) {
      Plotly.purge(graf);
      graf.innerHTML =
        '<p class="metode-notat">Kun én Kiel-release er lagret enda. '
        + 'Endringstall beregnes når neste release kommer (ukentlig henting).</p>';
      return;
    }
    const skala = valuta === "nok" ? SISTE_KURS : 1;
    Plotly.newPlot(
      graf,
      [
        {
          x: ["Militær", "Finansiell", "Humanitær"],
          y: [
            tilTall(norgeEndr.delta_military_allocation) * skala,
            tilTall(norgeEndr.delta_financial_allocation) * skala,
            tilTall(norgeEndr.delta_humanitarian_allocation) * skala,
          ],
          type: "bar",
          marker: {
            color: [
              token("--kategori-militaer", "#08306b"),
              token("--kategori-finansiell", "#2171b5"),
              token("--kategori-humanitaer", "#4292c6"),
            ],
          },
          hovertemplate: "<b>%{x}</b><br>Endring: %{y:,.3f} " + enhet + "<extra></extra>",
        },
      ],
      flett(tema(), {
        height: 320,
        yaxis: { title: "Endring (" + enhet + ")", zeroline: true },
      }),
      { displayModeBar: false, responsive: true }
    );
    return;
  }
  if (maal === "disbursement") {
    const verdi = valuta === "nok" ? norgeUtbetalt * SISTE_KURS : norgeUtbetalt;
    Plotly.newPlot(
      graf,
      [
        {
          x: ["Finansiell utbetaling (Norge)"],
          y: [verdi],
          type: "bar",
          marker: { color: token("--blue-500", "#1d3557") },
          text: [verdi.toFixed(3) + " " + enhet],
          textposition: "outside",
          hovertemplate:
            "<b>Norge</b><br>Finansiell utbetaling: %{y:,.3f} " + enhet + "<extra></extra>",
        },
      ],
      flett(tema(), {
        height: 300,
        yaxis: { title: enhet, rangemode: "tozero" },
        annotations: [
          {
            text: "Kun finansielle budget support-utbetalinger. Militær og humanitær ikke inkludert.",
            xref: "paper", yref: "paper", x: 0, y: 1.12, showarrow: false,
            font: { size: 11, color: token("--neutral-600", "#555") },
          },
        ],
      }),
      { displayModeBar: false, responsive: true }
    );
    return;
  }
  if (maal === "bnp" || maal === "capita") {
    const tittel = maal === "bnp" ? "Andel av BNP (Norge)" : "Per innbygger (Norge)";
    const perCapEnh = valuta === "nok" ? "NOK" : "EUR";
    const verdi = maal === "bnp"
      ? tilTall(norgeRel ? norgeRel.andel_bnp_pct : 0)
      : (tilTall(norgeRel ? norgeRel.per_capita_eur : 0)
         * (valuta === "nok" ? SISTE_KURS : 1));
    const tekst = maal === "bnp"
      ? verdi.toFixed(2) + " %"
      : Math.round(verdi).toLocaleString("nb-NO") + " " + perCapEnh;
    const aksetittel = maal === "bnp"
      ? "% av BNP (2024)"
      : perCapEnh + " per innbygger (2024)";
    Plotly.newPlot(
      graf,
      [
        {
          x: [tittel],
          y: [verdi],
          type: "bar",
          marker: { color: token("--blue-500", "#1d3557") },
          text: [tekst],
          textposition: "outside",
          hovertemplate: "<b>Norge</b><br>" + aksetittel + ": %{y:,.2f}<extra></extra>",
        },
      ],
      flett(tema(), {
        height: 300,
        yaxis: { title: aksetittel, rangemode: "tozero" },
      }),
      { displayModeBar: false, responsive: true }
    );
    return;
  }
  const prefiks = maal === "commitment" ? "commitment" : "allocation";
  const skala = valuta === "nok" ? SISTE_KURS : 1;
  const militaer   = tilTall(norge["military_"     + prefiks]) * skala;
  const finansiell = tilTall(norge["financial_"    + prefiks]) * skala;
  const humanitaer = tilTall(norge["humanitarian_" + prefiks]) * skala;
  const total = militaer + finansiell + humanitaer;
  const pct = (v) => total > 0 ? (100 * v / total).toFixed(0) + " %" : "–";
  // Tokens fra src/dashboard/tokens.css - hardkodet her i påvente av
  // tema()-funksjonen som innføres i M6.3 Steg 5.
  const KAT_MIL = "#08306b";  // var(--kategori-militaer)
  const KAT_FIN = "#2171b5";  // var(--kategori-finansiell)
  const KAT_HUM = "#4292c6";  // var(--kategori-humanitaer)
  const RAMME   = "#0b2545";  // var(--blue-900) - inter-segment ramme
  const trace = (navn, verdi, farge) => ({
    x: [verdi],
    y: ["Norge"],
    name: navn,
    type: "bar",
    orientation: "h",
    marker: { color: farge, line: { color: RAMME, width: 1 } },
    text: [pct(verdi)],
    textposition: "inside",
    insidetextanchor: "middle",
    hovertemplate:
      "<b>" + navn + "</b><br>" +
      "%{x:,.2f} " + enhet + " (" + pct(verdi) + ")<extra></extra>",
  });
  Plotly.newPlot(
    graf,
    [
      trace("Militær", militaer, KAT_MIL),
      trace("Finansiell", finansiell, KAT_FIN),
      trace("Humanitær", humanitaer, KAT_HUM),
    ],
    flett(tema(), {
      barmode: "stack",
      height: 180,
      xaxis: { title: enhet, rangemode: "tozero" },
      yaxis: { showticklabels: false, fixedrange: true },
      showlegend: true,
      legend: { orientation: "h", y: -0.6 },
    }),
    { displayModeBar: false, responsive: true }
  );
}

function beregnRangeringVerdier(rader, maal, disbSum, relRader, endrRader, valuta) {
  let verdier;
  let xTittel;
  const enhet = valutaMrdEnhet(valuta);
  const skala = valuta === "nok" ? SISTE_KURS : 1;
  if (maal === "disbursement") {
    verdier = Object.keys(disbSum)
      .map((land) => ({ land, sum: disbSum[land] * skala }))
      .sort((a, b) => b.sum - a.sum);
    xTittel = enhet;
  } else if (maal === "endring") {
    verdier = endrRader
      .map((r) => ({ land: r.land, sum: tilTall(r.delta_total_allocation) * skala }))
      .sort((a, b) => b.sum - a.sum);
    xTittel = "Endring i total allokering (" + enhet + ")";
  } else if (maal === "bnp" || maal === "capita") {
    const felt = maal === "bnp" ? "andel_bnp_pct" : "per_capita_eur";
    const skala2 = (maal === "capita" && valuta === "nok") ? SISTE_KURS : 1;
    verdier = relRader
      .filter((r) => r[felt] !== "" && r[felt] !== undefined)
      .map((r) => ({ land: r.land, sum: tilTall(r[felt]) * skala2 }))
      .sort((a, b) => b.sum - a.sum);
    xTittel = maal === "bnp"
      ? "% av BNP (2024)"
      : (valuta === "nok" ? "NOK" : "EUR") + " per innbygger (2024)";
  } else {
    const felt = maal === "commitment" ? "total_commitment" : "total_allocation";
    verdier = sortertEtter(rader, felt).map((r) => ({
      land: r.land,
      sum: tilTall(r[felt]) * skala,
    }));
    xTittel = enhet;
  }
  return { verdier, xTittel };
}

function rangeringSeksjonsTittel(maal) {
  if (maal === "disbursement") return "Topp 15 - kun finansielt utbetalt";
  if (maal === "endring") return "Topp 15 - endring siden forrige Kiel-utgivelse";
  if (maal === "bnp") return "Topp 15 - andel av BNP";
  if (maal === "capita") return "Topp 15 - per innbygger";
  if (maal === "commitment") return "Topp 15 giverland - total forpliktelse";
  return "Topp 15 giverland - total allokering";
}

function tegnRangering(rader, maal, disbSum, relRader, endrRader, valgteLand, valuta) {
  const { verdier, xTittel } = beregnRangeringVerdier(
    rader, maal, disbSum, relRader, endrRader, valuta
  );
  const topp = verdier.slice(0, 15);
  const norgeFarge = token("--blue-500", "#1d3557");
  const andreFarge = token("--blue-300", "#5d8aaa");
  const stripeFarge = token("--blue-50", "#eef2f7");
  // Kun Norge får mørkeblått; alle andre land bruker den dempede
  // sammenligningsfargen, også de som er valgt i komparativ profil.
  const farger = topp.map((v) =>
    v.land === "Norway" ? norgeFarge : andreFarge
  );
  // Norge-bakgrunnsstripe (M6.3 § 3.3.3) - kun hvis Norge er i topp 15.
  const norgeIdxTopp = topp.findIndex((v) => v.land === "Norway");
  const shapes = [];
  if (norgeIdxTopp >= 0) {
    shapes.push({
      type: "rect",
      xref: "paper",
      yref: "y",
      x0: 0,
      x1: 1,
      y0: norgeIdxTopp - 0.45,
      y1: norgeIdxTopp + 0.45,
      fillcolor: stripeFarge,
      line: { width: 0 },
      layer: "below",
    });
  }
  Plotly.newPlot(
    "rangering-graf",
    [
      {
        x: topp.map((v) => v.sum),
        y: topp.map((v) => norsk(v.land)),
        type: "bar",
        orientation: "h",
        marker: { color: farger },
        hovertemplate: "<b>%{y}</b><br>" + xTittel + ": %{x:,.2f}<extra></extra>",
      },
    ],
    flett(tema(), {
      margin: { l: 140 },
      height: 420,
      xaxis: { title: xTittel },
      yaxis: { autorange: "reversed" },
      shapes: shapes,
    }),
    { displayModeBar: false, responsive: true }
  );
  const rang = verdier.findIndex((v) => v.land === "Norway") + 1;
  const antall = verdier.length;
  let nevner;
  if (maal === "disbursement") nevner = " land med rapporterte utbetalinger";
  else if (maal === "bnp" || maal === "capita") nevner = " land med WDI-data";
  else if (maal === "endring") nevner = " giverland (endring siden forrige release)";
  else nevner = " giverland";
  const tekst = antall === 0
    ? "Ingen endringsdata tilgjengelig ennå - kun én Kiel-release er lagret."
    : rang > 0
      ? `Norge er på ${rang}. plass av ${antall}${nevner}.`
      : `Norge er ikke i datasettet for denne visningen.`;
  document.getElementById("norge-plassering").textContent = tekst;
}

function landFraGruppe(gruppe, alleLand) {
  if (gruppe === "default") return [...KOMPARATIV_DEFAULT];
  if (gruppe === "Alle") return [...alleLand];
  const liste = LAND_GRUPPER[gruppe] || [];
  const sett = new Set(alleLand);
  return liste.filter((l) => sett.has(l));
}

// Tilstand for land-velgeren. _alleLand holder hele listen, _valgte er
// en Set med valgte engelske landsnavn (samme som CSV-en bruker).
let _alleLand = [];
let _valgte = new Set();

function fyllKomparativVelger(alleLand, valgte) {
  _alleLand = alleLand.slice();
  _valgte = new Set(valgte || []);
  rendreLandListe(document.getElementById("land-velger-sok").value || "");
  oppdaterAntallEtikett();
}

function rendreLandListe(filter) {
  const liste = document.getElementById("land-velger-liste");
  if (!liste) return;
  const f = (filter || "").toLowerCase().trim();
  liste.innerHTML = "";
  let synlige = 0;
  for (const land of _alleLand) {
    const navn = norsk(land);
    if (f && !navn.toLowerCase().includes(f)) continue;
    synlige++;
    const erValgt = _valgte.has(land);
    const rad = document.createElement("label");
    rad.className = "land-velger-rad" + (erValgt ? " valgt" : "");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = land;
    input.checked = erValgt;
    input.addEventListener("change", (e) => {
      if (e.target.checked) _valgte.add(land);
      else _valgte.delete(land);
      rad.classList.toggle("valgt", e.target.checked);
      oppdaterAntallEtikett();
      if (typeof window.__landValgtCallback === "function") {
        window.__landValgtCallback();
      }
    });
    const span = document.createElement("span");
    span.textContent = navn;
    rad.appendChild(input);
    rad.appendChild(span);
    liste.appendChild(rad);
  }
  if (synlige === 0) {
    const tom = document.createElement("div");
    tom.className = "land-velger-tom-melding";
    tom.textContent = f ? "Ingen treff for \"" + filter + "\"." : "Ingen land i listen.";
    liste.appendChild(tom);
  }
}

function oppdaterAntallEtikett() {
  const el = document.getElementById("land-velger-antall");
  const n = _valgte.size;
  const tekst = n === 0 ? "Ingen valgt"
    : n === 1 ? "1 valgt"
    : n + " valgte";
  if (el) el.textContent = tekst;
  oppdaterRullgardinStatus();
}

function oppdaterRullgardinStatus() {
  const status = document.getElementById("filter-rullgardin-status");
  if (!status) return;
  const modus = lesKompModus();
  if (modus === "gjennomsnitt") {
    status.textContent = "Gruppegjennomsnitt";
    return;
  }
  const n = _valgte.size;
  status.textContent = n === 0 ? "Ingen land valgt"
    : n === 1 ? "1 land valgt"
    : n + " land valgt";
}

function lesValgteLand() {
  return Array.from(_valgte);
}

function lagKomparativKort(opts) {
  const { tittel, fokus, rader2 } = opts;
  const kort = document.createElement("article");
  kort.className = "komparativ-kort" + (fokus ? " fokus" : "");
  const overskrift = document.createElement("h3");
  overskrift.textContent = tittel;
  kort.appendChild(overskrift);
  const dl = document.createElement("dl");
  for (const [navn, verdi] of rader2) {
    const dt = document.createElement("dt");
    dt.textContent = navn;
    const dd = document.createElement("dd");
    dd.textContent = verdi;
    dl.appendChild(dt);
    dl.appendChild(dd);
  }
  kort.appendChild(dl);
  return kort;
}

function tegnKomparativProfil(rader, valgteLand, relRader, endrRader, valuta, modus) {
  const grid = document.getElementById("komparativ-grid");
  grid.innerHTML = "";
  const summaryIdx = indekser(rader);
  const relIdx = indekser(relRader);
  const endrIdx = indekser(endrRader);
  const sortertAlloc = sortertEtter(rader, "total_allocation");
  const rangAlloc = {};
  sortertAlloc.forEach((r, i) => { rangAlloc[r.land] = i + 1; });
  const enhet = valutaMrdEnhet(valuta);
  const skala = valuta === "nok" ? SISTE_KURS : 1;

  if (modus === "gjennomsnitt") {
    // Norge-kort først
    const norgeSummary = summaryIdx["Norway"];
    if (norgeSummary) {
      const norgeRel = relIdx["Norway"];
      const norgeEndr = endrIdx["Norway"];
      const allocN = tilTall(norgeSummary.total_allocation) * skala;
      const commN = tilTall(norgeSummary.total_commitment) * skala;
      const deltaN = norgeEndr ? tilTall(norgeEndr.delta_total_allocation) * skala : null;
      grid.appendChild(lagKomparativKort({
        tittel: "Norge",
        fokus: true,
        rader2: [
          ["Total allokering", allocN.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "\u00A0" + enhet],
          ["Total forpliktelse", commN.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "\u00A0" + enhet],
          ["Andel av BNP",
            norgeRel && norgeRel.andel_bnp_pct !== ""
              ? tilTall(norgeRel.andel_bnp_pct).toFixed(2) + " %" : "–"],
          ["Per innbygger",
            norgeRel && norgeRel.per_capita_eur !== ""
              ? Math.round(tilTall(norgeRel.per_capita_eur) * skala).toLocaleString("nb-NO")
                + " " + (valuta === "nok" ? "NOK" : "EUR")
              : "–"],
          ["Endring siste release",
            deltaN === null ? "–"
              : (deltaN >= 0 ? "+" : "") + deltaN.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "\u00A0" + enhet],
        ],
      }));
    }

    // Gruppegjennomsnitt-kort
    const alleLandISett = new Set(rader.map((r) => r.land));
    for (const gruppe of GJENNOMSNITT_GRUPPER) {
      const profil = beregnGruppeProfil(gruppe, alleLandISett, summaryIdx, relIdx, endrIdx);
      if (!profil) continue;
      const allocG = profil.total_allocation === null ? null : profil.total_allocation * skala;
      const commG = profil.total_commitment === null ? null : profil.total_commitment * skala;
      const deltaG = profil.delta_total_allocation === null ? null
        : profil.delta_total_allocation * skala;
      grid.appendChild(lagKomparativKort({
        tittel: gruppe + " (snitt, " + profil.antall + " land)",
        fokus: false,
        rader2: [
          ["Total allokering",
            allocG === null ? "–" : allocG.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "\u00A0" + enhet],
          ["Total forpliktelse",
            commG === null ? "–" : commG.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "\u00A0" + enhet],
          ["Andel av BNP",
            profil.andel_bnp_pct === null ? "–"
              : profil.andel_bnp_pct.toFixed(2) + " %"],
          ["Per innbygger",
            profil.per_capita_eur === null ? "–"
              : Math.round(profil.per_capita_eur * skala).toLocaleString("nb-NO")
                + " " + (valuta === "nok" ? "NOK" : "EUR")],
          ["Endring siste release",
            deltaG === null ? "–"
              : (deltaG >= 0 ? "+" : "") + deltaG.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "\u00A0" + enhet],
        ],
      }));
    }
    if (grid.children.length === 0) {
      grid.innerHTML = '<p class="metode-notat">Ingen gruppe-data tilgjengelig.</p>';
    }
    return;
  }

  for (const land of valgteLand) {
    const summary = summaryIdx[land];
    if (!summary) continue;
    const rel = relIdx[land];
    const endr = endrIdx[land];

    const allocVerdi = tilTall(summary.total_allocation) * skala;
    const commVerdi = tilTall(summary.total_commitment) * skala;
    const deltaEur = endr ? tilTall(endr.delta_total_allocation) : null;
    const deltaVerdi = deltaEur === null ? null : deltaEur * skala;

    const rBnp = rel ? rangMellomKomplette(relRader, "andel_bnp_pct", land) : null;
    const rCap = rel ? rangMellomKomplette(relRader, "per_capita_eur", land) : null;

    const kort = document.createElement("article");
    kort.className = "komparativ-kort" + (land === "Norway" ? " fokus" : "");
    const overskrift = document.createElement("h3");
    overskrift.textContent = norsk(land);
    kort.appendChild(overskrift);

    const dl = document.createElement("dl");
    const rader2 = [
      ["Total allokering", allocVerdi.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "\u00A0" + enhet],
      ["Total forpliktelse", commVerdi.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "\u00A0" + enhet],
      [
        "Andel av BNP",
        rel && rel.andel_bnp_pct !== ""
          ? tilTall(rel.andel_bnp_pct).toFixed(2) + " %"
          : "–",
      ],
      [
        "Per innbygger",
        rel && rel.per_capita_eur !== ""
          ? Math.round(tilTall(rel.per_capita_eur) * skala).toLocaleString("nb-NO")
            + " " + (valuta === "nok" ? "NOK" : "EUR")
          : "–",
      ],
      ["Rangering allokering", rangAlloc[land] + " av " + rader.length],
      ["Rangering BNP-andel", rBnp ? rBnp.plass + " av " + rBnp.av : "–"],
      ["Rangering per capita", rCap ? rCap.plass + " av " + rCap.av : "–"],
      [
        "Endring siden forrige release",
        deltaVerdi === null
          ? "–"
          : (deltaVerdi >= 0 ? "+" : "") + deltaVerdi.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "\u00A0" + enhet,
      ],
    ];
    for (const [navn, verdi] of rader2) {
      const dt = document.createElement("dt");
      dt.textContent = navn;
      const dd = document.createElement("dd");
      dd.textContent = verdi;
      dl.appendChild(dt);
      dl.appendChild(dd);
    }
    kort.appendChild(dl);
    grid.appendChild(kort);
  }
  if (grid.children.length === 0) {
    grid.innerHTML = '<p class="metode-notat">Ingen land valgt.</p>';
  }
}

function maanedsLabel(aar, maaned) {
  const m = String(maaned).padStart(2, "0");
  return aar + "-" + m;
}

function filtrerTidsserie(rader, valgteLand, kategori, maal) {
  return rader.filter((r) => {
    if (!valgteLand.includes(r.land)) return false;
    if (r.maal !== maal) return false;
    if (kategori !== "Total" && r.kategori !== kategori) return false;
    return true;
  });
}

function aggregerPerMaaned(rader, valutaFelt) {
  const sum = {};
  for (const r of rader) {
    const nokkel = r.land + "|" + r.aar + "|" + String(r.maaned).padStart(2, "0");
    sum[nokkel] = (sum[nokkel] || 0) + tilTall(r[valutaFelt]);
  }
  return sum;
}

function byggTidsserieTabell(traces, maaneder, valutaTekst, modus) {
  const tabell = document.getElementById("tidsserie-tabell");
  if (!tabell) return;
  const valuTittel = modus === "akkumulert"
    ? "Akkumulert (" + valutaTekst + ")"
    : "Per måned (" + valutaTekst + ")";
  let html = "<caption>Tidsseriedata - " + valuTittel + "</caption>";
  html += "<thead><tr><th scope=\"col\">Måned</th>";
  for (const t of traces) {
    html += "<th scope=\"col\">" + t.name + "</th>";
  }
  html += "</tr></thead><tbody>";
  for (let i = 0; i < maaneder.length; i++) {
    html += "<tr><th scope=\"row\">" + maaneder[i] + "</th>";
    for (const t of traces) {
      const v = t.y[i];
      html += "<td>" + (typeof v === "number" ? v.toFixed(3) : "–") + "</td>";
    }
    html += "</tr>";
  }
  html += "</tbody>";
  tabell.innerHTML = html;
}

function tegnTidsserie(rader, valgteLand, valuta) {
  const modus = document.getElementById("tidsserie-modus").value;
  // Tidsserien viser kun Allokering. Forpliktelse er ikke tilgjengelig
  // på månedsnivå (Kiel rapporterer commitments aggregert per land,
  // ikke som datostemplede sub-aktiviteter). Total forpliktelse vises
  // i hero-seksjonen og komparativ profil i stedet.
  const maal = "Allocation";
  const kategori = document.getElementById("tidsserie-kategori").value;
  const valutaFelt = valuta === "nok" ? "sum_nok" : "sum_eur";
  const valutaTekst = valuta === "nok" ? "NOK" : "EUR";

  const filtrert = filtrerTidsserie(rader, valgteLand, kategori, maal);
  const sum = aggregerPerMaaned(filtrert, valutaFelt);

  const alleMaaneder = new Set();
  for (const n of Object.keys(sum)) {
    const [, aar, m] = n.split("|");
    alleMaaneder.add(aar + "-" + m);
  }
  const sortertMaaneder = [...alleMaaneder].sort();

  const traces = [];
  for (const land of valgteLand) {
    const rad = sortertMaaneder.map((dato) => {
      const [aar, m] = dato.split("-");
      const nokkel = land + "|" + aar + "|" + m;
      return sum[nokkel] || 0;
    });
    let yVerdier = rad;
    if (modus === "akkumulert") {
      let kumulativ = 0;
      yVerdier = rad.map((v) => (kumulativ += v));
    }
    const erNorge = land === "Norway";
    traces.push({
      x: sortertMaaneder,
      y: yVerdier,
      name: norsk(land),
      type: modus === "akkumulert" ? "scatter" : "bar",
      mode: modus === "akkumulert" ? "lines+markers" : undefined,
      line: erNorge
        ? { color: token("--blue-500", "#1d3557"), width: 3 }
        : { color: token("--blue-300", "#5d8aaa"), width: 1.5 },
      marker: erNorge
        ? { color: token("--blue-500", "#1d3557") }
        : { color: token("--blue-300", "#5d8aaa") },
      hovertemplate:
        "<b>%{fullData.name}</b><br>"
        + "Måned: %{x}<br>"
        + (modus === "akkumulert" ? "Akkumulert: " : "Måned: ")
        + "%{y:,.3f} " + valutaTekst + "<extra></extra>",
    });
  }

  const yTittel = modus === "akkumulert"
    ? "Akkumulert (" + valutaTekst + ")"
    : "Per måned (" + valutaTekst + ")";
  byggTidsserieTabell(traces, sortertMaaneder, valutaTekst, modus);
  Plotly.newPlot(
    "tidsserie-graf",
    traces,
    flett(tema(), {
      height: 420,
      xaxis: { title: "Måned" },
      yaxis: { title: yTittel, rangemode: "tozero" },
      hovermode: modus === "akkumulert" ? "x unified" : "closest",
      barmode: "group",
      legend: { orientation: "h", y: -0.2 },
    }),
    { displayModeBar: false, responsive: true }
  );
}

function tegnScatter(rader, relRader, valgteLand, valuta) {
  const xFelt = document.getElementById("scatter-x").value;
  const yFelt = document.getElementById("scatter-y").value;
  const summaryIdx = indekser(rader);
  const enhet = valutaMrdEnhet(valuta);
  const skala = valuta === "nok" ? SISTE_KURS : 1;

  function hentVerdi(land, felt) {
    if (felt === "andel_bnp_pct" || felt === "per_capita_eur") {
      const r = relRader.find((x) => x.land === land);
      if (!r) return null;
      const v = r[felt];
      if (v === "" || v === undefined) return null;
      const tall = tilTall(v);
      if (felt === "per_capita_eur" && valuta === "nok") {
        return tall * SISTE_KURS;
      }
      return tall;
    }
    const r = summaryIdx[land];
    if (!r) return null;
    if (felt === "total_allocation" || felt === "total_commitment") {
      return tilTall(r[felt]) * skala;
    }
    return tilTall(r[felt]);
  }

  function aksetekst(felt) {
    if (felt === "andel_bnp_pct") return "Andel av BNP (%)";
    if (felt === "per_capita_eur") return "Per innbygger (" + (valuta === "nok" ? "NOK" : "EUR") + ")";
    if (felt === "total_allocation") return "Total allokering (" + enhet + ")";
    if (felt === "total_commitment") return "Total forpliktelse (" + enhet + ")";
    return felt;
  }

  const land = rader.map((r) => r.land);
  const xVerdier = land.map((l) => hentVerdi(l, xFelt));
  const yVerdier = land.map((l) => hentVerdi(l, yFelt));
  const filtrert = land
    .map((l, i) => ({ land: l, x: xVerdier[i], y: yVerdier[i] }))
    .filter((p) => p.x !== null && p.y !== null);

  const valgte = new Set(valgteLand || []);
  // Norge er alltid framhevet, skilles ut som egen trace.
  const norge = filtrert.find((p) => p.land === "Norway");
  const fremhevet = filtrert.filter((p) =>
    p.land !== "Norway" && valgte.has(p.land)
  );
  const andre = filtrert.filter((p) =>
    p.land !== "Norway" && !valgte.has(p.land)
  );

  const traces = [
    {
      x: andre.map((p) => p.x),
      y: andre.map((p) => p.y),
      text: andre.map((p) => norsk(p.land)),
      mode: "markers",
      type: "scatter",
      name: "Andre giverland",
      marker: { color: token("--blue-300", "#5d8aaa"), size: 9 },
      hovertemplate:
        "<b>%{text}</b><br>"
        + aksetekst(xFelt) + ": %{x:,.2f}<br>"
        + aksetekst(yFelt) + ": %{y:,.2f}<extra></extra>",
    },
  ];
  if (fremhevet.length > 0) {
    traces.push({
      x: fremhevet.map((p) => p.x),
      y: fremhevet.map((p) => p.y),
      text: fremhevet.map((p) => norsk(p.land)),
      mode: "markers+text",
      type: "scatter",
      name: "Valgte sammenligningsland",
      marker: {
        color: token("--blue-500", "#1d3557"),
        size: 12,
        symbol: "circle",
      },
      textposition: "top center",
      textfont: { size: 12, color: token("--blue-700", "#13315c") },
      hovertemplate:
        "<b>%{text}</b><br>"
        + aksetekst(xFelt) + ": %{x:,.2f}<br>"
        + aksetekst(yFelt) + ": %{y:,.2f}<extra></extra>",
    });
  }
  if (norge) {
    traces.push({
      x: [norge.x],
      y: [norge.y],
      text: ["Norge"],
      mode: "markers+text",
      type: "scatter",
      name: "Norge",
      marker: {
        color: token("--blue-500", "#1d3557"),
        size: 16,
        symbol: "circle",
        line: { color: token("--blue-900", "#0b2545"), width: 2 },
      },
      textposition: "top center",
      textfont: { size: 13, color: token("--blue-900", "#0b2545"), family: token("--font-sans", "sans-serif") },
      hovertemplate:
        "<b>Norge</b><br>"
        + aksetekst(xFelt) + ": %{x:,.2f}<br>"
        + aksetekst(yFelt) + ": %{y:,.2f}<extra></extra>",
    });
  }

  Plotly.newPlot(
    "scatter-graf",
    traces,
    flett(tema(), {
      height: 420,
      xaxis: { title: aksetekst(xFelt), rangemode: "tozero" },
      yaxis: { title: aksetekst(yFelt), rangemode: "tozero" },
      hovermode: "closest",
      legend: { orientation: "h", y: -0.2 },
    }),
    { displayModeBar: false, responsive: true }
  );
}

// Eksportlenker bygges fra de samme stiene som dashboardet leser data
// fra. På Netlify peker disse til ./data/, lokalt til ../../data/processed/.
const EKSPORT_FILER = [
  ["country_summary.csv", "Aggregat per land", () => DATA_PATH],
  ["country_summary_relative.csv", "Andel av BNP og per innbygger", () => REL_PATH],
  ["country_summary_endring.csv", "Endring siden forrige Kiel-utgave", () => ENDR_PATH],
  ["country_summary_nok.csv", "Aggregat per land i NOK", () => (window.NOK_PATH || "../../data/processed/country_summary_nok.csv")],
  ["bilateral_activities.csv", "Alle aktiviteter (langformat, sub-aktivitet)", () => (window.BILATERAL_PATH || "../../data/processed/bilateral_activities.csv")],
  ["financial_disbursements.csv", "Månedlige finansielle utbetalinger", () => DISB_PATH],
  ["tidsserier_maanedlig.csv", "Månedlige aggregater (EUR og NOK)", () => TIDSSERIE_PATH],
  ["endringstekst.json", "Automatisk generert endringstekst", () => ENDRTEKST_PATH],
  ["metadata.json", "Metadata: kildefil, sha256, prosesseringsdato", () => META_PATH],
];

// M7.5: Flak-forhåndsvisning. Tabell 1 har 9 rader per S20. Rad 9
// (endring) vises kun kumulativt; ved enkeltår erstattes den med
// årsmerknad. Knappen for nedlasting stubbes inntil M7.6 er ferdig.
function tegnFlakForhandsvisning(opts) {
  const {
    norgeAktiv, norgeRelAktiv, norgeEndr,
    aktiveRader, periode, eu, valuta,
  } = opts;
  const body = document.getElementById("flak-tabell-body");
  const tilstandEl = document.getElementById("flak-tilstand");
  const figur1 = document.getElementById("flak-figur-1");
  const figur2 = document.getElementById("flak-figur-2");
  const figur3 = document.getElementById("flak-figur-3");
  if (!body) return;

  const skala = valuta === "nok" ? SISTE_KURS : 1;
  const valutaNavn = valutaKortNavn(valuta);
  const mrdEnhet = "mrd. " + valutaNavn;
  const periodeBesk = periode === "kumulativt"
    ? "kumulativt 2022-2026"
    : "kalenderåret " + periode;
  const euBesk = (periode === "kumulativt" && eu === "inkl")
    ? "inkludert EU-fordeling"
    : "direkte bilateral (uten EU-fordeling)";
  tilstandEl.textContent =
    "Reflekterer dashboardets aktive tilstand: "
    + periodeBesk + ", " + euBesk + ", verdier i " + valutaNavn + ".";

  const allocEur = tilTall(norgeAktiv.total_allocation);
  const commEur = tilTall(norgeAktiv.total_commitment);
  const milEur = tilTall(norgeAktiv.military_allocation);
  const finEur = tilTall(norgeAktiv.financial_allocation);
  const humEur = tilTall(norgeAktiv.humanitarian_allocation);

  // Rangering: Norges plass i aktiveRader sortert på total_allocation.
  const sortert = sortertEtter(aktiveRader, "total_allocation");
  const rangAlloc = sortert.findIndex((r) => r.land === "Norway") + 1;
  const antall = aktiveRader.length;

  function f(v, des) {
    const tall = (Number(v) || 0) * skala;
    return tall.toLocaleString("nb-NO", {
      minimumFractionDigits: des,
      maximumFractionDigits: des,
    });
  }

  const rader = [
    ["Total allokering", f(allocEur, 2) + " " + mrdEnhet],
    [
      "Andel av BNP",
      norgeRelAktiv && norgeRelAktiv.andel_bnp_pct !== "" && norgeRelAktiv.andel_bnp_pct != null
        ? f(tilTall(norgeRelAktiv.andel_bnp_pct), 2) + " pst."
        : "–",
    ],
    [
      "Per innbygger",
      norgeRelAktiv && norgeRelAktiv.per_capita_eur !== "" && norgeRelAktiv.per_capita_eur != null
        ? Math.round(tilTall(norgeRelAktiv.per_capita_eur) * skala)
            .toLocaleString("nb-NO") + " " + valutaNavn
        : "–",
    ],
    ["Rangering (total allokering)", rangAlloc + " av " + antall],
    ["Total forpliktelse", f(commEur, 2) + " " + mrdEnhet],
    ["Militær allokering", f(milEur, 2) + " " + mrdEnhet],
    ["Finansiell allokering", f(finEur, 2) + " " + mrdEnhet],
    ["Humanitær allokering", f(humEur, 2) + " " + mrdEnhet],
  ];
  // Rad 9 - endring siste release (kun meningsfullt kumulativt).
  if (periode === "kumulativt" && norgeEndr) {
    const dEur = tilTall(norgeEndr.delta_total_allocation);
    const d = dEur * skala;
    const tegn = d > 0 ? "+" : "";
    rader.push(["Endring siste Kiel-utgivelse", tegn + d.toFixed(2) + " " + mrdEnhet]);
  } else if (periode === "kumulativt") {
    rader.push(["Endring siste Kiel-utgivelse", "Vises etter neste release"]);
  } else {
    rader.push(["Endring siste Kiel-utgivelse", "Kun kumulativt"]);
  }

  body.innerHTML = rader.map(([etikett, verdi]) =>
    '<tr><th scope="row">' + etikett + '</th><td>' + verdi + '</td></tr>'
  ).join("");

  // Figur-etiketter speiler aktive tilstand.
  if (figur1 && figur2 && figur3) {
    if (periode === "kumulativt") {
      figur1.textContent = "Topp 15 giverland - total allokering"
        + (eu === "inkl" ? " (inkl. EU-fordeling)" : "");
      figur2.textContent = "Norge over tid - akkumulert allokering 2022-d.d.";
      figur3.textContent = "Andel av BNP vs. per innbygger (alle giverland)";
    } else {
      figur1.textContent = "Topp 15 giverland - total allokering i " + periode;
      figur2.textContent = "Norge - månedlig allokering i " + periode;
      figur3.textContent = "Andel av BNP vs. per innbygger i " + periode;
    }
  }
}

// M7.6: docx-generering klientside. Bruker `docx`-pakken lastet via CDN
// (UMD-build, eksponerer `docx` globalt). Strukturen i Word-filen bygges
// fra grunnen i kode jf. M7-plan seksjon 5.7. Norsk tallformat:
// komma som desimaltegn, ikke-brytende mellomrom som tusenseparator,
// "pst." for prosent, "mrd. EUR" / "mrd. NOK" for milliarder.
function _formaterMrd(eurMrd, valuta) {
  const skala = valuta === "nok" ? SISTE_KURS : 1;
  const tall = (Number(eurMrd) || 0) * skala;
  return tall.toLocaleString("nb-NO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function _formaterPerCapita(eur, valuta) {
  const skala = valuta === "nok" ? SISTE_KURS : 1;
  const tall = Math.round((Number(eur) || 0) * skala);
  return tall.toLocaleString("nb-NO");
}

function _bygFlakRader(opts) {
  const { norgeAktiv, norgeRelAktiv, norgeEndr, aktiveRader, periode, valuta } = opts;
  const valutaNavn = valutaKortNavn(valuta);
  const mrdEnhet = "mrd. " + valutaNavn;
  const sortert = sortertEtter(aktiveRader, "total_allocation");
  const rangAlloc = sortert.findIndex((r) => r.land === "Norway") + 1;
  const rader = [
    ["Total allokering", _formaterMrd(norgeAktiv.total_allocation, valuta) + " " + mrdEnhet],
    [
      "Andel av BNP",
      norgeRelAktiv && norgeRelAktiv.andel_bnp_pct !== "" && norgeRelAktiv.andel_bnp_pct != null
        ? (Number(tilTall(norgeRelAktiv.andel_bnp_pct)) || 0).toLocaleString("nb-NO", {
            minimumFractionDigits: 2, maximumFractionDigits: 2,
          }) + " pst."
        : "–",
    ],
    [
      "Per innbygger",
      norgeRelAktiv && norgeRelAktiv.per_capita_eur !== "" && norgeRelAktiv.per_capita_eur != null
        ? _formaterPerCapita(tilTall(norgeRelAktiv.per_capita_eur), valuta) + " " + valutaNavn
        : "–",
    ],
    ["Rangering (total allokering)", rangAlloc + " av " + aktiveRader.length],
    ["Total forpliktelse", _formaterMrd(norgeAktiv.total_commitment, valuta) + " " + mrdEnhet],
    ["Militær allokering", _formaterMrd(norgeAktiv.military_allocation, valuta) + " " + mrdEnhet],
    ["Finansiell allokering", _formaterMrd(norgeAktiv.financial_allocation, valuta) + " " + mrdEnhet],
    ["Humanitær allokering", _formaterMrd(norgeAktiv.humanitarian_allocation, valuta) + " " + mrdEnhet],
  ];
  if (periode === "kumulativt" && norgeEndr) {
    const dEur = tilTall(norgeEndr.delta_total_allocation);
    const d = (valuta === "nok" ? dEur * SISTE_KURS : dEur);
    const tegn = d > 0 ? "+" : "";
    rader.push(["Endring siste Kiel-utgivelse", tegn + d.toFixed(2) + " " + mrdEnhet]);
  } else if (periode === "kumulativt") {
    rader.push(["Endring siste Kiel-utgivelse", "Vises etter neste release"]);
  } else {
    rader.push(["Endring siste Kiel-utgivelse", "Kun kumulativt"]);
  }
  return rader;
}

async function _grafSomPngBuffer(divId, width, height) {
  const div = document.getElementById(divId);
  if (!div || typeof Plotly === "undefined") return null;
  // Plotly-grafer renderer asynkront; sjekk at div har innhold før eksport.
  if (!div.querySelector(".main-svg")) return null;
  try {
    const dataUrl = await Plotly.toImage(div, {
      format: "png", width, height,
    });
    const resp = await fetch(dataUrl);
    return new Uint8Array(await resp.arrayBuffer());
  } catch (e) {
    console.warn("Klarte ikke eksportere " + divId + ":", e);
    return null;
  }
}

async function genererFlakDocx(opts) {
  if (typeof docx === "undefined") {
    throw new Error("docx-biblioteket er ikke lastet (CDN-feil?)");
  }
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun,
    Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle,
  } = docx;

  const { periode, eu, valuta } = opts;
  const periodeBesk = periode === "kumulativt"
    ? "kumulativt 2022-2026"
    : "kalenderåret " + periode;
  const euBesk = (periode === "kumulativt" && eu === "inkl")
    ? "inkludert EU-fordeling"
    : "direkte bilateral (uten EU-fordeling)";
  const valutaNavn = valutaKortNavn(valuta);
  const dato = new Date().toLocaleDateString("nb-NO", {
    day: "numeric", month: "long", year: "numeric",
  });

  const rader = _bygFlakRader(opts);

  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 6, color: "999999" },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };

  function celle(tekst, justering, bold) {
    return new TableCell({
      borders: cellBorder,
      children: [new Paragraph({
        alignment: justering || AlignmentType.LEFT,
        children: [new TextRun({ text: tekst, bold: !!bold })],
      })],
    });
  }

  const headerRad = new TableRow({
    tableHeader: true,
    children: [
      celle("Målepunkt", AlignmentType.LEFT, true),
      celle("Verdi", AlignmentType.RIGHT, true),
    ],
  });
  const dataRader = rader.map(([etikett, verdi]) =>
    new TableRow({
      children: [
        celle(etikett, AlignmentType.LEFT, false),
        celle(verdi, AlignmentType.RIGHT, false),
      ],
    })
  );

  const tabell = new Table({
    rows: [headerRad, ...dataRader],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const tittel = new Paragraph({
    heading: HeadingLevel.TITLE,
    children: [new TextRun({
      text: "Norges støtte til Ukraina - Kiel-instituttets tall",
      bold: true,
    })],
  });
  const undertittel = new Paragraph({
    children: [new TextRun({
      text: "Generert " + dato + ". " + periodeBesk.charAt(0).toUpperCase()
        + periodeBesk.slice(1) + ", " + euBesk + ". Verdier i " + valutaNavn + ".",
      italics: true,
    })],
  });
  const tabellTittel = new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: "Tabell 1 - Nøkkeltall for Norge" })],
  });
  // Eksporter de tre hovedgrafene som PNG og embed i docx-en.
  // Hvis eksport feiler (graf ikke rendret enda eller iOS-begrensning),
  // faller funksjonen tilbake på tekstmerknad.
  const [rangPng, tidsPng, scatterPng] = await Promise.all([
    _grafSomPngBuffer("rangering-graf", 900, 600),
    _grafSomPngBuffer("tidsserie-graf", 900, 500),
    _grafSomPngBuffer("scatter-graf", 800, 600),
  ]);
  const figurInnhold = [];
  function lagFigur(buffer, tekst, w, h) {
    figurInnhold.push(new Paragraph({
      heading: HeadingLevel.HEADING_3,
      children: [new TextRun({ text: tekst })],
    }));
    figurInnhold.push(new Paragraph({
      children: [new ImageRun({
        data: buffer,
        transformation: { width: w, height: h },
      })],
    }));
  }
  if (rangPng) {
    lagFigur(rangPng, "Figur 1 - Topp 15 giverland", 600, 400);
  }
  if (tidsPng) {
    lagFigur(tidsPng, "Figur 2 - Utvikling over tid", 600, 333);
  }
  if (scatterPng) {
    lagFigur(scatterPng, "Figur 3 - Andel BNP vs. per innbygger", 540, 405);
  }
  if (figurInnhold.length === 0) {
    figurInnhold.push(new Paragraph({
      children: [new TextRun({
        text: "Figurer kunne ikke eksporteres automatisk. Bruk PNG-eksport-"
          + "knappen over hver graf i dashboardet og lim inn manuelt.",
        italics: true,
      })],
    }));
  }
  const kildeMerknad = new Paragraph({
    children: [new TextRun({
      text: "Kilde: Kiel Institute for the World Economy, Ukraine Support "
        + "Tracker. Folketall: Verdensbanken (WDI). BNP: Kiels Country "
        + "Summary, GDP 2021 (i EUR).",
      size: 18,
      color: "555555",
    })],
  });

  const dokument = new Document({
    creator: "SFSs overvåker av Ukraina-støtte",
    title: "Norges støtte til Ukraina - " + dato,
    description: "Flak med Norges nøkkeltall basert på Kiel-data.",
    sections: [{
      children: [
        tittel,
        undertittel,
        new Paragraph({ text: "" }),
        tabellTittel,
        tabell,
        new Paragraph({ text: "" }),
        ...figurInnhold,
        new Paragraph({ text: "" }),
        kildeMerknad,
      ],
    }],
  });

  const blob = await Packer.toBlob(dokument);
  return blob;
}

function lastNedFlakBlob(blob, filnavn) {
  const erIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const url = URL.createObjectURL(blob);
  if (erIOS) {
    // iOS Safari blokkerer programmatisk nedlasting av binærfiler. Åpne
    // i ny fane så brukeren kan dele/lagre manuelt.
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }
  const a = document.createElement("a");
  a.href = url;
  a.download = filnavn;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function byggEksportLenker() {
  const ul = document.getElementById("eksport-lenker");
  if (!ul) return;
  ul.innerHTML = "";
  for (const [filnavn, beskrivelse, hentSti] of EKSPORT_FILER) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = hentSti();
    a.textContent = filnavn;
    a.setAttribute("download", filnavn);
    const span = document.createElement("span");
    span.textContent = beskrivelse;
    li.appendChild(a);
    li.appendChild(span);
    ul.appendChild(li);
  }
}

function tegnEndringstekst(endringstekstData) {
  const seksjon = document.getElementById("endringstekst-seksjon");
  if (!endringstekstData || !endringstekstData.tekster) {
    seksjon.hidden = true;
    return;
  }
  const norge = endringstekstData.tekster["Norway"];
  if (!norge) {
    seksjon.hidden = true;
    return;
  }
  document.getElementById("endringstekst-norge").textContent = norge.tekst;
  document.getElementById("endringstekst-meta").textContent =
    "Sammenligning: " + endringstekstData.ny_release
    + " mot " + endringstekstData.forrige_release
    + ". Generert " + endringstekstData.generert_dato + ".";
  seksjon.hidden = false;
}

async function main() {
  try {
    const [csvResp, metaResp, disbResp, relResp, endrResp, tidsResp, endrTekstResp,
           kurserResp, euResp, aarResp] =
      await Promise.all([
        fetch(DATA_PATH),
        fetch(META_PATH),
        fetch(DISB_PATH),
        fetch(REL_PATH),
        fetch(ENDR_PATH),
        fetch(TIDSSERIE_PATH),
        fetch(ENDRTEKST_PATH),
        fetch(VALUTAKURSER_PATH),
        fetch(EU_PATH),
        fetch(AAR_PATH),
      ]);
    if (!csvResp.ok) throw new Error("Fant ikke country_summary.csv");
    const csv = await csvResp.text();
    const rader = parseCsv(csv);
    const norge = rader.find((r) => r.land === "Norway");
    if (!norge) throw new Error("Norge finnes ikke i datasettet");

    let euRader = [];
    if (euResp.ok) {
      euRader = parseCsv(await euResp.text());
    }
    let aarRader = [];
    if (aarResp.ok) {
      aarRader = parseCsv(await aarResp.text());
    }

    let disbSum = {};
    if (disbResp.ok) {
      disbSum = sumPerGiver(parseCsv(await disbResp.text()));
    }
    const norgeUtbetalt = disbSum["Norway"] || 0;

    let relRader = [];
    if (relResp.ok) {
      relRader = parseCsv(await relResp.text());
    }
    const relIdx = indekser(relRader);
    const norgeRel = relIdx["Norway"];

    let endrRader = [];
    if (endrResp.ok) {
      endrRader = parseCsv(await endrResp.text());
    }
    const endrIdx = indekser(endrRader);
    const norgeEndr = endrIdx["Norway"];

    let tidsserieRader = [];
    if (tidsResp.ok) {
      tidsserieRader = parseCsv(await tidsResp.text());
    }

    let endringstekstData = null;
    if (endrTekstResp.ok) {
      try {
        endringstekstData = await endrTekstResp.json();
      } catch (e) {
        endringstekstData = null;
      }
    }

    if (kurserResp.ok) {
      try {
        settSisteKurs(await kurserResp.json());
      } catch (e) {
        // Behold default-fallback for SISTE_KURS.
      }
    }

    if (metaResp.ok) {
      const meta = await metaResp.json();
      document.getElementById("sist-oppdatert").textContent = meta.prosessert_dato;
    } else {
      document.getElementById("sist-oppdatert").textContent = "ukjent";
    }

    const alleLand = rader.map((r) => r.land).sort();
    fyllKomparativVelger(alleLand, KOMPARATIV_DEFAULT);

    // M7.4: bygg dynamisk år-liste basert på aarRader (nyeste først).
    const tilgjengeligeAr = Array.from(
      new Set(aarRader.map((r) => String(r.aar)))
    ).sort((a, b) => b.localeCompare(a));
    const periodeAarSpan = document.getElementById("periode-aar-knapper");
    if (periodeAarSpan) {
      periodeAarSpan.innerHTML = tilgjengeligeAr
        .map((aar) =>
          '<label><input type="radio" name="periode" value="' + aar
          + '"><span>' + aar + '</span></label>'
        )
        .join("");
    }
    // Gjenopprett periode/EU-state fra sessionStorage hvis tilgjengelig.
    const startPeriode = lesPeriode();
    document.querySelectorAll('input[name="periode"]').forEach((r) => {
      r.checked = (r.value === startPeriode);
    });
    const startEu = lesEu();
    document.querySelectorAll('input[name="eu"]').forEach((r) => {
      r.checked = (r.value === startEu);
    });

    function oppdaterEuToggleTilstand() {
      const periode = lesPeriode();
      const euToggle = document.getElementById("eu-toggle");
      const euMerknad = document.getElementById("eu-merknad");
      if (!euToggle) return;
      if (periode === "kumulativt") {
        euToggle.classList.remove("deaktivert");
        document.querySelectorAll('input[name="eu"]').forEach((r) => {
          r.disabled = false;
          r.setAttribute("aria-disabled", "false");
        });
        if (euMerknad) euMerknad.textContent = "";
      } else {
        euToggle.classList.add("deaktivert");
        document.querySelectorAll('input[name="eu"]').forEach((r) => {
          r.disabled = true;
          r.setAttribute("aria-disabled", "true");
          if (r.value === "ekskl") r.checked = true;
          else r.checked = false;
        });
        if (euMerknad) {
          euMerknad.textContent = "EU-fordeling er kun tilgjengelig på kumulative tall.";
        }
      }
    }

    const visning = document.getElementById("visning");
    const rangeringMaal = document.getElementById("rangering-maal");
    function tegn() {
      const valgte = lesValgteLand();
      const valuta = lesValuta();
      const kompModus = lesKompModus();
      const periode = lesPeriode();
      const eu = lesEu();
      oppdaterEuToggleTilstand();
      oppdaterValutaMerknad(valuta);
      // Skjul multi-velger og gruppe-knapper i gjennomsnitt-modus.
      const enkeltKontroller = document.getElementById("komp-enkeltland-kontroller");
      const modusNotat = document.getElementById("komp-modus-notat");
      if (enkeltKontroller) {
        enkeltKontroller.hidden = (kompModus === "gjennomsnitt");
      }
      if (modusNotat) {
        modusNotat.textContent = kompModus === "gjennomsnitt"
          ? "Sammenligner Norge med gjennomsnittet for medlemslandene i hver gruppe (Norge er ekskludert fra gruppe-snittet selv om den er medlem). Gruppe-snittene styrer kun komparativ profil; rangering og scatter beholder valgte enkeltland."
          : "Velg ett eller flere land. Valget styrer komparativ profil, rangering og scatter. Hold inne Ctrl (Windows) eller Cmd (Mac) for å velge flere. Bruk hurtigknappene for forhåndsdefinerte grupper.";
      }
      // M7.4: bytt til aktive datasett basert på periode + EU-state.
      const aktiveRader = aktivSummary(rader, euRader, aarRader, periode, eu);
      const aktiveRel = aktivRelative(relRader, aarRader, periode);
      const aktivNorge = aktiveRader.find((r) => r.land === "Norway") || norge;
      const aktivNorgeRel = aktiveRel.find((r) => r.land === "Norway");
      // Oppdater KPI-kontekst med periode-merknad.
      const periodeEtMrd = valutaMrdEnhet(valuta) + ", " + periodeEtikett(periode);
      const totalKtx = document.getElementById("total-allocation-kontekst");
      if (totalKtx) totalKtx.textContent = periodeEtMrd;
      const rangKtx = document.getElementById("rangering-alloc-kontekst");
      if (rangKtx) {
        rangKtx.textContent = periode === "kumulativt"
          ? "akkumulert allokering"
          : "allokering i " + periode;
      }
      skrivNoekkeltall(aktivNorge, aktiveRader, aktiveRel, endrRader, valuta);
      tegnFordeling(aktivNorge, visning.value, norgeUtbetalt, aktivNorgeRel, norgeEndr, valuta);
      tegnRangering(aktiveRader, rangeringMaal.value, disbSum, aktiveRel, endrRader, valgte, valuta);
      tegnKomparativProfil(aktiveRader, valgte, aktiveRel, endrRader, valuta, kompModus);
      // Tidsserien er uavhengig av periode-bryteren (viser alltid hele perioden).
      if (tidsserieRader.length > 0) {
        tegnTidsserie(tidsserieRader, valgte, valuta);
      } else {
        document.getElementById("tidsserie-graf").innerHTML =
          '<p class="metode-notat">Ingen tidsseriedata tilgjengelig. '
          + 'Kjør <code>python -m src.ingest.normalize</code> etter at '
          + '<code>data/reference/valutakurser.json</code> er hentet.</p>';
      }
      tegnScatter(aktiveRader, aktiveRel, valgte, valuta);
      tegnFlakForhandsvisning({
        norgeAktiv: aktivNorge,
        norgeRelAktiv: aktivNorgeRel,
        norgeEndr: norgeEndr,
        aktiveRader: aktiveRader,
        periode: periode,
        eu: eu,
        valuta: valuta,
      });
      // M7.6: koble click-handler med nåværende state-verdier. Knappen er
      // alltid aktiv; docx-tilgjengelighet sjekkes i selve klikket.
      const flakKnapp = document.getElementById("flak-last-ned-knapp");
      if (flakKnapp) {
        flakKnapp.onclick = async () => {
          if (typeof docx === "undefined") {
            alert(
              "docx-biblioteket er ikke lastet enda. Sjekk nettforbindelsen "
              + "og prøv igjen om noen sekunder."
            );
            return;
          }
          flakKnapp.disabled = true;
          const originalTekst = flakKnapp.textContent;
          flakKnapp.textContent = "Genererer...";
          try {
            const blob = await genererFlakDocx({
              norgeAktiv: aktivNorge,
              norgeRelAktiv: aktivNorgeRel,
              norgeEndr: norgeEndr,
              aktiveRader: aktiveRader,
              periode: periode,
              eu: eu,
              valuta: valuta,
            });
            const dato = new Date().toISOString().slice(0, 10);
            const periodeFil = periode === "kumulativt" ? "kumulativt" : periode;
            lastNedFlakBlob(blob, "Norges-Ukraina-stotte-" + periodeFil + "-" + dato + ".docx");
          } catch (e) {
            console.error("Flak-generering feilet:", e);
            alert("Kunne ikke generere flak: " + e.message);
          } finally {
            flakKnapp.disabled = false;
            flakKnapp.textContent = originalTekst;
          }
        };
      }
    }
    visning.addEventListener("change", tegn);
    rangeringMaal.addEventListener("change", tegn);
    document
      .querySelectorAll('input[name="valuta"]')
      .forEach((r) => r.addEventListener("change", tegn));
    document
      .querySelectorAll('input[name="periode"]')
      .forEach((r) => r.addEventListener("change", (e) => {
        settPeriode(e.target.value);
        tegn();
      }));
    document
      .querySelectorAll('input[name="eu"]')
      .forEach((r) => r.addEventListener("change", (e) => {
        if (!e.target.disabled) {
          settEu(e.target.value);
          tegn();
        }
      }));
    document
      .querySelectorAll('input[name="komp-modus"]')
      .forEach((r) => r.addEventListener("change", () => {
        oppdaterRullgardinStatus();
        tegn();
      }));
    // Land-velger har egen tilstand; checkbox-endringer trigger tegn() via callback.
    window.__landValgtCallback = tegn;
    const sokFelt = document.getElementById("land-velger-sok");
    if (sokFelt) {
      sokFelt.addEventListener("input", (e) => {
        rendreLandListe(e.target.value);
      });
    }
    const tomKnapp = document.getElementById("land-velger-tom");
    if (tomKnapp) {
      tomKnapp.addEventListener("click", () => {
        _valgte.clear();
        rendreLandListe(sokFelt ? sokFelt.value : "");
        oppdaterAntallEtikett();
        tegn();
      });
    }
    ["tidsserie-modus", "tidsserie-kategori",
     "scatter-x", "scatter-y"]
      .forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("change", tegn);
      });
    document
      .querySelectorAll(".gruppe-knapper button")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const gruppe = btn.dataset.gruppe;
          const valg = landFraGruppe(gruppe, alleLand);
          fyllKomparativVelger(alleLand, valg);
          tegn();
        });
      });
    tegnEndringstekst(endringstekstData);
    byggEksportLenker();

    const pngKnapp = document.getElementById("rangering-png-knapp");
    if (pngKnapp) {
      pngKnapp.addEventListener("click", async () => {
        const dato = new Date().toISOString().slice(0, 10);
        const filnavn = "kiel-rangering-" + dato;
        // Bygg en print-vennlig versjon av grafen i en skjult div for
        // PNG-eksport: hvit bakgrunn, plass til lange landsnavn, verdi-
        // etiketter, tittel og kildehenvisning.
        const valuta = lesValuta();
        const { verdier, xTittel } = beregnRangeringVerdier(
          rader, rangeringMaal.value, disbSum, relRader, endrRader, valuta
        );
        const topp = verdier.slice(0, 15);
        const norgeFarge = "#1d3557";
        const andreFarge = "#5d8aaa";
        const farger = topp.map((v) =>
          v.land === "Norway" ? norgeFarge : andreFarge
        );
        const tekstEtikett = topp.map((v) => v.sum.toFixed(2));

        const skjult = document.createElement("div");
        skjult.style.position = "fixed";
        skjult.style.top = "-10000px";
        skjult.style.left = "-10000px";
        skjult.style.width = "1400px";
        skjult.style.height = "900px";
        document.body.appendChild(skjult);

        try {
          await Plotly.newPlot(skjult, [{
            x: topp.map((v) => v.sum),
            y: topp.map((v) => norsk(v.land)),
            type: "bar",
            orientation: "h",
            marker: { color: farger },
            text: tekstEtikett,
            textposition: "outside",
            cliponaxis: false,
            textfont: { color: "#1a1a1a", size: 14, family: "Arial, sans-serif" },
            hoverinfo: "skip",
          }], {
            title: {
              text: rangeringSeksjonsTittel(rangeringMaal.value),
              font: { size: 22, color: "#0b2545", family: "Arial, sans-serif" },
              x: 0.02,
              xanchor: "left",
              y: 0.97,
            },
            paper_bgcolor: "#ffffff",
            plot_bgcolor: "#ffffff",
            font: { family: "Arial, sans-serif", color: "#1a1a1a", size: 14 },
            margin: { t: 80, b: 100, l: 280, r: 90 },
            xaxis: {
              title: { text: xTittel, font: { color: "#555", size: 13 } },
              gridcolor: "#e0e0e0",
              linecolor: "#e0e0e0",
              tickfont: { color: "#555" },
              zeroline: true,
              zerolinecolor: "#555",
            },
            yaxis: {
              autorange: "reversed",
              tickfont: { color: "#1a1a1a", size: 14 },
              gridcolor: "#ffffff",
              linecolor: "#e0e0e0",
            },
            annotations: [{
              text: "Kilde: Kiel Institute for the World Economy, Ukraine Support Tracker. Hentet "
                + dato + ". SFSs overvåker av Ukraina-støtte.",
              xref: "paper", yref: "paper", x: 0, y: -0.09, showarrow: false,
              font: { size: 11, color: "#777" },
              xanchor: "left",
            }],
          }, { staticPlot: true });

          const dataUrl = await Plotly.toImage(skjult, {
            format: "png", width: 1400, height: 900,
          });

          const erIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
          if (erIOS) {
            const w = window.open("", "_blank");
            if (w && w.document) {
              w.document.write(
                "<!doctype html><html lang=\"nb\"><head>"
                + "<meta charset=\"utf-8\"><title>" + filnavn + ".png</title>"
                + "<style>body{margin:0;padding:1rem;font-family:-apple-system,sans-serif;background:#f8f9fa;}"
                + "p{color:#555;font-size:0.9rem;margin:0 0 1rem;}"
                + "img{max-width:100%;height:auto;border:1px solid #e0e0e0;}</style>"
                + "</head><body>"
                + "<p>Trykk og hold på bildet for å lagre det i Bilder.</p>"
                + "<img src=\"" + dataUrl + "\" alt=\"Topp 15 giverland\">"
                + "</body></html>"
              );
              w.document.close();
            }
          } else {
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = filnavn + ".png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        } catch (e) {
          console.error("PNG-eksport feilet:", e);
        } finally {
          document.body.removeChild(skjult);
        }
      });
    }

    tegn();
  } catch (feil) {
    console.error(feil);
    visFeil("Klarte ikke laste data: " + feil.message);
  }
}

main();
