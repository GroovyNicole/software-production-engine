"""Core types and file discovery for the Software Production Engine gate runner.

This module is deliberately pure: it knows how to find files, read them, hold findings, and
render a report. It contains no gate logic and performs no I/O beyond reading source files
and the config. Gates live in `spe.gates`; the command-line surface lives in `spe.cli`.

Layering rule (MANDATE.md 7.1 — the runner is subject to its own principles):
    core  <-  gates  <-  cli
Nothing in core may import from gates or cli.
"""

from __future__ import annotations

import fnmatch
import json
import os
import re
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Iterable, Iterator


# --------------------------------------------------------------------------------------
# Findings
# --------------------------------------------------------------------------------------

# Severity is advisory in report-only mode. It exists so that when blocking mode is turned
# on later, a project can choose a threshold ("block on high, warn on medium") rather than
# facing an all-or-nothing switch — which is how gate systems get disabled wholesale.
SEVERITIES = ("high", "medium", "low", "info")


@dataclass(frozen=True)
class Finding:
    """One violation, anchored to an exact file and line so it is actionable, not advisory."""

    gate: str            # gate id, e.g. "delete-allowlist"
    severity: str        # one of SEVERITIES
    file: str            # path relative to the scanned root
    line: int            # 1-indexed; 0 means "file-level, no specific line"
    message: str         # what is wrong, in plain language
    snippet: str = ""    # the offending source line, trimmed
    controls: tuple[str, ...] = ()   # which register controls / rules this enforces

    def as_dict(self) -> dict:
        d = asdict(self)
        d["controls"] = list(self.controls)
        return d


@dataclass
class ScanResult:
    """Everything one run produced. Serialized to findings.json verbatim."""

    root: str
    findings: list[Finding] = field(default_factory=list)
    files_scanned: int = 0
    files_unreadable: list[str] = field(default_factory=list)
    gates_run: list[str] = field(default_factory=list)
    mode: str = "report-only"

    def add(self, finding: Finding) -> None:
        self.findings.append(finding)

    def by_gate(self) -> dict[str, list[Finding]]:
        out: dict[str, list[Finding]] = {}
        for f in self.findings:
            out.setdefault(f.gate, []).append(f)
        return out

    def as_dict(self) -> dict:
        return {
            "root": self.root,
            "mode": self.mode,
            "gates_run": self.gates_run,
            "files_scanned": self.files_scanned,
            "files_unreadable": self.files_unreadable,
            "total_findings": len(self.findings),
            "findings_by_gate": {g: len(v) for g, v in self.by_gate().items()},
            "findings": [f.as_dict() for f in self.findings],
        }


# --------------------------------------------------------------------------------------
# Inline waivers
# --------------------------------------------------------------------------------------

# A waiver is written as a comment on the offending line or the line immediately above it:
#
#     c.execute("DELETE FROM mcp_codes WHERE code = ?", (code,))  # spe:allow delete-allowlist — expired OAuth codes
#
# Anchoring waivers to a comment rather than to a file+line number in a config file is
# deliberate: line numbers drift with every edit, so a config-anchored waiver silently
# detaches from the code it was meant to cover and starts excusing something else. A
# comment moves with the line it belongs to and is visible to anyone reading the code.
#
# A reason is REQUIRED. `# spe:allow delete-allowlist` with no reason does not waive —
# that keeps a waiver from becoming a reflex.
WAIVER_RE = re.compile(
    r"spe:allow\s+(?P<gate>[a-z0-9\-]+)\s*(?:[-—:]\s*)(?P<reason>\S.*)$",
    re.IGNORECASE,
)


# Comment openers, used to walk upward through an explanation block above a line.
_COMMENT_STARTS = ("#", "//", "--", "*", "/*")


def _is_waiver_for(line: str, gate: str) -> bool:
    m = WAIVER_RE.search(line)
    return bool(m and m.group("gate").lower() == gate.lower() and m.group("reason").strip())


def waived(lines: list[str], index: int, gate: str) -> bool:
    """True when line `index` (0-based) carries a valid waiver for `gate`.

    Checks the line itself, then walks upward through the contiguous block of comment lines
    directly above it. Walking the whole block matters because a waiver worth granting
    usually needs more than one line to justify, and a reason that has to fit on one line
    gets written as "ok" — which defeats the requirement that a reason exist at all.
    """
    if 0 <= index < len(lines) and _is_waiver_for(lines[index], gate):
        return True

    i = index - 1
    while i >= 0:
        stripped = lines[i].strip()
        if not stripped.startswith(_COMMENT_STARTS):
            break  # the comment block ended; stop before unrelated code
        if _is_waiver_for(lines[i], gate):
            return True
        i -= 1
    return False


# --------------------------------------------------------------------------------------
# File discovery
# --------------------------------------------------------------------------------------

# Directories that never contain first-party source. Scanning them produces noise that
# buries real findings, which is the fastest way to make a gate untrusted.
DEFAULT_EXCLUDE_DIRS = (
    ".git", ".hg", ".svn",
    "node_modules", "vendor", "bower_components",
    "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache",
    "venv", ".venv", "env", ".env.d", "site-packages",
    "dist", "build", ".next", ".nuxt", "out", "coverage",
    ".idea", ".vscode",
)

