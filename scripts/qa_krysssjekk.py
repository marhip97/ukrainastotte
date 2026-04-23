"""QA-krysssjekk av dashboardets tall mot lokale og eksterne referanser.

Kjører fire sett sjekker og skriver rapport til stdout. Exit-kode er 0
hvis alle ok, 1 hvis noen feiler.

1. Intern konsistens i country_summary:
   - Komponent-sum (mil+fin+hum) matcher total (toleranse 0.05 mrd).
   - Commitment >= Allocation per land.
2. Bilateral mot summary:
   - Sum av bilateral allocation-rader for Norge ligger innenfor 20 %
     av summary.total_allocation (Kiel har kjente avvik her - se
     kartleggingsnotatet).
3. Disbursement mot summary:
   - Sum av finansielle utbetalinger for et land <= summary
     financial_allocation + buffer.
4. Sammenligning mot kjente Kiel-headlinetall:
   - Nordic-hypotesen: Norge, Sverige, Danmark er blant topp 5 på
     BNP-andel (Kiel Policy Brief Feb 2026 hevder alle tre > 0.6 % i
     militær aid).
   - Norges absolutte nivå rundt 10 mrd EUR totalt.
"""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
PROC = REPO / "data" / "processed"


def _les_csv(sti: Path) -> list[dict]:
    with sti.open() as fh:
        return list(csv.DictReader(fh))


def _f(v: str) -> float:
    try:
        return float(v)
    except (ValueError, TypeError):
        return 0.0


# Kjente dataavvik i Kiels rådata (se docs/qa/qa-rapport-release28.md).
# Disse teller som "observert", ikke kritisk feil.
KJENTE_COMMITMENT_UNDER_ALLOCATION = {"Australia", "Ireland", "Italy", "Slovakia"}
KJENTE_DISB_OVER_FINALLOC = {"Germany", "United Kingdom"}


