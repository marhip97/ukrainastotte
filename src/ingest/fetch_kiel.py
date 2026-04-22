"""Henter siste XLSX fra Kiel Ukraine Support Tracker sin publiseringsside.

Brukes både lokalt (`python -m src.ingest.fetch_kiel`) og fra GitHub Actions.
Skrive rådata uendret til `data/raw/`; all normalisering skjer andre steder.

Adferd:
- Henter HTML fra publiseringssiden og leter etter første XLSX-lenke.
- Laster ned filen og lagrer den under `data/raw/kiel/<dato>_<filnavn>.xlsx`.
- Hvis filen er identisk med forrige nedlasting (samme sha256), hoppes
  lagring over og skriptet avslutter med exit-kode 0 uten endring.
- Ved strukturelle endringer (ingen XLSX-lenke funnet) avsluttes med
  exit-kode 2 slik at GitHub Actions kan opprette Issue.
"""

from __future__ import annotations

import hashlib
import re
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

PUBLICATION_URL = (
    "https://www.kielinstitut.de/publications/ukraine-support-tracker-data-6453/"
)
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
XLSX_PATTERN = re.compile(r'href="([^"]+\.xlsx)"', re.IGNORECASE)

REPO_ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = REPO_ROOT / "data" / "raw" / "kiel"


def _fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def _find_xlsx_url(html: str, base_url: str) -> str | None:
    for match in XLSX_PATTERN.finditer(html):
        candidate = urllib.parse.urljoin(base_url, match.group(1))
        if "ukraine" in candidate.lower() or "tracker" in candidate.lower():
            return candidate
    match = XLSX_PATTERN.search(html)
    return urllib.parse.urljoin(base_url, match.group(1)) if match else None


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _existing_hashes() -> set[str]:
    if not RAW_DIR.exists():
        return set()
    return {_sha256(p.read_bytes()) for p in RAW_DIR.glob("*.xlsx")}


def main() -> int:
    html_bytes = _fetch(PUBLICATION_URL)
    html = html_bytes.decode("utf-8", errors="replace")
    xlsx_url = _find_xlsx_url(html, PUBLICATION_URL)
    if xlsx_url is None:
        print("FEIL: fant ingen XLSX-lenke på publiseringssiden.", file=sys.stderr)
        return 2
    data = _fetch(xlsx_url)
    if _sha256(data) in _existing_hashes():
        print(f"Uendret siden sist - ingen ny fil lagret ({xlsx_url}).")
        return 0
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    filename = Path(urllib.parse.urlparse(xlsx_url).path).name
    target = RAW_DIR / f"{date.today().isoformat()}_{filename}"
    target.write_bytes(data)
    print(f"Lagret {target.relative_to(REPO_ROOT)} ({len(data)} bytes) fra {xlsx_url}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