# Extensions the runner understands. Anything else is skipped rather than guessed at.
SOURCE_EXTENSIONS = (
    ".py", ".pyi",
    ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx",
    ".php",
    ".sql",
    ".rb", ".go", ".java", ".cs",
)

# Test code is excluded from all three v1 gates. A deferred-work marker in a test, a
# swallowed exception in a fixture, and row removal in test setup are all normal and
# harmless; flagging them trains the reader to ignore output. If a gate later needs to
# cover tests, it opts in explicitly.
TEST_PATH_MARKERS = ("/tests/", "/test/", "/__tests__/", "/spec/", "/fixtures/")
TEST_NAME_PATTERNS = ("test_*", "*_test.*", "*.test.*", "*.spec.*", "conftest.py")


def is_test_path(rel_path: str) -> bool:
    """True when a path is test code by directory or by filename convention."""
    normalized = "/" + rel_path.replace(os.sep, "/")
    if any(marker in normalized for marker in TEST_PATH_MARKERS):
        return True
    name = os.path.basename(rel_path)
    return any(fnmatch.fnmatch(name, pattern) for pattern in TEST_NAME_PATTERNS)


def discover(root: Path, extra_excludes: Iterable[str] = ()) -> Iterator[Path]:
    """Yield first-party source files beneath `root`, skipping vendored and generated trees.

    `extra_excludes` are glob patterns matched against the path relative to root, so a
    project can exclude a directory the defaults do not know about.
    """
    extra = tuple(extra_excludes)
    for dirpath, dirnames, filenames in os.walk(root):
        # Prune in place so os.walk does not descend into excluded trees at all.
        dirnames[:] = [d for d in dirnames if d not in DEFAULT_EXCLUDE_DIRS]
        for filename in filenames:
            path = Path(dirpath) / filename
            if path.suffix.lower() not in SOURCE_EXTENSIONS:
                continue
            rel = str(path.relative_to(root))
            if any(fnmatch.fnmatch(rel, pattern) for pattern in extra):
                continue
            yield path


def read_lines(path: Path) -> list[str] | None:
    """Return a file's lines, or None when it cannot be read as text.

    Returning None rather than swallowing the error is deliberate: the caller records the
    unreadable file in the report. A file the runner could not examine is not a file that
    passed — treating those two states as the same is exactly the silent-failure pattern
    this runner exists to detect.
    """
    try:
        return path.read_text(encoding="utf-8", errors="replace").splitlines()
    # spe:allow silent-failure — the None return IS the recorded failure state; the caller
    # adds the path to ScanResult.files_unreadable and the report prints it explicitly
    except (OSError, UnicodeError):
        return None


# --------------------------------------------------------------------------------------
# Config
# --------------------------------------------------------------------------------------

DEFAULT_CONFIG: dict = {
    "exclude": [],
    "gates": {
        "delete-allowlist": {"enabled": True, "exempt": []},
        "silent-failure": {"enabled": True, "exempt": []},
        "hollowness": {"enabled": True, "exempt": []},
    },
}


# Whole-file exemptions exist for files whose *purpose* triggers a gate: `hollowness.py`
# necessarily contains the markers it searches for, and an inline waiver on every pattern
# line would be noise. Resolution lives in `is_exempt` above, anchored to the declaring
# config's directory.


CONFIG_FILENAME = "spe.config.json"


def _merge_config(raw: dict) -> dict:
    merged = json.loads(json.dumps(DEFAULT_CONFIG))
    merged["exclude"] = list(raw.get("exclude", []))
    for gate_id, settings in raw.get("gates", {}).items():
        merged["gates"].setdefault(gate_id, {"enabled": True, "exempt": []})
        merged["gates"][gate_id].update(settings)
    return merged


def load_config(root: Path) -> dict:
    """Global settings for a run: which gates are enabled, and what to exclude.

    A missing config is normal and means "run every gate with default settings" — the
    runner must be useful when pointed at a repo that has never heard of it.

    Note this returns only the *global* settings. Per-file exemptions are resolved
    separately by `configs_by_dir` / `is_exempt`, because they must be anchored to the
    config file that declares them rather than to wherever the runner happened to be
    pointed. See DEFECT-001.
    """
    config_path = root / CONFIG_FILENAME
    if not config_path.exists():
        return json.loads(json.dumps(DEFAULT_CONFIG))
    return _merge_config(json.loads(config_path.read_text(encoding="utf-8")))


def configs_by_dir(root: Path) -> dict[Path, dict]:
    """Every `spe.config.json` at or below `root`, keyed by the directory containing it.

    DEFECT-001: exemption globs used to be matched against a path relative to the *scan
    root*, so `spe .` inside `runner/` honoured an exemption that `spe ..` from the parent
    silently ignored — the same file was exempt or not depending on where the runner was
    pointed. A gate whose verdict depends on the invocation directory is not deterministic,
    which is the property the whole runner is supposed to have.

    Collecting every config and anchoring its globs to its own directory makes the verdict
    depend on the code alone.
    """
    found: dict[Path, dict] = {}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in DEFAULT_EXCLUDE_DIRS]
        if CONFIG_FILENAME in filenames:
            path = Path(dirpath) / CONFIG_FILENAME
            found[Path(dirpath)] = _merge_config(
                json.loads(path.read_text(encoding="utf-8")))
    return found


