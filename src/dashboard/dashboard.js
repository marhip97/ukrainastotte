// Leser country_summary.csv og rendrer Norges nøkkeltall + topp-liste.
// Stien er konfigurerbar via window.DATA_PATH (brukes ved deploy).

const DATA_PATH = window.DATA_PATH || "../../data/processed/country_summary.csv";
const META_PATH = window.META_PATH || "../../data/processed/metadata.json";
const DISB_PATH = window.DISB_PATH || "../../data/processed/financial_disbursements.csv";
const REL_PATH = window.REL_PATH || "../../data/processed/country_summary_relative.csv";

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

function skrivNoekkeltall(norge, rader, relRader) {
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
}

function tegnFordeling(norge, maal, norgeUtbetalt, norgeRel) {
  const graf = document.getElementById("fordeling-graf");
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
        hoverinfo: "label+value",
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

function tegnRangering(rader, maal, disbSum, relRader) {
  let verdier;
  let xTittel;
  if (maal === "disbursement") {
    verdier = Object.keys(disbSum)
      .map((land) => ({ land, sum: disbSum[land] }))
      .sort((a, b) => b.sum - a.sum);
    xTittel = "€ mrd";
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
  else nevner = " giverland";
  const tekst = rang > 0
    ? `Norge er på ${rang}. plass av ${antall}${nevner}.`
    : `Norge er ikke i datasettet for denne visningen.`;
  document.getElementById("norge-plassering").textContent = tekst;
}

async function main() {
  try {
    const [csvResp, metaResp, disbResp, relResp] = await Promise.all([
      fetch(DATA_PATH),
      fetch(META_PATH),
      fetch(DISB_PATH),
      fetch(REL_PATH),
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

    if (metaResp.ok) {
      const meta = await metaResp.json();
      document.getElementById("sist-oppdatert").textContent = meta.prosessert_dato;
    } else {
      document.getElementById("sist-oppdatert").textContent = "ukjent";
    }

    const visning = document.getElementById("visning");
    function tegn() {
      skrivNoekkeltall(norge, rader, relRader);
      tegnFordeling(norge, visning.value, norgeUtbetalt, norgeRel);
      tegnRangering(rader, visning.value, disbSum, relRader);
    }
    visning.addEventListener("change", tegn);
    tegn();
  } catch (feil) {
    console.error(feil);
    visFeil("Klarte ikke laste data: " + feil.message);
  }
}

main();
