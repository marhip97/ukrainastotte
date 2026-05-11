#!/usr/bin/env bash
# Bygger _site/ for statisk deploy (GitHub Pages eller andre verter).
# Speiler deploy-struktur: src/dashboard/* på rot, data/processed/* under /data/.
# GitHub Pages serverer fra under /ukrainastotte/, så alle datasti-
# referanser bruker relative ./-paths slik at det fungerer uavhengig
# av hosting-prefiks.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$ROOT/_site"

rm -rf "$SITE"
mkdir -p "$SITE/data"

cp "$ROOT/src/dashboard/index.html" "$SITE/"
cp "$ROOT/src/dashboard/tokens.css" "$SITE/"
cp "$ROOT/src/dashboard/styles.css" "$SITE/"
cp "$ROOT/src/dashboard/dashboard.js" "$SITE/"
cp "$ROOT/data/processed/country_summary.csv" "$SITE/data/"
cp "$ROOT/data/processed/metadata.json" "$SITE/data/"
# Disse er valgfrie; hoppes over hvis de ikke finnes.
cp "$ROOT/data/processed/bilateral_activities.csv" "$SITE/data/" 2>/dev/null || true
cp "$ROOT/data/processed/financial_disbursements.csv" "$SITE/data/" 2>/dev/null || true
cp "$ROOT/data/processed/country_summary_relative.csv" "$SITE/data/" 2>/dev/null || true
cp "$ROOT/data/processed/country_summary_endring.csv" "$SITE/data/" 2>/dev/null || true
cp "$ROOT/data/processed/tidsserier_maanedlig.csv" "$SITE/data/" 2>/dev/null || true
cp "$ROOT/data/processed/country_summary_nok.csv" "$SITE/data/" 2>/dev/null || true
cp "$ROOT/data/processed/endringstekst.json" "$SITE/data/" 2>/dev/null || true
cp "$ROOT/data/processed/country_summary_eu.csv" "$SITE/data/" 2>/dev/null || true
cp "$ROOT/data/processed/country_summary_aar.csv" "$SITE/data/" 2>/dev/null || true
mkdir -p "$SITE/data/reference"
cp "$ROOT/data/reference/valutakurser.json" "$SITE/data/reference/" 2>/dev/null || true

# Sett datastier så relative URL-er peker til /data/ etter deploy.
sed -i 's|<script src="dashboard.js"></script>|<script>window.DATA_PATH="./data/country_summary.csv";window.META_PATH="./data/metadata.json";window.DISB_PATH="./data/financial_disbursements.csv";window.REL_PATH="./data/country_summary_relative.csv";window.ENDR_PATH="./data/country_summary_endring.csv";window.TIDSSERIE_PATH="./data/tidsserier_maanedlig.csv";window.ENDRTEKST_PATH="./data/endringstekst.json";window.NOK_PATH="./data/country_summary_nok.csv";window.BILATERAL_PATH="./data/bilateral_activities.csv";window.VALUTAKURSER_PATH="./data/reference/valutakurser.json";window.EU_PATH="./data/country_summary_eu.csv";window.AAR_PATH="./data/country_summary_aar.csv";</script><script src="dashboard.js"></script>|' "$SITE/index.html"

# Erstatt lokale markdown-lenker med GitHub-lenker. Repoet er offentlig
# fra 2026-04-26 i forbindelse med flytting til GitHub Pages.
sed -i 's|../../docs/beslutningssaker/S2-definisjon-av-norges-stotte.md|https://github.com/marhip97/ukrainastotte/blob/main/docs/beslutningssaker/S2-definisjon-av-norges-stotte.md|' "$SITE/index.html"
sed -i 's|../../docs/beslutningssaker/S6-kilde-bnp-folketall.md|https://github.com/marhip97/ukrainastotte/blob/main/docs/beslutningssaker/S6-kilde-bnp-folketall.md|' "$SITE/index.html"

echo "Ferdig. _site/ innhold:"
ls -la "$SITE" "$SITE/data"
