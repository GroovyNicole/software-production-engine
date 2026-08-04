"""Coverage: which controls are actually enforced, and — more importantly — which are not.

The number this produces is the honest answer to "how much of the standard does the engine
enforce." It is derived, never declared:

  COVERED       a gate exists, is registered, and names this control
  PLANNED       the classification says a gate should exist, and none does
  ARTIFACT      satisfied by a generated file that exists or does not
  HUMAN         requires a person; rationed, never delegated to an agent
  UNCLASSIFIED  nothing has decided what this control needs

`COVERED` cannot be faked by editing a document, because it is computed from the gate
registry. A control moves out of `PLANNED` only when code exists that claims it.

`UNCLASSIFIED` is reported separately from every other state and never folded into a total,
because "nothing has looked at this" and "this is fine" are different facts. That is
MANDATE.md rule 7 applied to the coverage report itself.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from .gates import REGISTRY

STATES = ("COVERED", "PLANNED", "ARTIFACT", "HUMAN", "UNCLASSIFIED")


def _controls_dir(repo_root: Path) -> Path:
    return repo_root / "controls"


def load_corpus(repo_root: Path) -> dict:
    """The 350 controls plus the classification, or a clear error if not extracted yet."""
    directory = _controls_dir(repo_root)
    required = ("software.json", "website.json", "classification.json")
    missing = [name for name in required if not (directory / name).exists()]
    if missing:
        raise FileNotFoundError(
            f"control corpus incomplete — missing {missing} in {directory}. "
            f"Run controls/extract_controls.py and controls/bootstrap_classification.py."
        )
    return {
        "software": json.loads((directory / "software.json").read_text(encoding="utf-8")),
        "website": json.loads((directory / "website.json").read_text(encoding="utf-8")),
        "classification": json.loads(
            (directory / "classification.json").read_text(encoding="utf-8")),
    }


def gate_manifest() -> list[dict]:
    """What every registered gate declares about itself.

    Registration is explicit (see gates/__init__.py), so a gate that exists on disk but is
    not registered contributes nothing here and its controls stay PLANNED — which is the
    correct reading: an unregistered gate does not run.
    """
    manifest = []
    for gate_id, module in REGISTRY.items():
        manifest.append({
            "id": gate_id,
            "controls": list(getattr(module, "CONTROLS", ())),
            "languages": list(getattr(module, "LANGUAGES", ["*"])),
            "failure_condition": getattr(module, "FAILURE_CONDITION", "").strip(),
        })
    return manifest


def _numeric(control_refs: list[str]) -> set[int]:
    """Control numbers a gate claims, ignoring non-register references like `rule-4`, `M2`."""
    return {int(ref) for ref in control_refs if re.fullmatch(r"\d{1,3}", ref)}


def compute(repo_root: Path) -> dict:
    corpus = load_corpus(repo_root)
    manifest = gate_manifest()

    covered_by: dict[int, list[str]] = {}
    for gate in manifest:
        for number in _numeric(gate["controls"]):
            covered_by.setdefault(number, []).append(gate["id"])

    classification = corpus["classification"]["software"]
    software_rows = []
    for entry in corpus["software"]["controls"]:
        number = entry["number"]
        planned = classification.get(str(number), {})
        planned_kind = planned.get("planned_enforcement")

        if number in covered_by:
            state = "COVERED"
        elif planned_kind == "artifact":
            state = "ARTIFACT"
        elif planned_kind == "human":
            state = "HUMAN"
        elif planned_kind == "automated":
            state = "PLANNED"
        else:
            state = "UNCLASSIFIED"

        software_rows.append({
            "id": entry["id"],
            "number": number,
            "state": state,
            "gates": covered_by.get(number, []),
            "planned_gate": planned.get("planned_gate"),
            "requires_decision": planned.get("requires_decision", False),
            "text": entry["text"],
        })

    website_rows = [
        {"id": entry["id"], "number": entry["number"], "state": "UNCLASSIFIED",
         "gates": [], "planned_gate": None, "requires_decision": False,
         "text": entry["text"]}
        for entry in corpus["website"]["controls"]
    ]

    def tally(rows: list[dict]) -> dict[str, int]:
        return {state: sum(1 for r in rows if r["state"] == state) for state in STATES}

    return {
        "gates_registered": [g["id"] for g in manifest],
        "manifest": manifest,
        "software": {"total": len(software_rows), "counts": tally(software_rows),
                     "rows": software_rows},
        "website": {"total": len(website_rows), "counts": tally(website_rows),
                    "rows": website_rows,
                    "status": corpus["classification"].get("website_status", "")},
    }


def render(report: dict, list_uncovered: int = 0) -> str:
    lines: list[str] = []
    lines.append("=" * 78)
    lines.append("CONTROL COVERAGE")
    lines.append("=" * 78)
    lines.append(f"gates registered: {', '.join(report['gates_registered'])}")
    lines.append("")

    for register in ("software", "website"):
        block = report[register]
        counts = block["counts"]
        enforced = counts["COVERED"]
        total = block["total"]
        pct = (enforced / total * 100) if total else 0.0
        lines.append(f"{register.upper()}  ({total} controls)")
        lines.append(f"  enforced by a gate today: {enforced}/{total}  ({pct:.1f}%)")
        for state in STATES:
            if state == "COVERED":
                continue
            lines.append(f"  {state:<14} {counts[state]:>4}")
        if block.get("status"):
            lines.append(f"  note: {block['status']}")
        lines.append("")

    decisions_needed = [r for r in report["software"]["rows"]
                        if r["requires_decision"] and r["state"] != "HUMAN"]
    lines.append(f"gates that need a decision-ledger entry before they can be configured: "
                 f"{len(decisions_needed)}")

    if list_uncovered:
        pending = [r for r in report["software"]["rows"] if r["state"] == "PLANNED"]
        lines.append("")
        lines.append(f"PLANNED — gate specified, not yet built ({len(pending)}):")
        for row in pending[:list_uncovered]:
            gate = row["planned_gate"] or "unassigned"
            lines.append(f"  {row['id']}  [{gate}]  {row['text'][:64]}")
        if len(pending) > list_uncovered:
            lines.append(f"  ... and {len(pending) - list_uncovered} more")

    return "\n".join(lines)
