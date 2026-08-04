#!/usr/bin/env python3
"""Extract the control registers from the engineering playbook into machine-readable data.

The playbook is the authority and is read-only input here. Its own `AGENTS.md` forbids
omitting, merging, duplicating, renumbering, or weakening any control, so this extractor
**asserts** the result rather than trusting it: software controls must run exactly 1-200 and
website controls exactly 1-150, with no gaps and no duplicates. A run that cannot prove that
fails loudly and writes nothing.

Usage:
    python controls/extract_controls.py

Writes:
    controls/software.json   — 200 controls, verbatim, in order
    controls/website.json    — 150 controls, verbatim, in order
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
PLAYBOOK = REPO_ROOT / "engineering-playbook" / "docs" / "standards"
OUT_DIR = REPO_ROOT / "controls"

# A control is a numbered list item inside the `## Controls` section of a module. Matching
# the whole line and requiring the number to start it avoids picking up numbered prose from
# the surrounding guidance sections.
CONTROL_RE = re.compile(r"^(\d{1,3})\.\s+(\S.*)$")

REGISTERS = {
    "software": {"dir": PLAYBOOK / "software", "expected": 200},
    "website": {"dir": PLAYBOOK / "website", "expected": 150},
}


def extract_module(path: Path) -> dict[int, str]:
    """Pull numbered controls from one module file's `## Controls` section."""
    lines = path.read_text(encoding="utf-8").splitlines()

    in_controls = False
    found: dict[int, str] = {}
    for line in lines:
        if line.strip().lower().startswith("## controls"):
            in_controls = True
            continue
        if in_controls and line.startswith("## "):
            break  # the Controls section ended
        if not in_controls:
            continue
        match = CONTROL_RE.match(line.strip())
        if match:
            found[int(match.group(1))] = match.group(2).strip()
    return found


def extract_register(name: str, directory: Path, expected: int) -> dict[int, str]:
    """Assemble one full register from its modules, proving completeness."""
    if not directory.is_dir():
        raise SystemExit(f"FAIL: control directory not found: {directory}")

    collected: dict[int, str] = {}
    duplicates: list[tuple[int, str, str]] = []

    for module in sorted(directory.glob("controls-*.md")):
        for number, text in extract_module(module).items():
            if number in collected and collected[number] != text:
                duplicates.append((number, module.name, text))
            collected[number] = text

    missing = sorted(set(range(1, expected + 1)) - set(collected))
    out_of_range = sorted(n for n in collected if n < 1 or n > expected)

    problems = []
    if missing:
        problems.append(f"missing control numbers: {missing}")
    if out_of_range:
        problems.append(f"control numbers outside 1-{expected}: {out_of_range}")
    if duplicates:
        problems.append(f"conflicting duplicates: {duplicates}")
    if len(collected) != expected:
        problems.append(f"expected {expected} controls, extracted {len(collected)}")

    if problems:
        # Writing a partial register would let a later coverage report claim completeness
        # over a corpus that is not complete. Refusing is the only honest outcome.
        raise SystemExit(f"FAIL [{name}]: " + "; ".join(problems))

    return collected


def main() -> int:
    OUT_DIR.mkdir(exist_ok=True)

    for name, spec in REGISTERS.items():
        controls = extract_register(name, spec["dir"], spec["expected"])
        payload = {
            "register": name,
            "count": len(controls),
            "source": str(spec["dir"].relative_to(REPO_ROOT)),
            "controls": [
                {"id": f"{name[0].upper()}{number:03d}", "number": number,
                 "text": controls[number]}
                for number in sorted(controls)
            ],
        }
        out_path = OUT_DIR / f"{name}.json"
        out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
                            encoding="utf-8")
        print(f"OK  {name}: {len(controls)} controls -> {out_path.relative_to(REPO_ROOT)}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
