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

function visFeil(tekst) {
  const el = document.getElementById("feilmelding");
  el.textContent = tekst;
  el.classList.remove("skjult");
}

function parseCsv(tekst) {
  const linjer = tekst.trim().split("\n");
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
          marker: { color: ["#d71418", "#1a4d8f", "#2e8540"] },
          hovertemplate: "<b>%{x}</b><br>Endring: %{y:,.3f} € mrd<extra></extra>",
        },
      ],
      {
        margin: { t: 30, b: 40, l: 50, r: 20 },
        height: 320,
        yaxis: { title: "Endring (€ mrd)", zeroline: true },
      },
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
          marker: { color: "#1a4d8f" },
          text: [norgeUtbetalt.toFixed(3) + " € mrd"],
          textposition: "outside",
          hovertemplate:
            "<b>Norge</b><br>Finansiell utbetaling: %{y:,.3f} € mrd<extra></extra>",
        },
      ],
      {
        margin: { t: 30, b: 40, l: 50, r: 20 },
        height: 300,
        yaxis: { title: "€ mrd", rangemode: "tozero" },
        annotations: [
          {
            text: "Kun finansielle budget support-utbetalinger. Militær og humanitær ikke inkludert.",
            xref: "paper", yref: "paper", x: 0, y: 1.12, showarrow: false,
            font: { size: 11, color: "#555" },
          },
        ],
      },
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
          marker: { color: "#d71418" },
          text: [tekst],
          textposition: "outside",
          hovertemplate: "<b>Norge</b><br>" + aksetittel + ": %{y:,.2f}<extra></extra>",
        },
      ],
      {
        margin: { t: 30, b: 40, l: 60, r: 20 },
        height: 300,
        yaxis: { title: aksetittel, rangemode: "tozero" },
      },
      { displayModeBar: false, responsive: true }
    );
    return;
  }
  const prefiks = maal === "commitment" ? "commitment" : "allocation";
  const verdier = [
    tilTall(norge["military_" + prefiks]),
    tilTall(norge["financial_" + prefiks]),
    tilTall(norge["humanitarian_" + prefiks]),
  ];
  Plotly.newPlot(
    graf,
    [
      {
        values: verdier,
        labels: ["Militær", "Finansiell", "Humanitær"],
        type: "pie",
        hole: 0.5,
        marker: { colors: ["#d71418", "#1a4d8f", "#2e8540"] },
        textinfo: "label+percent",
        hovertemplate: "<b>%{label}</b><br>%{value:,.2f} € mrd (%{percent})<extra></extra>",
      },
    ],
    {
      margin: { t: 20, b: 20, l: 20, r: 20 },
      height: 360,
      showlegend: false,
    },
    { displayModeBar: false, responsive: true }
  );
}

function tegnRangering(rader, maal, disbSum, relRader, endrRader) {
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
  const farger = topp.map((v) => (v.land === "Norway" ? "#d71418" : "#1a4d8f"));
  Plotly.newPlot(
    "rangering-graf",
    [
      {
        x: topp.map((v) => v.sum),
        y: topp.map((v) => v.land),
        type: "bar",
        orientation: "h",
        marker: { color: farger },
        hovertemplate: "<b>%{y}</b><br>" + xTittel + ": %{x:,.2f}<extra></extra>",
      },
    ],
    {
      margin: { t: 20, b: 40, l: 140, r: 20 },
      height: 420,
      xaxis: { title: xTittel },
      yaxis: { autorange: "reversed" },
    },
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
    opt.textContent = land;
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
    overskrift.textContent = land;
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
      name: land,
      type: modus === "akkumulert" ? "scatter" : "bar",
      mode: modus === "akkumulert" ? "lines+markers" : undefined,
      line: erNorge ? { color: "#d71418", width: 3 } : undefined,
      marker: erNorge ? { color: "#d71418" } : undefined,
      hovertemplate:
        "<b>%{fullData.name}</b><br>"
        + "Måned: %{x}<br>"
        + (modus === "akkumulert" ? "Akkumulert: " : "Måned: ")
        + "%{y:,.3f} " + valutaTekst + "<extra></extra>",
    });
  }

  const yTittel = modus === "akkumulert"
    ? "Akkumulert " + valutaTekst + " (raw)"
    : "Per måned (" + valutaTekst + ")";
  Plotly.newPlot(
    "tidsserie-graf",
    traces,
    {
      margin: { t: 20, b: 60, l: 80, r: 20 },
      height: 420,
      xaxis: { title: "Måned" },
      yaxis: { title: yTittel, rangemode: "tozero" },
      hovermode: "closest",
      barmode: "group",
      legend: { orientation: "h", y: -0.2 },
    },
    { displayModeBar: false, responsive: true }
  );
}

function tegnScatter(rader, relRader) {
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

  const norge = filtrert.find((p) => p.land === "Norway");
  const andre = filtrert.filter((p) => p.land !== "Norway");

  const traces = [
    {
      x: andre.map((p) => p.x),
      y: andre.map((p) => p.y),
      text: andre.map((p) => p.land),
      mode: "markers",
      type: "scatter",
      name: "Andre giverland",
      marker: { color: "#1a4d8f", size: 9 },
      hovertemplate:
        "<b>%{text}</b><br>"
        + aksetekst(xFelt) + ": %{x:,.2f}<br>"
        + aksetekst(yFelt) + ": %{y:,.2f}<extra></extra>",
    },
  ];
  if (norge) {
    traces.push({
      x: [norge.x],
      y: [norge.y],
      text: ["Norge"],
      mode: "markers+text",
      type: "scatter",
      name: "Norge",
      marker: { color: "#d71418", size: 14, symbol: "star" },
      textposition: "top center",
      hovertemplate:
        "<b>Norge</b><br>"
        + aksetekst(xFelt) + ": %{x:,.2f}<br>"
        + aksetekst(yFelt) + ": %{y:,.2f}<extra></extra>",
    });
  }

  Plotly.newPlot(
    "scatter-graf",
    traces,
    {
      margin: { t: 20, b: 60, l: 80, r: 20 },
      height: 420,
      xaxis: { title: aksetekst(xFelt), rangemode: "tozero" },
      yaxis: { title: aksetekst(yFelt), rangemode: "tozero" },
      hovermode: "closest",
      legend: { orientation: "h", y: -0.2 },
    },
    { displayModeBar: false, responsive: true }
  );
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
      skrivNoekkeltall(norge, rader, relRader, endrRader);
      tegnFordeling(norge, visning.value, norgeUtbetalt, norgeRel, norgeEndr);
      tegnRangering(rader, visning.value, disbSum, relRader, endrRader);
      const valgte = lesValgteLand();
      tegnKomparativProfil(rader, valgte, relRader, endrRader);
      if (tidsserieRader.length > 0) {
        tegnTidsserie(tidsserieRader, valgte);
      } else {
        document.getElementById("tidsserie-graf").innerHTML =
          '<p class="metode-notat">Ingen tidsseriedata tilgjengelig. '
          + 'Kjør <code>python -m src.ingest.normalize</code> etter at '
          + '<code>data/reference/valutakurser.json</code> er hentet.</p>';
      }
      tegnScatter(rader, relRader);
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
    tegn();
  } catch (feil) {
    console.error(feil);
    visFeil("Klarte ikke laste data: " + feil.message);
  }
}

main();
