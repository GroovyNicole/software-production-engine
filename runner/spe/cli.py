"""Command-line surface for the gate runner.

    python -m spe <path-to-repo> [--json OUT] [--changed-only BASE] [--blocking]

Report-only is the default and is the correct mode for adopting gates into an existing
codebase: pointing a blocking gate at a repository with years of accumulated findings makes
the gate unusable on day one, and an unusable gate gets deleted. See MANDATE.md 7.4.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

from .core import (Finding, ScanResult, configs_by_dir, discover, is_exempt,
                   is_test_path, load_blindspots, load_config, read_lines,
                   render_blindspots)
from .gates import REGISTRY


def _changed_lines(root: Path, base: str) -> dict[str, set[int]] | None:
    """Map of file -> changed line numbers between `base` and the working tree.

    Returns None when git is unavailable or the base ref cannot be resolved, so the caller
    can fall back to a full scan and say so rather than silently scanning nothing.
    """
    try:
        proc = subprocess.run(
            ["git", "-C", str(root), "diff", "--unified=0", base, "--"],
            capture_output=True, text=True, check=True, timeout=60,
        )
    # spe:allow silent-failure — returning None IS the recorded failure state; main() prints
    # an explicit warning and falls back to scanning everything rather than scanning nothing
    except (OSError, subprocess.SubprocessError):
        return None

    changed: dict[str, set[int]] = {}
    current: str | None = None
    for line in proc.stdout.splitlines():
        if line.startswith("+++ b/"):
            current = line[6:]
            changed.setdefault(current, set())
        elif line.startswith("@@") and current is not None:
            # Format: @@ -old,count +new,count @@
            try:
                new_part = line.split("+", 1)[1].split(" ", 1)[0]
                start_s, _, count_s = new_part.partition(",")
                start = int(start_s)
                count = int(count_s) if count_s else 1
            # A hunk header this parser cannot read means the changed-line set for this run
            # would be incomplete, and an incomplete set silently *under-scans* — findings
            # on unparsed hunks would be reported as absent rather than as unchecked.
            # Abandon changed-only mode entirely so the caller falls back to a full scan.
            # Failing toward more scanning is the only safe direction.
            # spe:allow silent-failure — the None return IS the recorded failure state;
            # main() warns explicitly and scans everything rather than scanning nothing
            except (IndexError, ValueError):
                return None
            changed[current].update(range(start, start + count))
    return changed


def run(root: Path, config: dict, changed: dict[str, set[int]] | None,
        mode: str) -> ScanResult:
    """Execute every enabled gate over the discovered files."""
    enabled = [gate_id for gate_id, settings in config["gates"].items()
               if settings.get("enabled", True) and gate_id in REGISTRY]
    # Exemptions are resolved per file against the nearest declaring config, not against
    # the scan root — see DEFECT-001 in core.configs_by_dir.
    configs = configs_by_dir(root)

    result = ScanResult(root=str(root), gates_run=enabled, mode=mode)

    for path in discover(root, config.get("exclude", ())):
        rel_path = str(path.relative_to(root)).replace("\\", "/")

        # Test code is out of scope for all three v1 gates — see core.is_test_path.
        if is_test_path(rel_path):
            continue

        # In changed-only mode, skip files with no modified lines outright.
        if changed is not None and rel_path not in changed:
            continue

        if read_lines(path) is None:
            result.files_unreadable.append(rel_path)
            continue

        result.files_scanned += 1

        for gate_id in enabled:
            if is_exempt(path, gate_id, configs):
                continue
            scan_file = getattr(REGISTRY[gate_id], "scan", None)
            if scan_file is None:
                continue  # repo-level gate; handled after the file walk
            for finding in scan_file(path, rel_path):
                # In changed-only mode a finding counts only if it sits on a changed line.
                # Pre-existing findings in an untouched region are backlog, not regression.
                if changed is not None and finding.line not in changed.get(rel_path, ()):
                    continue
                result.add(finding)

    # Repo-level gates run once over the whole tree. Some properties — whether tests are
    # actually wired to a runner, whether routes have declared authorization, whether
    # specification has outrun implementation — are invisible file by file and only exist
    # as facts about the project as a whole.
    if changed is None:  # a diff-scoped run cannot judge whole-repo properties
        for gate_id in enabled:
            scan_repo = getattr(REGISTRY[gate_id], "scan_repo", None)
            if scan_repo is None:
                continue
            for finding in scan_repo(root):
                result.add(finding)

    return result


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="spe",
        description="Software Production Engine gate runner — deterministic checks that "
                    "fail on evidence, not on opinion.",
    )
    parser.add_argument("path", help="repository or directory to scan")
    parser.add_argument("--json", dest="json_out", default=None,
                        help="write the full findings list to this file")
    parser.add_argument("--changed-only", dest="base", default=None, metavar="BASE",
                        help="report only findings on lines changed since BASE "
                             "(e.g. origin/main)")
    parser.add_argument("--blocking", action="store_true",
                        help="exit 1 when findings exist (default is report-only, exit 0)")
    parser.add_argument("--quiet", action="store_true",
                        help="suppress the human summary; useful with --json")
    parser.add_argument("--coverage", action="store_true",
                        help="report which controls are enforced and which are not, "
                             "then exit without scanning")
    parser.add_argument("--list-planned", type=int, default=0, metavar="N",
                        help="with --coverage, list N controls that have a gate specified "
                             "but not yet built")
    args = parser.parse_args(argv)

    if args.coverage:
        from .coverage import compute, render
        repo_root = Path(args.path).resolve()
        try:
            print(render(compute(repo_root), list_uncovered=args.list_planned))
        except FileNotFoundError as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 2
        print(render_blindspots(load_blindspots(Path(__file__).resolve().parents[1])))
        return 0

    root = Path(args.path).resolve()
    if not root.is_dir():
        print(f"error: {root} is not a directory", file=sys.stderr)
        return 2

    config = load_config(root)

    changed = None
    mode = "report-only"
    if args.base:
        changed = _changed_lines(root, args.base)
        if changed is None:
            print(f"warning: could not read a git diff against {args.base!r}; "
                  f"scanning everything instead", file=sys.stderr)
        else:
            mode = f"changed-only vs {args.base}"
    if args.blocking:
        mode += " (blocking)"

    result = run(root, config, changed, mode)

    if not args.quiet:
        from .core import render_report
        print(render_report(result))
        # Always printed, including on a clean run — that is precisely when a reader is
        # most likely to mistake "these gates found nothing" for "this code is fine".
        print(render_blindspots(load_blindspots(Path(__file__).resolve().parents[1])))

    if args.json_out:
        Path(args.json_out).write_text(
            json.dumps(result.as_dict(), indent=2), encoding="utf-8")
        if not args.quiet:
            print(f"\nFull findings written to {args.json_out}")

    # Report-only always exits 0 — the run succeeded even when the code has findings.
    # Only --blocking treats findings as a failure.
    if args.blocking and result.findings:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