def krysssjekk() -> tuple[int, int, int, list[str]]:
    ok = 0
    kritisk = 0
    observert = 0
    linjer: list[str] = []

    summary = _les_csv(PROC / "country_summary.csv")
    bilateral = _les_csv(PROC / "bilateral_activities.csv")
    disbursements = _les_csv(PROC / "financial_disbursements.csv")
    relative = _les_csv(PROC / "country_summary_relative.csv")

    linjer.append("## 1. Intern konsistens i country_summary\n")
    for r in summary:
        mil = _f(r["military_allocation"])
        fin = _f(r["financial_allocation"])
        hum = _f(r["humanitarian_allocation"])
        tot = _f(r["total_allocation"])
        diff = abs(mil + fin + hum - tot)
        if diff > 0.05:
            kritisk += 1
            linjer.append(
                f"- KRITISK: {r['land']}: mil+fin+hum={mil+fin+hum:.3f} vs "
                f"total={tot:.3f} (diff={diff:.3f})"
            )
        else:
            ok += 1
        tot_c = _f(r["total_commitment"])
        if tot_c + 0.0001 < tot:
            if r["land"] in KJENTE_COMMITMENT_UNDER_ALLOCATION:
                observert += 1
                linjer.append(
                    f"- OBSERVERT: {r['land']}: commitment ({tot_c:.3f}) "
                    f"< allocation ({tot:.3f}) - dokumentert i QA-rapport."
                )
            else:
                kritisk += 1
                linjer.append(
                    f"- KRITISK (ny): {r['land']}: commitment ({tot_c:.3f}) "
                    f"< allocation ({tot:.3f})"
                )
        else:
            ok += 1
    linjer.append(f"Resultat: {ok} OK, {kritisk} kritiske, {observert} observerte.\n")

    linjer.append("## 2. Bilateral (Norge) mot summary-total\n")
    norge_bil = [r for r in bilateral if r["giver"] == "Norway"
                 and r["maal"] in ("Allocation", "allocation")]
    norge_bil_sum = sum(_f(r["verdi_eur_mrd"]) for r in norge_bil)
    norge_sum = next((r for r in summary if r["land"] == "Norway"), None)
    if norge_sum is None:
        kritisk += 1
        linjer.append("- KRITISK: Norge finnes ikke i summary.")
    else:
        total_alloc = _f(norge_sum["total_allocation"])
        avvik = abs(norge_bil_sum - total_alloc) / total_alloc if total_alloc else 0
        linjer.append(
            f"- Norge bilateral allocation sum: {norge_bil_sum:.3f} mrd EUR"
        )
        linjer.append(f"- Norge summary total_allocation: {total_alloc:.3f} mrd EUR")
        linjer.append(f"- Relativt avvik: {avvik*100:.1f} %")
        if avvik > 0.20:
            kritisk += 1
            linjer.append(
                "- KRITISK: avvik over 20 % mellom bilateral og summary."
            )
        else:
            ok += 1
            linjer.append("- OK: innenfor forventet avvik.")
    linjer.append("")

    linjer.append("## 3. Disbursement mot financial_allocation\n")
    per_giver: dict[str, float] = {}
    for r in disbursements:
        per_giver[r["giver"]] = per_giver.get(r["giver"], 0.0) + _f(r["verdi_eur_mrd"])
    for land, utbetalt in per_giver.items():
        sumrad = next((r for r in summary if r["land"] == land), None)
        if sumrad is None:
            continue
        fin_alloc = _f(sumrad["financial_allocation"])
        if utbetalt > fin_alloc + 0.05:
            if land in KJENTE_DISB_OVER_FINALLOC:
                observert += 1
                linjer.append(
                    f"- OBSERVERT: {land} utbetalt {utbetalt:.3f} > "
                    f"financial_allocation {fin_alloc:.3f} - dokumentert."
                )
            else:
                kritisk += 1
                linjer.append(
                    f"- KRITISK (ny): {land} utbetalt {utbetalt:.3f} > "
                    f"financial_allocation {fin_alloc:.3f}"
                )
        else:
            ok += 1
    linjer.append(
        f"Resultat: {ok} OK totalt, {kritisk} kritiske, {observert} observerte.\n"
    )

    linjer.append("## 4. Eksterne referanser (Kiel Policy Brief Feb 2026)\n")
    linjer.append(
        "Kilde: Kiel Institute, *Ukraine Support Tracker - Europe Steps Up* "
        "(policy brief/news, februar 2026). Utdrag fra offentlig WebSearch:"
    )
    linjer.append(
        "  - 'Norway allocated EUR 3.6 billion in military aid in 2025.'"
    )
    linjer.append(
        "  - 'All three Nordic countries (Sweden, Norway, and Denmark) "
        "surpassed 0.6% of GDP in military aid - a level unmatched elsewhere "
        "in Europe.'"
    )
    linjer.append(
        "  - 'Norway allocated 0.25 percent of GDP in aid to Ukraine' (2025 alene)."
    )
    linjer.append("")

    norge_rel = next((r for r in relative if r["land"] == "Norway"), None)
    sverige_rel = next((r for r in relative if r["land"] == "Sweden"), None)
    danmark_rel = next((r for r in relative if r["land"] == "Denmark"), None)
    linjer.append("Våre tall (kumulativt 2022-2024 mot 2024-BNP):")
    if norge_rel:
        linjer.append(
            f"  - Norge: andel_bnp={_f(norge_rel['andel_bnp_pct']):.2f} %, "
            f"per_capita={_f(norge_rel['per_capita_eur']):.0f} EUR"
        )
    if sverige_rel:
        linjer.append(
            f"  - Sverige: andel_bnp={_f(sverige_rel['andel_bnp_pct']):.2f} %"
        )
    if danmark_rel:
        linjer.append(
            f"  - Danmark: andel_bnp={_f(danmark_rel['andel_bnp_pct']):.2f} %"
        )

    sortert_bnp = sorted(
        [r for r in relative if r["andel_bnp_pct"]],
        key=lambda r: -_f(r["andel_bnp_pct"]),
    )
    topp5 = [r["land"] for r in sortert_bnp[:5]]
    linjer.append(f"\nTopp 5 på BNP-andel: {topp5}")
    nordic_i_topp5 = sum(1 for n in ["Norway", "Sweden", "Denmark"] if n in topp5)
    if nordic_i_topp5 == 3:
        ok += 1
        linjer.append(
            "- OK: Alle tre nordiske land i topp 5 på BNP-andel (bekrefter Kiel)."
        )
    elif nordic_i_topp5 >= 2:
        ok += 1
        linjer.append(
            f"- DELVIS OK: {nordic_i_topp5} av 3 nordiske i topp 5 - verifiser."
        )
    else:
        kritisk += 1
        linjer.append(
            "- KRITISK: færre enn 2 nordiske i topp 5. Bryter Kiels headline."
        )

    # Norges absolutte nivå
    if norge_sum:
        total = _f(norge_sum["total_allocation"])
        linjer.append(
            f"\nNorges kumulative total_allocation: {total:.2f} mrd EUR"
        )
        if 8.0 <= total <= 14.0:
            ok += 1
            linjer.append(
                "- OK: i forventet intervall 8-14 mrd EUR for release 28 "
                "(ref. Kiel 3.6 mrd i 2025 alene + tidligere år)."
            )
        else:
            kritisk += 1
            linjer.append("- KRITISK: utenfor forventet intervall.")

    linjer.append("")
    linjer.append(
        f"## Totalt: {ok} OK, {kritisk} kritiske feil, {observert} observerte avvik."
    )
    return ok, kritisk, observert, linjer


def main() -> int:
    ok, kritisk, observert, linjer = krysssjekk()
    print("\n".join(linjer))
    return 0 if kritisk == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
