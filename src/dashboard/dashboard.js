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

function fyllKomparativVelger(alleLand, valgte) {
  const velger = document.getElementById("komparativ-velger");
  velger.innerHTML = "";
  for (const land of alleLand) {
    const opt = document.createElement("option");
    opt.value = land;
    opt.textContent = norsk(land);
    if (valgte.includes(land)) opt.selected = true;
    velger.appendChild(opt);
  }
}

function lesValgteLand() {
  const velger = document.getElementById("komparativ-velger");
  return Array.from(velger.selectedOptions).map((o) => o.value);
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
          ["Total allokering", allocN.toFixed(2) + " " + enhet],
          ["Total forpliktelse", commN.toFixed(2) + " " + enhet],
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
              : (deltaN >= 0 ? "+" : "") + deltaN.toFixed(2) + " " + enhet],
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
            allocG === null ? "–" : allocG.toFixed(2) + " " + enhet],
          ["Total forpliktelse",
            commG === null ? "–" : commG.toFixed(2) + " " + enhet],
          ["Andel av BNP",
            profil.andel_bnp_pct === null ? "–"
              : profil.andel_bnp_pct.toFixed(2) + " %"],
          ["Per innbygger",
            profil.per_capita_eur === null ? "–"
              : Math.round(profil.per_capita_eur * skala).toLocaleString("nb-NO")
                + " " + (valuta === "nok" ? "NOK" : "EUR")],
          ["Endring siste release",
            deltaG === null ? "–"
              : (deltaG >= 0 ? "+" : "") + deltaG.toFixed(2) + " " + enhet],
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
      ["Total allokering", allocVerdi.toFixed(2) + " " + enhet],
      ["Total forpliktelse", commVerdi.toFixed(2) + " " + enhet],
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
          : (deltaVerdi >= 0 ? "+" : "") + deltaVerdi.toFixed(2) + " " + enhet,
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
           kurserResp] =
      await Promise.all([
        fetch(DATA_PATH),
        fetch(META_PATH),
        fetch(DISB_PATH),
        fetch(REL_PATH),
        fetch(ENDR_PATH),
        fetch(TIDSSERIE_PATH),
        fetch(ENDRTEKST_PATH),
        fetch(VALUTAKURSER_PATH),
      ]);
    if (!csvResp.ok) throw new Error("Fant ikke country_summary.csv");
    const csv = await csvResp.text();
    const rader = parseCsv(csv);
    const norge = rader.find((r) => r.land === "Norway");
    if (!norge) throw new Error("Norge finnes ikke i datasettet");

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

    const visning = document.getElementById("visning");
    const rangeringMaal = document.getElementById("rangering-maal");
    function tegn() {
      const valgte = lesValgteLand();
      const valuta = lesValuta();
      const kompModus = lesKompModus();
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
      skrivNoekkeltall(norge, rader, relRader, endrRader, valuta);
      tegnFordeling(norge, visning.value, norgeUtbetalt, norgeRel, norgeEndr, valuta);
      tegnRangering(rader, rangeringMaal.value, disbSum, relRader, endrRader, valgte, valuta);
      tegnKomparativProfil(rader, valgte, relRader, endrRader, valuta, kompModus);
      if (tidsserieRader.length > 0) {
        tegnTidsserie(tidsserieRader, valgte, valuta);
      } else {
        document.getElementById("tidsserie-graf").innerHTML =
          '<p class="metode-notat">Ingen tidsseriedata tilgjengelig. '
          + 'Kjør <code>python -m src.ingest.normalize</code> etter at '
          + '<code>data/reference/valutakurser.json</code> er hentet.</p>';
      }
      tegnScatter(rader, relRader, valgte, valuta);
    }
    visning.addEventListener("change", tegn);
    rangeringMaal.addEventListener("change", tegn);
    document
      .querySelectorAll('input[name="valuta"]')
      .forEach((r) => r.addEventListener("change", tegn));
    document
      .querySelectorAll('input[name="komp-modus"]')
      .forEach((r) => r.addEventListener("change", tegn));
    document
      .getElementById("komparativ-velger")
      .addEventListener("change", tegn);
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
                + dato + ". SFSs Ukraina-støtte overvåker.",
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
