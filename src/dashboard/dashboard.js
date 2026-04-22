// Leser country_summary.csv og rendrer Norges nøkkeltall + topp-liste.
// Stien er konfigurerbar via window.DATA_PATH (brukes ved deploy).

const DATA_PATH = window.DATA_PATH || "../../data/processed/country_summary.csv";
const META_PATH = window.META_PATH || "../../data/processed/metadata.json";

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

function skrivNoekkeltall(norge, rader, maal) {
  const alloc = tilTall(norge.total_allocation);
  const comm = tilTall(norge.total_commitment);
  document.getElementById("total-allocation").textContent = alloc.toFixed(2);
  document.getElementById("total-commitment").textContent = comm.toFixed(2);
  const sortertAlloc = sortertEtter(rader, "total_allocation");
  const sortertComm = sortertEtter(rader, "total_commitment");
  const rangAlloc = sortertAlloc.findIndex((r) => r.land === "Norway") + 1;
  const rangComm = sortertComm.findIndex((r) => r.land === "Norway") + 1;
  document.getElementById("rangering-alloc").textContent =
    rangAlloc + " / " + rader.length;
  document.getElementById("rangering-comm").textContent =
    rangComm + " / " + rader.length;
}

function tegnFordeling(norge, maal) {
  const prefiks = maal === "commitment" ? "commitment" : "allocation";
  const verdier = [
    tilTall(norge["military_" + prefiks]),
    tilTall(norge["financial_" + prefiks]),
    tilTall(norge["humanitarian_" + prefiks]),
  ];
  Plotly.newPlot(
    "fordeling-graf",
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

function tegnRangering(rader, maal) {
  const felt = maal === "commitment" ? "total_commitment" : "total_allocation";
  const sortert = sortertEtter(rader, felt).slice(0, 15);
  const farger = sortert.map((r) => (r.land === "Norway" ? "#d71418" : "#1a4d8f"));
  Plotly.newPlot(
    "rangering-graf",
    [
      {
        x: sortert.map((r) => tilTall(r[felt])),
        y: sortert.map((r) => r.land),
        type: "bar",
        orientation: "h",
        marker: { color: farger },
      },
    ],
    {
      margin: { t: 20, b: 40, l: 140, r: 20 },
      height: 420,
      xaxis: { title: "€ mrd" },
      yaxis: { autorange: "reversed" },
    },
    { displayModeBar: false, responsive: true }
  );
  const rang = sortertEtter(rader, felt).findIndex((r) => r.land === "Norway") + 1;
  document.getElementById("norge-plassering").textContent =
    `Norge er på ${rang}. plass av ${rader.length} giverland.`;
}

async function main() {
  try {
    const [csvResp, metaResp] = await Promise.all([
      fetch(DATA_PATH),
      fetch(META_PATH),
    ]);
    if (!csvResp.ok) throw new Error("Fant ikke country_summary.csv");
    const csv = await csvResp.text();
    const rader = parseCsv(csv);
    const norge = rader.find((r) => r.land === "Norway");
    if (!norge) throw new Error("Norge finnes ikke i datasettet");

    if (metaResp.ok) {
      const meta = await metaResp.json();
      document.getElementById("sist-oppdatert").textContent = meta.prosessert_dato;
    } else {
      document.getElementById("sist-oppdatert").textContent = "ukjent";
    }

    const visning = document.getElementById("visning");
    function tegn() {
      skrivNoekkeltall(norge, rader, visning.value);
      tegnFordeling(norge, visning.value);
      tegnRangering(rader, visning.value);
    }
    visning.addEventListener("change", tegn);
    tegn();
  } catch (feil) {
    console.error(feil);
    visFeil("Klarte ikke laste data: " + feil.message);
  }
}

main();
