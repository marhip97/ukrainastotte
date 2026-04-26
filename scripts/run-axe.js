#!/usr/bin/env node
/*
 * Kjører axe-core mot dashboardet via puppeteer.
 *
 * Brukes både lokalt (`node scripts/run-axe.js http://localhost:8765/`)
 * og fra `.github/workflows/a11y.yml`. Puppeteer installerer egen
 * Chromium ved npm install, så vi trenger ikke separat browser i CI.
 *
 * Exit-koder:
 *   0 = ingen brudd på serious/critical-nivå
 *   1 = funnet serious/critical-brudd
 *   2 = browseren feilet å starte eller siden lastet ikke
 *
 * Argumenter:
 *   node scripts/run-axe.js [url] [--terskel serious|critical|moderate|minor]
 */

const puppeteer = require("puppeteer");
const { AxePuppeteer } = require("@axe-core/puppeteer");

const TERSKLER = ["minor", "moderate", "serious", "critical"];

function parseArgs() {
  const args = process.argv.slice(2);
  let url = "http://localhost:8765/";
  let terskel = "serious";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--terskel" && args[i + 1]) {
      terskel = args[i + 1];
      i++;
    } else if (!args[i].startsWith("--")) {
      url = args[i];
    }
  }
  return { url, terskel };
}

(async () => {
  const { url, terskel } = parseArgs();
  const minIdx = TERSKLER.indexOf(terskel);
  if (minIdx < 0) {
    console.error("Ugyldig --terskel. Bruk: " + TERSKLER.join(", "));
    process.exit(2);
  }
  console.log("Kjører axe-core mot " + url + " (feiler på " + terskel + " og høyere)");

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } catch (e) {
    console.error("Kunne ikke starte browser: " + e.message);
    process.exit(2);
  }

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    const resultater = await new AxePuppeteer(page)
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const alvorlige = resultater.violations.filter((v) => {
      const idx = TERSKLER.indexOf(v.impact || "minor");
      return idx >= minIdx;
    });

    console.log("\nTotalt brudd: " + resultater.violations.length);
    console.log("Brudd >= " + terskel + ": " + alvorlige.length);

    for (const v of resultater.violations) {
      console.log("\n[" + (v.impact || "ukjent") + "] " + v.id + " - " + v.help);
      console.log("  Hjelp: " + v.helpUrl);
      for (const node of v.nodes) {
        console.log("  Element: " + node.target.join(" > "));
        if (node.failureSummary) {
          console.log("  Hvorfor: " + node.failureSummary.replace(/\n/g, " | "));
        }
      }
    }

    process.exit(alvorlige.length > 0 ? 1 : 0);
  } catch (e) {
    console.error("Axe-kjøring feilet: " + e.message);
    process.exit(2);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
