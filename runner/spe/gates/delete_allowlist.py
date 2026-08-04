"""Gate: delete-allowlist.

Enforces the rule that collected data is archived, never destroyed.

Origin (portfolio-evidence.md, Finding 3): `fapp-claudedev/CLAUDE.md` rule 4 is marked
ABSOLUTE, appears first in the file, and is read at the start of every session. It was
violated twice anyway — `email_archive.py:253` hard-deletes the bodies of non-matching
conversations, and `cfo_fee_facts.py:371` wipes an entire table on every rebuild. Both are
detectable in milliseconds. Neither was detected, because the rule was prose.

The gate does not ban deletion. Some deletion is correct: expired one-time codes, TTL
sweeps on operational logs. It requires that each such deletion be *declared* — an inline
`spe:allow delete-allowlist — <reason>` waiver — so the distinction between "this row is
disposable" and "this is the firm's data" is written down once instead of re-decided
silently at every call site.

Controls: CLAUDE.md rule 4; software controls 33, 34, 35 (deletion scope, required
retention, soft vs. permanent deletion).
"""

from __future__ import annotations

import re
from pathlib import Path

from ..core import Finding, read_lines, waived

GATE_ID = "delete-allowlist"
CONTROLS = ("rule-4", "33", "34", "35")
LANGUAGES = ["python", "javascript", "typescript", "php", "sql"]
FAILURE_CONDITION = (
    "A statement that permanently removes collected data — SQL DELETE/DROP/TRUNCATE in an "
    "execution context, an ORM delete, or a filesystem removal — carrying no inline "
    "`spe:allow delete-allowlist` waiver stating why that data is disposable."
)

# Statements that remove rows or whole tables. Matched case-insensitively because SQL is
# written both ways, and with word boundaries so "undeleted_at" does not trigger.
SQL_PATTERNS = (
    (re.compile(r"\bDELETE\s+FROM\b", re.IGNORECASE),
     "high", "SQL DELETE removes rows permanently"),
    (re.compile(r"\bDROP\s+(TABLE|COLUMN|DATABASE|SCHEMA)\b", re.IGNORECASE),
     "high", "SQL DROP destroys a table, column, or database"),
    (re.compile(r"\bTRUNCATE\s+(TABLE\s+)?\w", re.IGNORECASE),
     "high", "TRUNCATE empties a table"),
)

# ORM-level deletion. Narrower than a bare `.delete(` search on purpose: `.delete(` alone
# matches unrelated APIs (dict-like caches, HTTP client verbs) and a gate that cries wolf
# gets switched off.
ORM_PATTERNS = (
    (re.compile(r"\bsession\.delete\s*\("),
     "medium", "ORM session.delete() removes a record permanently"),
    (re.compile(r"\b(?:query|objects|filter|filter_by)\([^)]*\)\s*\.\s*delete\s*\("),
     "medium", "ORM queryset delete() removes matching records permanently"),
    (re.compile(r"\bbulk_delete\s*\(|\bdestroy_all\b|\bdeleteMany\s*\("),
     "medium", "bulk deletion removes many records at once"),
)

# Filesystem removal. Included because collected data is not only rows — ingested documents
# and generated artifacts are data too, and rule 4 does not carve them out.
FILE_PATTERNS = (
    (re.compile(r"\bshutil\.rmtree\s*\(|\bos\.removedirs\s*\("),
     "medium", "recursive directory removal deletes files permanently"),
    (re.compile(r"\bos\.remove\s*\(|\bos\.unlink\s*\(|\.unlink\s*\(\s*\)|\bfs\.unlinkSync\s*\("),
     "low", "file removal deletes a file permanently"),
)

ALL_PATTERNS = SQL_PATTERNS + ORM_PATTERNS + FILE_PATTERNS

# Lines that only *mention* deletion — comments, docstrings, log messages, SQL that creates
# a trigger describing deletion — are not deletions. This is a coarse filter and it is
# intentional: a false negative here costs one missed finding, while a false positive on
# every log line that says "deleting" costs the gate its credibility.
COMMENT_PREFIXES = ("#", "//", "--", "*", "/*")

# SQL text only deletes something when it is executed. A string that merely contains the
# words "DELETE FROM" — a log message, a docstring, prose explaining what an old importer
# used to do — is not a deletion, and flagging it teaches the reader to skim past this
# gate's output.
#
# So SQL patterns additionally require an execution verb on the same line. Every real
# deletion found in the portfolio takes this shape (`c.execute("DELETE FROM ...")`), and
# the planted-failure fixture asserts the prose case stays quiet.
#
# KNOWN LIMITATION: SQL assembled into a variable on one line and executed on another is
# not detected. That is an accepted false negative in v1 — narrowing false positives
# matters more for adoption than catching an uncommon construction. When it needs
# covering, the fix is dataflow analysis, not a wider regex.
EXEC_CONTEXT_RE = re.compile(
    r"\b(?:execute|executemany|executescript|exec|query|raw|run|sql|prepare|"
    r"cursor|session|conn|connection|db)\b\s*[.(]|\.\s*(?:execute|query|raw)\b",
    re.IGNORECASE,
)

# Files that are wholly SQL need no execution verb — the file itself is the statement.
SQL_SUFFIXES = (".sql",)


def _is_commented(stripped: str) -> bool:
    return any(stripped.startswith(prefix) for prefix in COMMENT_PREFIXES)


def scan(path: Path, rel_path: str) -> list[Finding]:
    """Return every unwaived deletion site in one file."""
    lines = read_lines(path)
    if lines is None:
        return []

    is_sql_file = path.suffix.lower() in SQL_SUFFIXES

    findings: list[Finding] = []
    for index, raw_line in enumerate(lines):
        stripped = raw_line.strip()
        if not stripped or _is_commented(stripped):
            continue

        for pattern, severity, message in ALL_PATTERNS:
            if not pattern.search(raw_line):
                continue
            # SQL only counts when it is actually run — see EXEC_CONTEXT_RE above.
            if pattern in {p for p, _, _ in SQL_PATTERNS}:
                if not is_sql_file and not EXEC_CONTEXT_RE.search(raw_line):
                    continue
            if waived(lines, index, GATE_ID):
                break  # declared and justified — that is the whole point of the gate
            findings.append(Finding(
                gate=GATE_ID,
                severity=severity,
                file=rel_path,
                line=index + 1,
                message=(f"{message}. Archive instead, or declare it with "
                         f"`spe:allow {GATE_ID} — <reason>`."),
                snippet=stripped[:140],
                controls=CONTROLS,
            ))
            break  # one finding per line; the first matching pattern is the specific one

    return findings
