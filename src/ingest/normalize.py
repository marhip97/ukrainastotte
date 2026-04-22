"""Normaliserer Kiel-rådata til analyseklare CSV-filer.

Leser siste XLSX i `data/raw/kiel/` (eller en angitt sti) og produserer:

- `data/processed/country_summary.csv` - aggregat per land (€ mrd).
- `data/processed/bilateral_activities.csv` - én rad per sub-aktivitet.
- `data/processed/metadata.json` - kildefilnavn, sha256, radtall, dato.

Brukes både lokalt og fra GitHub Actions (`.github/workflows/fetch-kiel.yml`)
etter at ny rådata er lagret. Fail-fast: kolonne-kontraktfeil fra
`parse_kiel` propagerer, slik at workflow kan opprette Issue (R1).
"""

from __future__ import annotations

import csv
import hashlib
import json
import sys
from dataclasses import asdict, fields
from datetime import date
from pathlib import Path

from src.ingest.parse_kiel import (
    Aktivitet,
    LandSummary,
    parse_bilateral,
    parse_country_summary,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = REPO_ROOT / "data" / "raw" / "kiel"
PROCESSED_DIR = REPO_ROOT / "data" / "processed"


def _finn_nyeste_xlsx() -> Path:
    filer = sorted(RAW_DIR.glob("*.xlsx"))
    if not filer:
        raise FileNotFoundError(f"Ingen XLSX i {RAW_DIR}")
    return filer[-1]


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def skriv_country_summary(rader: list[LandSummary], path: Path) -> None:
    feltnavn = [f.name for f in fields(LandSummary)]
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=feltnavn)
        writer.writeheader()
        for rad in rader:
            writer.writerow(asdict(rad))


def skriv_bilateral(rader: list[Aktivitet], path: Path) -> None:
    feltnavn = [f.name for f in fields(Aktivitet)] + ["verdi_eur_mrd"]
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=feltnavn)
        writer.writeheader()
        for rad in rader:
            d = asdict(rad)
            d["dato"] = rad.dato.isoformat() if rad.dato else ""
            d["verdi_eur_mrd"] = rad.verdi_eur / 1_000_000_000
            writer.writerow(d)


def normalize(xlsx_path: Path, out_dir: Path = PROCESSED_DIR) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    summary = parse_country_summary(xlsx_path)
    bilateral = parse_bilateral(xlsx_path)
    skriv_country_summary(summary, out_dir / "country_summary.csv")
    skriv_bilateral(bilateral, out_dir / "bilateral_activities.csv")
    metadata = {
        "kildefil": xlsx_path.name,
        "sha256": _sha256(xlsx_path),
        "antall_land_summary": len(summary),
        "antall_bilateral_rader": len(bilateral),
        "prosessert_dato": date.today().isoformat(),
    }
    (out_dir / "metadata.json").write_text(
        json.dumps(metadata, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return metadata


def main(argv: list[str]) -> int:
    if len(argv) > 1:
        xlsx_path = Path(argv[1])
    else:
        xlsx_path = _finn_nyeste_xlsx()
    metadata = normalize(xlsx_path)
    print(json.dumps(metadata, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
