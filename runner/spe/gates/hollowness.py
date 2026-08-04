"""Gate: hollowness.

Detects markers that record unfinished work inside shipped code — where nobody reads them.

Origin (portfolio-evidence.md): 110 markers in `fapp-claudedev`, 59 in `genealogy-database`,
21 in `blg-website`. The marker itself is not the defect; its invisibility is. An agent
writing `# TODO: handle the failure case` has recorded that it did not do the job, in the
one place the person who asked for the job will never look. The code reads as complete.

`fapp-claudedev/UNRESOLVED.txt` is this list maintained by hand. The gate makes it
automatic and impossible to skip.

Controls: MANDATE.md M2 (completion bias — a stub that looks finished scores like
finished); software control 172 (maintainable by someone other than the original builder).
"""

from __future__ import annotations

import re
from pathlib import Path

from ..core import Finding, read_lines, waived

GATE_ID = "hollowness"
CONTROLS = ("M2", "172")
LANGUAGES = ["python", "javascript", "typescript", "php", "sql", "ruby", "go", "java", "csharp"]
FAILURE_CONDITION = (
    "A marker in non-test production code stating the work is unfinished: "
    "NotImplementedError, TODO, FIXME, XXX, HACK, placeholder, 'for now', 'temporary'."
)

# Two tiers, because they carry different weight.
#
# Tier 1 — an explicit statement that the code does not work. These are unambiguous.
# Tier 2 — conventional "come back to this" markers. Common, often benign, still evidence
# of deferred work that no one is tracking.
#
# Case-sensitive for the conventional all-caps markers so ordinary prose containing "hack"
# or "todo" in a sentence does not trigger. Case-insensitive for the phrases, which are
# written naturally.
PATTERNS = (
    (re.compile(r"\bNotImplementedError\b"),
     "high", "raises NotImplementedError — this code path does not work"),
    (re.compile(r"\bnot implemented\b|\bunimplemented\b", re.IGNORECASE),
     "high", "marked not implemented"),
    (re.compile(r"\bplaceholder\b|\bdummy (data|value|impl)", re.IGNORECASE),
     "high", "placeholder or dummy value in production code"),
    (re.compile(r"\bfor now\b|\btemporar(y|ily)\b|\bquick fix\b", re.IGNORECASE),
     "medium", "marked as temporary — deferred work with no tracked owner"),
    (re.compile(r"\bTODO\b|\bFIXME\b"),
     "medium", "TODO/FIXME marker — deferred work recorded where no one will read it"),
    (re.compile(r"\bXXX\b|\bHACK\b"),
     "low", "XXX/HACK marker — known compromise recorded in code"),
)

# `stub` is deliberately absent from the pattern list. It appears constantly in legitimate
# identifiers (`stub_response` in test helpers, `StubClient` in adapters), and every
# occurrence it would catch in production code is already caught by the placeholder or
# not-implemented patterns above. Including it produced noise without adding signal.


def scan(path: Path, rel_path: str) -> list[Finding]:
    """Return every unwaived hollowness marker in one file.

    Note this gate is intentionally line-based and does not distinguish comments from code:
    a TODO is almost always in a comment, and that is exactly the case being reported.
    """
    lines = read_lines(path)
    if lines is None:
        return []

    findings: list[Finding] = []
    for index, raw_line in enumerate(lines):
        stripped = raw_line.strip()
        if not stripped:
            continue

        for pattern, severity, message in PATTERNS:
            if not pattern.search(raw_line):
                continue
            if waived(lines, index, GATE_ID):
                break
            findings.append(Finding(
                gate=GATE_ID,
                severity=severity,
                file=rel_path,
                line=index + 1,
                message=(f"{message}. Finish it, or promote it to the deviation ledger "
                         f"where it is visible."),
                snippet=stripped[:140],
                controls=CONTROLS,
            ))
            break  # highest-severity match wins; patterns are ordered most-severe first

    return findings
