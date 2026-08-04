"""Scope lock: refuse work that reaches outside what was authorized.

Origin: on 2026-08-02 the builder drifted from building the engine into planning repairs to
`fapp-claudedev`, which is test corpus and explicitly out of scope. A human caught it.
Nothing mechanical did. On 2026-08-04 two checks were proposed that corresponded to no rule
in the owner's standard — the same failure in a different place.

Both are the same mechanism: the builder deciding what the work covers. `MANDATE.md` M1.

This module answers the question "did this change stay inside what was authorized" with a
file comparison rather than an assurance. Before work begins, `scope.lock` declares the
paths that may be touched. Afterwards, the changed files are compared against it. Anything
outside is a failure, whether or not it was a good idea.

Deliberately unforgiving: a change outside scope does not become acceptable because it was
small, correct, or convenient. That judgment is precisely the one being removed.
"""

from __future__ import annotations

import fnmatch
import json
import subprocess
from pathlib import Path

from .core import Finding

GATE_ID = "scope-lock"
CONTROLS = ("172",)
LANGUAGES = ["*"]
FAILURE_CONDITION = (
    "A file changed since the declared base that matches no glob in scope.lock, or a "
    "scope.lock with no stated authorization."
)

LOCK_FILENAME = "scope.lock"


def load_lock(root: Path) -> dict | None:
    """The declared scope, or None when no lock file exists."""
    path = root / LOCK_FILENAME
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def changed_files(root: Path, base: str) -> list[str] | None:
    """Files changed since `base`, or None when git cannot answer.

    None means unknown, and unknown is never treated as empty — the caller reports that the
    scope could not be verified rather than reporting that it was respected.
    """
    try:
        proc = subprocess.run(
            ["git", "-C", str(root), "diff", "--name-only", base, "--"],
            capture_output=True, text=True, check=True, timeout=60,
        )
    # spe:allow silent-failure — None is the recorded failure state; check() converts it
    # into an explicit "scope could not be verified" finding rather than silence
    except (OSError, subprocess.SubprocessError):
        return None
    return [line.strip() for line in proc.stdout.splitlines() if line.strip()]


def check(root: Path, base: str = "origin/main") -> list[Finding]:
    """Compare what changed against what was authorized."""
    lock = load_lock(root)
    if lock is None:
        return [Finding(
            gate=GATE_ID, severity="high", file=LOCK_FILENAME, line=0,
            message=("no scope.lock declares what this work may touch, so nothing can "
                     "verify that it stayed inside authorization."),
            controls=CONTROLS)]

    if not str(lock.get("authorized_by", "")).strip():
        return [Finding(
            gate=GATE_ID, severity="high", file=LOCK_FILENAME, line=0,
            message="scope.lock names no one who authorized this work.",
            controls=CONTROLS)]

    allowed = tuple(lock.get("allowed_paths", []))
    if not allowed:
        return [Finding(
            gate=GATE_ID, severity="high", file=LOCK_FILENAME, line=0,
            message="scope.lock declares no allowed paths.", controls=CONTROLS)]

    changed = changed_files(root, base)
    if changed is None:
        return [Finding(
            gate=GATE_ID, severity="high", file=LOCK_FILENAME, line=0,
            message=(f"scope could not be verified: no git diff available against "
                     f"{base!r}. Unverified is not the same as clean."),
            controls=CONTROLS)]

    findings: list[Finding] = []
    for path in changed:
        if path == LOCK_FILENAME:
            continue
        if any(fnmatch.fnmatch(path, pattern) for pattern in allowed):
            continue
        findings.append(Finding(
            gate=GATE_ID, severity="high", file=path, line=0,
            message=(f"changed outside the authorized scope. scope.lock allows "
                     f"{list(allowed)}. Being a small or correct change does not put it "
                     f"back in scope."),
            controls=CONTROLS))
    return findings


def render(findings: list[Finding], root: Path) -> str:
    lock = load_lock(root)
    header = "SCOPE CHECK"
    if lock:
        header += f" — {lock.get('phase', 'unnamed')} (authorized by " \
                  f"{lock.get('authorized_by', 'nobody')})"
    lines = ["=" * 78, header, "=" * 78]
    if not findings:
        lines.append("In scope. Every changed file matches the declared paths.")
    else:
        lines.append(f"OUT OF SCOPE — {len(findings)} problem(s):")
        for finding in findings:
            lines.append(f"  {finding.file}")
            lines.append(f"      {finding.message}")
    return "\n".join(lines)
