// Leser country_summary.csv og rendrer Norges nøkkeltall + topp-liste.
// Stien er konfigurerbar via window.DATA_PATH (brukes ved deploy).

const DATA_PATH = window.DATA_PATH || "../../data/processed/country_summary.csv";
const META_PATH = window.META_PATH || "../../data/processed/metadata.json";
const DISB_PATH = window.DISB_PATH || "../../data/processed/financial_disbursements.csv";
const REL_PATH = window.REL_PATH || "../../data/processed/country_summary_relative.csv";
const ENDR_PATH = window.ENDR_PATH || "../../data/processed/country_summary_endring.csv";
const TIDSSERIE_PATH = window.TIDSSERIE_PATH || "../../data/processed/tidsserier_maanedlig.csv";
const ENDRTEKST_PATH = window.ENDRTEKST_PATH || "../../data/processed/endringstekst.json";

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

function skrivNoekkeltall(norge, rader, relRader, endrRader) {
  const alloc = tilTall(norge.total_allocation);
  document.getElementById("total-allocation").textContent = alloc.toFixed(2);
  const sortertAlloc = sortertEtter(rader, "total_allocation");
  const rangAlloc = sortertAlloc.findIndex((r) => r.land === "Norway") + 1;
  document.getElementById("rangering-alloc").textContent =
    rangAlloc + " / " + rader.length;

  const relIdx = indekser(relRader);
  const norgeRel = relIdx["Norway"];
  if (norgeRel) {
    document.getElementById("andel-bnp").textContent =
      tilTall(norgeRel.andel_bnp_pct).toFixed(2) + " %";
    document.getElementById("per-capita").textContent =
      Math.round(tilTall(norgeRel.per_capita_eur)).toLocaleString("nb-NO");
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
  if (endrRader.length === 0) {
    endrEl.textContent = "–";
    endrEl.title = "Kun én Kiel-release tilgjengelig. Endring vises når neste release kommer.";
  } else {
    const endrIdx = indekser(endrRader);
    const norgeEndr = endrIdx["Norway"];
    const d = norgeEndr ? tilTall(norgeEndr.delta_total_allocation) : 0;
    const tegn = d > 0 ? "+" : "";
    endrEl.textContent = tegn + d.toFixed(2);
  }
}

function tegnFordeling(norge, maal, norgeUtbetalt, norgeRel, norgeEndr) {
  const graf = document.getElementById("fordeling-graf");
  if (maal === "endring") {
    if (!norgeEndr) {
      Plotly.purge(graf);
      graf.innerHTML =
        '<p class="metode-notat">Kun én Kiel-release er lagret enda. '
        + 'Endringstall beregnes når neste release kommer (ukentlig henting).</p>';
      return;
    }
    Plotly.newPlot(
      graf,
      [
        {
          x: ["Militær", "Finansiell", "Humanitær"],
          y: [
            tilTall(norgeEndr.delta_military_allocation),
            tilTall(norgeEndr.delta_financial_allocation),
            tilTall(norgeEndr.delta_humanitarian_allocation),
          ],
          type: "bar",
          marker: {
            color: [
              token("--kategori-militaer", "#08306b"),
              token("--kategori-finansiell", "#2171b5"),
              token("--kategori-humanitaer", "#4292c6"),
            ],
          },
          hovertemplate: "<b>%{x}</b><br>Endring: %{y:,.3f} € mrd<extra></extra>",
        },
      ],
      flett(tema(), {
        height: 320,
        yaxis: { title: "Endring (€ mrd)", zeroline: true },
      }),
      { displayModeBar: false, responsive: true }
    );
    return;
  }
  if (maal === "disbursement") {
    Plotly.newPlot(
      graf,
      [
        {
          x: ["Finansiell utbetaling (Norge)"],
          y: [norgeUtbetalt],
          type: "bar",
          marker: { color: token("--blue-500", "#1d3557") },
          text: [norgeUtbetalt.toFixed(3) + " € mrd"],
          textposition: "outside",
          hovertemplate:
            "<b>Norge</b><br>Finansiell utbetaling: %{y:,.3f} € mrd<extra></extra>",
        },
      ],
      flett(tema(), {
        height: 300,
        yaxis: { title: "€ mrd", rangemode: "tozero" },
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
    const verdi = maal === "bnp"
      ? tilTall(norgeRel ? norgeRel.andel_bnp_pct : 0)
      : tilTall(norgeRel ? norgeRel.per_capita_eur : 0);
    const tekst = maal === "bnp" ? verdi.toFixed(2) + " %" : Math.round(verdi).toLocaleString("nb-NO") + " EUR";
    const aksetittel = maal === "bnp" ? "% av BNP (2024)" : "EUR per innbygger (2024)";
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
  const militaer   = tilTall(norge["military_"     + prefiks]);
  const finansiell = tilTall(norge["financial_"    + prefiks]);
  const humanitaer = tilTall(norge["humanitarian_" + prefiks]);
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
      "%{x:,.2f} € mrd (" + pct(verdi) + ")<extra></extra>",
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
      xaxis: { title: "€ mrd", rangemode: "tozero" },
      yaxis: { showticklabels: false, fixedrange: true },
      showlegend: true,
      legend: { orientation: "h", y: -0.6 },
    }),
    { displayModeBar: false, responsive: true }
  );
}

function tegnRangering(rader, maal, disbSum, relRader, endrRader, valgteLand) {
  let verdier;
  let xTittel;
  if (maal === "disbursement") {
    verdier = Object.keys(disbSum)
      .map((land) => ({ land, sum: disbSum[land] }))
      .sort((a, b) => b.sum - a.sum);
    xTittel = "€ mrd";
  } else if (maal === "endring") {
    verdier = endrRader
      .map((r) => ({ land: r.land, sum: tilTall(r.delta_total_allocation) }))
      .sort((a, b) => b.sum - a.sum);
    xTittel = "Endring i total allokering (€ mrd)";
  } else if (maal === "bnp" || maal === "capita") {
    const felt = maal === "bnp" ? "andel_bnp_pct" : "per_capita_eur";
    verdier = relRader
      .filter((r) => r[felt] !== "" && r[felt] !== undefined)
      .map((r) => ({ land: r.land, sum: tilTall(r[felt]) }))
      .sort((a, b) => b.sum - a.sum);
    xTittel = maal === "bnp" ? "% av BNP (2024)" : "EUR per innbygger (2024)";
  } else {
    const felt = maal === "commitment" ? "total_commitment" : "total_allocation";
    verdier = sortertEtter(rader, felt).map((r) => ({
      land: r.land,
      sum: tilTall(r[felt]),
    }));
    xTittel = "€ mrd";
  }
  const topp = verdier.slice(0, 15);
  const norgeFarge = token("--blue-500", "#1d3557");
  const valgtFarge = token("--blue-500", "#1d3557");
  const andreFarge = token("--blue-300", "#5d8aaa");
  const stripeFarge = token("--blue-50", "#eef2f7");
  const valgteSet = new Set(valgteLand || []);
  const farger = topp.map((v) => {
    if (v.land === "Norway") return norgeFarge;
    if (valgteSet.has(v.land)) return valgtFarge;
    return andreFarge;
  });
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

function tegnKomparativProfil(rader, valgteLand, relRader, endrRader) {
  const grid = document.getElementById("komparativ-grid");
  grid.innerHTML = "";
  const summaryIdx = indekser(rader);
  const relIdx = indekser(relRader);
  const endrIdx = indekser(endrRader);
  const sortertAlloc = sortertEtter(rader, "total_allocation");
  const rangAlloc = {};
  sortertAlloc.forEach((r, i) => { rangAlloc[r.land] = i + 1; });

  for (const land of valgteLand) {
    const summary = summaryIdx[land];
    if (!summary) continue;
    const rel = relIdx[land];
    const endr = endrIdx[land];

    const rBnp = rel ? rangMellomKomplette(relRader, "andel_bnp_pct", land) : null;
    const rCap = rel ? rangMellomKomplette(relRader, "per_capita_eur", land) : null;

    const kort = document.createElement("article");
    kort.className = "komparativ-kort" + (land === "Norway" ? " fokus" : "");
    const overskrift = document.createElement("h3");
    overskrift.textContent = norsk(land);
    kort.appendChild(overskrift);

    const dl = document.createElement("dl");
    const rader2 = [
      ["Total allokering", tilTall(summary.total_allocation).toFixed(2) + " € mrd"],
      ["Total forpliktelse", tilTall(summary.total_commitment).toFixed(2) + " € mrd"],
      [
        "Andel av BNP",
        rel && rel.andel_bnp_pct !== ""
          ? tilTall(rel.andel_bnp_pct).toFixed(2) + " %"
          : "–",
      ],
      [
        "Per innbygger",
        rel && rel.per_capita_eur !== ""
          ? Math.round(tilTall(rel.per_capita_eur)).toLocaleString("nb-NO") + " EUR"
          : "–",
      ],
      ["Rangering allokering", rangAlloc[land] + " av " + rader.length],
      ["Rangering BNP-andel", rBnp ? rBnp.plass + " av " + rBnp.av : "–"],
      ["Rangering per capita", rCap ? rCap.plass + " av " + rCap.av : "–"],
      [
        "Endring siden forrige release",
        endr
          ? (tilTall(endr.delta_total_allocation) >= 0 ? "+" : "")
            + tilTall(endr.delta_total_allocation).toFixed(2) + " € mrd"
          : "–",
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

function tegnTidsserie(rader, valgteLand) {
  const modus = document.getElementById("tidsserie-modus").value;
  const maal = document.getElementById("tidsserie-maal").value;
  const kategori = document.getElementById("tidsserie-kategori").value;
  const valuta = document.getElementById("tidsserie-valuta").value;
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

function tegnScatter(rader, relRader, valgteLand) {
  const xFelt = document.getElementById("scatter-x").value;
  const yFelt = document.getElementById("scatter-y").value;
  const summaryIdx = indekser(rader);

  function hentVerdi(land, felt) {
    if (felt === "andel_bnp_pct" || felt === "per_capita_eur") {
      const r = relRader.find((x) => x.land === land);
      if (!r) return null;
      const v = r[felt];
      if (v === "" || v === undefined) return null;
      return tilTall(v);
    }
    const r = summaryIdx[land];
    if (!r) return null;
    return tilTall(r[felt]);
  }

  function aksetekst(felt) {
    if (felt === "andel_bnp_pct") return "Andel av BNP (%)";
    if (felt === "per_capita_eur") return "Per innbygger (EUR)";
    if (felt === "total_allocation") return "Total allokering (€ mrd)";
    if (felt === "total_commitment") return "Total forpliktelse (€ mrd)";
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
    const [csvResp, metaResp, disbResp, relResp, endrResp, tidsResp, endrTekstResp] =
      await Promise.all([
        fetch(DATA_PATH),
        fetch(META_PATH),
        fetch(DISB_PATH),
        fetch(REL_PATH),
        fetch(ENDR_PATH),
        fetch(TIDSSERIE_PATH),
        fetch(ENDRTEKST_PATH),
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

    if (metaResp.ok) {
      const meta = await metaResp.json();
      document.getElementById("sist-oppdatert").textContent = meta.prosessert_dato;
    } else {
      document.getElementById("sist-oppdatert").textContent = "ukjent";
    }

    const alleLand = rader.map((r) => r.land).sort();
    fyllKomparativVelger(alleLand, KOMPARATIV_DEFAULT);

    const visning = document.getElementById("visning");
    function tegn() {
      const valgte = lesValgteLand();
      skrivNoekkeltall(norge, rader, relRader, endrRader);
      tegnFordeling(norge, visning.value, norgeUtbetalt, norgeRel, norgeEndr);
      tegnRangering(rader, visning.value, disbSum, relRader, endrRader, valgte);
      tegnKomparativProfil(rader, valgte, relRader, endrRader);
      if (tidsserieRader.length > 0) {
        tegnTidsserie(tidsserieRader, valgte);
      } else {
        document.getElementById("tidsserie-graf").innerHTML =
          '<p class="metode-notat">Ingen tidsseriedata tilgjengelig. '
          + 'Kjør <code>python -m src.ingest.normalize</code> etter at '
          + '<code>data/reference/valutakurser.json</code> er hentet.</p>';
      }
      tegnScatter(rader, relRader, valgte);
    }
    visning.addEventListener("change", tegn);
    document
      .getElementById("komparativ-velger")
      .addEventListener("change", tegn);
    ["tidsserie-modus", "tidsserie-maal", "tidsserie-kategori", "tidsserie-valuta",
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
      pngKnapp.addEventListener("click", () => {
        const dato = new Date().toISOString().slice(0, 10);
        Plotly.downloadImage("rangering-graf", {
          format: "png",
          width: 1200,
          height: 700,
          filename: "kiel-rangering-" + dato,
        });
      });
    }

    tegn();
  } catch (feil) {
    console.error(feil);
    visFeil("Klarte ikke laste data: " + feil.message);
  }
}

main();
