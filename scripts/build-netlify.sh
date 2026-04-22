#!/usr/bin/env bash
# Bygger _site/ for Netlify-deploy.
# Speiler deploy-struktur: src/dashboard/* på rot, data/processed/* under /data/.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$ROOT/_site"

rm -rf "$SITE"
mkdir -p "$SITE/data"

cp "$ROOT/src/dashboard/index.html" "$SITE/"
cp "$ROOT/src/dashboard/styles.css" "$SITE/"
cp "$ROOT/src/dashboard/dashboard.js" "$SITE/"
cp "$ROOT/data/processed/country_summary.csv" "$SITE/data/"
cp "$ROOT/data/processed/metadata.json" "$SITE/data/"
# Disse er valgfrie; hoppes over hvis de ikke finnes.
cp "$ROOT/data/processed/bilateral_activities.csv" "$SITE/data/" 2>/dev/null || true
cp "$ROOT/data/processed/financial_disbursements.csv" "$SITE/data/" 2>/dev/null || true

# Sett datastier så relative URL-er peker til /data/ etter deploy.
sed -i 's|<script src="dashboard.js"></script>|<script>window.DATA_PATH="./data/country_summary.csv";window.META_PATH="./data/metadata.json";</script><script src="dashboard.js"></script>|' "$SITE/index.html"

# Erstatt lokal markdown-lenke med GitHub-lenke (krever at repoet er
# tilgjengelig; er privat i dag, men lenken er en pekepinn og skader ikke).
sed -i 's|../../docs/beslutningssaker/S2-definisjon-av-norges-stotte.md|https://github.com/marhip97/ukrainastotte/blob/main/docs/beslutningssaker/S2-definisjon-av-norges-stotte.md|' "$SITE/index.html"

echo "Ferdig. _site/ innhold:"
ls -la "$SITE" "$SITE/data"
