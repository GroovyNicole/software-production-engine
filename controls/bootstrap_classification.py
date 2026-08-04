#!/usr/bin/env python3
"""Seed `controls/classification.json` from the gate-family table in PLAN.md.

Run once. After this, `classification.json` is the authority and PLAN.md is the historical
record of how it was derived.

Design point that matters: this file records only the **non-automated** classifications —
`artifact` and `human`. A control is never marked `automated` here, because "a gate enforces
this" is a claim that must be proven by a gate existing and declaring the control, not by an
entry in a file. `coverage.py` derives the automated set from the gate registry. That way
the coverage number cannot be inflated by editing a document.

Controls the plan marks automated but that have no gate yet appear in the coverage report as
PLANNED — distinct from COVERED and distinct from UNCLASSIFIED.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
PLAN = REPO_ROOT / "PLAN.md"
OUT = REPO_ROOT / "controls" / "classification.json"

SOFTWARE_START = "#### Software controls 1–200"
SOFTWARE_END = "#### Website controls 1–150"


def parse_plan_table() -> dict[int, dict]:
    text = PLAN.read_text(encoding="utf-8")
    block = text[text.index(SOFTWARE_START):text.index(SOFTWARE_END)]

    rows: dict[int, dict] = {}
    for line in block.splitlines():
        if not line.startswith("| "):
            continue
        cells = [c.strip() for c in line.split("|")[1:-1]]
        if len(cells) < 3:
            continue
        numbers = [int(n) for n in re.findall(r"\b(\d{1,3})\b", cells[0])
                   if 1 <= int(n) <= 200]
        if not numbers:
            continue

        family = cells[1]
        kind = cells[2].lower()
        gate_name = re.search(r"`([a-z0-9\-]+)`", family)

        if "human" in kind and "automated" in kind:
            enforcement, requires_decision = "automated", True
        elif "human" in kind:
            enforcement, requires_decision = "human", False
        elif "artifact" in kind:
            enforcement, requires_decision = "artifact", False
        else:
            enforcement, requires_decision = "automated", False

        for number in numbers:
            rows[number] = {
                "planned_enforcement": enforcement,
                "planned_gate": gate_name.group(1) if gate_name else None,
                "requires_decision": requires_decision,
                "family_note": re.sub(r"\s+", " ", family)[:200],
            }
    return rows


def main() -> int:
    planned = parse_plan_table()

    missing = sorted(set(range(1, 201)) - set(planned))
    if missing:
        raise SystemExit(f"FAIL: PLAN.md leaves these software controls unmapped: {missing}")

    payload = {
        "_note": ("Non-automated classifications and planned enforcement. A control is "
                  "never marked automated here — coverage.py derives that from gates that "
                  "actually exist and declare it."),
        "software": {str(n): planned[n] for n in sorted(planned)},
        "website": {},
        "website_status": ("UNCLASSIFIED — all 150 website controls await classification. "
                           "PLAN.md Phase 3 maps them by module range only. Reporting them "
                           "as anything else would be a claim without a basis."),
    }
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    counts: dict[str, int] = {}
    for entry in planned.values():
        counts[entry["planned_enforcement"]] = counts.get(entry["planned_enforcement"], 0) + 1
    print(f"OK  software: {len(planned)} controls classified -> "
          f"{OUT.relative_to(REPO_ROOT)}")
    for kind in sorted(counts):
        print(f"      planned {kind}: {counts[kind]}")
    print(f"      of which need a ledger decision to configure: "
          f"{sum(1 for e in planned.values() if e['requires_decision'])}")
    print("    website: 0 classified, 150 UNCLASSIFIED (reported, not assumed)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