def is_exempt(file_path: Path, gate_id: str, configs: dict[Path, dict]) -> bool:
    """True when the nearest config above `file_path` exempts it from `gate_id`.

    "Nearest" means the deepest config directory that is an ancestor of the file, so a
    subproject's config governs its own files without a parent config overriding it.

    A reason is required, exactly as for inline waivers. An exemption without one is
    ignored and the gate keeps applying — an undocumented exemption is indistinguishable
    from someone quietly switching a gate off, which MANDATE.md 7.4 exists to prevent.
    """
    candidates = [d for d in configs if d == file_path.parent or d in file_path.parents]
    if not candidates:
        return False
    config_dir = max(candidates, key=lambda d: len(d.parts))

    rel = str(file_path.relative_to(config_dir)).replace(os.sep, "/")
    entries = configs[config_dir].get("gates", {}).get(gate_id, {}).get("exempt", []) or []
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        pattern = entry.get("path")
        if not pattern or not str(entry.get("reason", "")).strip():
            continue
        if fnmatch.fnmatch(rel, pattern):
            return True
    return False


# --------------------------------------------------------------------------------------
# Reporting
# --------------------------------------------------------------------------------------

def load_blindspots(runner_dir: Path) -> list[dict]:
    """Known limitations of the gates, as data.

    Printed on every run. A limitation recorded only in a README is prose, and prose gets
    forgotten — mechanism M4 in MANDATE.md. A blind spot absent from output does not exist
    to the person reading output, which makes a clean report quietly misleading.
    """
    path = runner_dir / "blindspots.json"
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8")).get("blindspots", [])


def render_blindspots(blindspots: list[dict]) -> str:
    if not blindspots:
        return ("\nBLIND SPOTS: none declared — which itself means the register is missing, "
                "not that the gates see everything.")
    lines = ["", "-" * 78,
             f"BLIND SPOTS ({len(blindspots)}) — what these gates cannot see",
             "-" * 78]
    for spot in sorted(blindspots, key=lambda s: {"high": 0, "medium": 1, "low": 2}
                       .get(s.get("severity", "low"), 3)):
        lines.append(f"  [{spot.get('severity', '?')}] {spot.get('id')} "
                     f"({spot.get('gate')}): {spot.get('limitation')}")
    lines.append("  A clean run means these gates found nothing. It does not mean the code "
                 "is clean.")
    return "\n".join(lines)


def render_report(result: ScanResult, limit_per_gate: int = 12) -> str:
    """Human-readable summary. Terse and labeled: counts first, then a bounded sample.

    The per-gate sample is capped because a wall of several hundred findings is read as
    noise rather than as a work list. The full set is always in findings.json.
    """
    lines: list[str] = []
    lines.append("=" * 78)
    lines.append(f"SPE GATE RUN — {result.root}")
    lines.append(f"mode: {result.mode}    files scanned: {result.files_scanned}    "
                 f"gates: {', '.join(result.gates_run)}")
    lines.append("=" * 78)

    by_gate = result.by_gate()
    if not result.findings:
        lines.append("")
        lines.append("No findings.")
        return "\n".join(lines)

    lines.append("")
    lines.append("SUMMARY")
    for gate_id in result.gates_run:
        found = by_gate.get(gate_id, [])
        counts = {sev: sum(1 for f in found if f.severity == sev) for sev in SEVERITIES}
        detail = "  ".join(f"{sev}:{counts[sev]}" for sev in SEVERITIES if counts[sev])
        lines.append(f"  {gate_id:<20} {len(found):>5}   {detail}")
    lines.append(f"  {'TOTAL':<20} {len(result.findings):>5}")

    for gate_id in result.gates_run:
        found = by_gate.get(gate_id, [])
        if not found:
            continue
        lines.append("")
        lines.append("-" * 78)
        lines.append(f"{gate_id}  ({len(found)} findings)")
        lines.append("-" * 78)
        for finding in found[:limit_per_gate]:
            location = f"{finding.file}:{finding.line}" if finding.line else finding.file
            lines.append(f"  [{finding.severity}] {location}")
            lines.append(f"      {finding.message}")
            if finding.snippet:
                lines.append(f"      > {finding.snippet}")
        if len(found) > limit_per_gate:
            lines.append(f"  ... and {len(found) - limit_per_gate} more "
                         f"(complete list in findings.json)")

    if result.files_unreadable:
        lines.append("")
        lines.append(f"UNREADABLE FILES ({len(result.files_unreadable)}) — not scanned, "
                     f"not passed:")
        for path in result.files_unreadable[:10]:
            lines.append(f"  {path}")

    return "\n".join(lines)
