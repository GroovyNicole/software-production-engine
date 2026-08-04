"""Gate: module-size.

Flags source files large enough that nobody can hold them in their head.

Origin (portfolio-evidence.md, Finding 5 and the fapp sweep): `console.py` is 4,551 lines,
`main.py` 2,104, `store.py` 1,264, and `genealogy-database/platform/app/static/app.js` is
1,949. `fapp-claudedev/CLAUDE.md` section 1 mandates a domain / application / infrastructure
/ web split. No such split exists — 141 modules sit flat in the repository root.

Size is the measurable half of that. A file past a few hundred lines cannot be reviewed in
one pass, which is the mechanism behind control 172 (maintainable by someone other than the
person or AI session that built it) and control 173 (architecture documentation describes
components and boundaries — a 4,500-line module has no describable boundary).

Thresholds are deliberately generous. The purpose is to catch runaway growth, not to police
style, and a gate that fires on ordinary files gets switched off.
"""

from __future__ import annotations

from pathlib import Path

from ..core import Finding, read_lines, waived

GATE_ID = "module-size"
CONTROLS = ("172", "173")
LANGUAGES = ["python", "javascript", "typescript", "php", "ruby", "go", "java", "csharp"]
FAILURE_CONDITION = (
    "A single source file exceeding 1500 lines (high) or 800 lines (medium), with no "
    "inline `spe:allow module-size` waiver stating why it must stay whole."
)

HIGH_THRESHOLD = 1500
MEDIUM_THRESHOLD = 800


def scan(path: Path, rel_path: str) -> list[Finding]:
    lines = read_lines(path)
    if lines is None:
        return []

    count = len(lines)
    if count < MEDIUM_THRESHOLD:
        return []

    severity = "high" if count >= HIGH_THRESHOLD else "medium"
    threshold = HIGH_THRESHOLD if severity == "high" else MEDIUM_THRESHOLD

    # A waiver for a whole-file property belongs at the top of the file, so only the first
    # few lines are consulted. Anchoring it to line 1 also keeps it visible to anyone
    # opening the file rather than buried a thousand lines down.
    if any(waived(lines, i, GATE_ID) for i in range(min(10, count))):
        return []

    return [Finding(
        gate=GATE_ID,
        severity=severity,
        file=rel_path,
        line=1,
        message=(f"{count} lines, over the {threshold}-line limit. A file this size cannot "
                 f"be reviewed in one pass or described as a component. Split it, or "
                 f"declare it with `spe:allow {GATE_ID} — <reason>` near the top."),
        snippet=f"{count} lines",
        controls=CONTROLS,
    )]
