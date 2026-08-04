"""Gate: silent-failure.

Detects error handling that discards the error, so a failure is indistinguishable from
success.

Origin (portfolio-evidence.md): 61 sites in `fapp-claudedev`, 47 in `genealogy-database`.
This is the mechanical source of "it said it worked and nothing happened" — a nightly Clio
fetch that fails silently leaves a dashboard showing stale numbers with nothing anywhere
recording that a fetch failed.

Controls: 16 (errors handled without false success or swallowed exceptions), 98
(background-task failures visible and actionable rather than silent).

Method note: Python is analyzed with the standard library's AST parser rather than by
regex. A regex over `except` lines cannot tell a handler that logs from one that does
nothing, and cannot see multi-line bodies — it produces both false positives and false
negatives. Other languages fall back to a narrow regex that matches only an empty catch
block, which is unambiguous.
"""

from __future__ import annotations

import ast
import re
from pathlib import Path

from ..core import Finding, read_lines, waived

GATE_ID = "silent-failure"
CONTROLS = ("16", "98")
LANGUAGES = ["python", "javascript", "typescript", "php", "java", "csharp"]
FAILURE_CONDITION = (
    "An error handler that discards the error: a bare `except:`, a handler whose entire "
    "body is pass / ... / continue / return None, or an empty catch block, with no waiver."
)

# An empty catch block in C-family languages: `catch (e) {}` or `catch {}`, allowing
# whitespace and newlines between the braces but nothing else.
EMPTY_CATCH_RE = re.compile(r"\bcatch\s*(?:\([^)]*\))?\s*\{\s*\}", re.MULTILINE)


def _body_is_inert(body: list[ast.stmt]) -> str | None:
    """Return a description when a handler body does nothing at all, else None.

    Inert means: `pass`, a bare `...`, or a lone `return`/`return None`/`continue`. Each of
    these discards the exception object entirely — no log, no re-raise, no recorded state.
    A handler that returns a *meaningful* value (a default, a sentinel) is not flagged: that
    is a deliberate fallback, and distinguishing it from evasion requires reading intent,
    which is a human judgment this gate does not attempt.
    """
    if len(body) != 1:
        return None
    node = body[0]

    if isinstance(node, ast.Pass):
        return "handler body is `pass` — the error is discarded"
    if isinstance(node, ast.Expr) and isinstance(node.value, ast.Constant) and node.value.value is Ellipsis:
        return "handler body is `...` — the error is discarded"
    if isinstance(node, ast.Continue):
        return "handler body is `continue` — the error is discarded and the loop proceeds"
    if isinstance(node, ast.Return) and (
        node.value is None
        or (isinstance(node.value, ast.Constant) and node.value.value is None)
    ):
        return "handler returns None without recording the error"
    return None


def _scan_python(path: Path, rel_path: str, lines: list[str]) -> list[Finding]:
    source = "\n".join(lines)
    try:
        tree = ast.parse(source, filename=str(path))
    except SyntaxError as exc:
        # A file that cannot be parsed was not examined. Reporting that as an `info`
        # finding — rather than skipping quietly — is the same principle this gate
        # enforces: unexamined is not the same as clean.
        return [Finding(
            gate=GATE_ID,
            severity="info",
            file=rel_path,
            line=exc.lineno or 0,
            message=f"file could not be parsed, so it was not checked ({exc.msg})",
            controls=CONTROLS,
        )]

    findings: list[Finding] = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.ExceptHandler):
            continue

        index = node.lineno - 1
        snippet = lines[index].strip() if 0 <= index < len(lines) else ""

        # A bare `except:` catches everything — including KeyboardInterrupt, SystemExit,
        # and genuine bugs like NameError — which turns unrelated defects into silence.
        if node.type is None:
            if not waived(lines, index, GATE_ID):
                findings.append(Finding(
                    gate=GATE_ID,
                    severity="high",
                    file=rel_path,
                    line=node.lineno,
                    message=("bare `except:` catches every error including bugs and "
                             "interrupts. Name the exceptions actually expected."),
                    snippet=snippet[:140],
                    controls=CONTROLS,
                ))
            continue

        inert = _body_is_inert(node.body)
        if inert and not waived(lines, index, GATE_ID):
            findings.append(Finding(
                gate=GATE_ID,
                severity="high",
                file=rel_path,
                line=node.lineno,
                message=(f"{inert}. Log it, re-raise it, or record the failure state — "
                         f"or declare it with `spe:allow {GATE_ID} — <reason>`."),
                snippet=snippet[:140],
                controls=CONTROLS,
            ))

    return findings


def _scan_braced(rel_path: str, lines: list[str]) -> list[Finding]:
    """JavaScript / TypeScript / PHP / Java / C#: flag only provably empty catch blocks."""
    source = "\n".join(lines)
    findings: list[Finding] = []
    for match in EMPTY_CATCH_RE.finditer(source):
        line_no = source.count("\n", 0, match.start()) + 1
        index = line_no - 1
        if waived(lines, index, GATE_ID):
            continue
        findings.append(Finding(
            gate=GATE_ID,
            severity="high",
            file=rel_path,
            line=line_no,
            message=("empty catch block discards the error. Log it, re-throw it, or record "
                     f"the failure — or declare it with `spe:allow {GATE_ID} — <reason>`."),
            snippet=lines[index].strip()[:140] if 0 <= index < len(lines) else "",
            controls=CONTROLS,
        ))
    return findings


def scan(path: Path, rel_path: str) -> list[Finding]:
    lines = read_lines(path)
    if lines is None:
        return []
    if path.suffix.lower() in (".py", ".pyi"):
        return _scan_python(path, rel_path, lines)
    if path.suffix.lower() in (".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx",
                               ".php", ".java", ".cs"):
        return _scan_braced(rel_path, lines)
    return []
