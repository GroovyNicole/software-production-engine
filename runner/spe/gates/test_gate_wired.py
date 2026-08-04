"""Gate: test-gate-wired.

Detects test files that nothing runs, and continuous-integration pipelines that deploy
without running tests.

Origin (portfolio-evidence.md, Finding 2): `blg-article-finderwriter` and the
`article-engine` template in the playbook are the same lineage. The template's package.json
declares `test`, `test:golden` and `check:customization`, and its CI runs `npm test` on every
push across three Node versions. The shipped repository declares only `start` and `score`,
carries two of the template's six test files, and its CI deploys `output/*.json` to a droplet
without running a single test.

The tests were still there. Nothing executed them. A suite that no command invokes is
decoration, and a pipeline that deploys without running one is worse than having no
pipeline, because it looks like a safety net.

Controls: 86 (automated tests cover the most important workflows) and 171 (the deployment
process is documented and reproducible) — both defeated when the tests exist but never run.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from ..core import DEFAULT_EXCLUDE_DIRS, Finding, is_test_path, read_lines

GATE_ID = "test-gate-wired"
CONTROLS = ("86", "171")
LANGUAGES = ["*"]
FAILURE_CONDITION = (
    "Test files exist but no command in package.json, pyproject.toml, Makefile or CI "
    "invokes them; or a CI workflow deploys without running tests."
)

# Words that mean "this step runs the test suite". Matched against CI workflow text and
# against declared script commands.
TEST_INVOCATION_RE = re.compile(
    r"\b(pytest|unittest|nose2|tox|npm\s+(run\s+)?test|yarn\s+test|pnpm\s+test|"
    r"node\s+--test|jest|vitest|mocha|go\s+test|phpunit|rspec|cargo\s+test)\b",
    re.IGNORECASE,
)

# Steps that put code somewhere it affects the world.
DEPLOY_RE = re.compile(
    r"\b(deploy|rsync|scp|ssh|publish|release|kubectl|helm|terraform\s+apply|"
    r"docker\s+push|appleboy)\b",
    re.IGNORECASE,
)


def _iter_files(root: Path):
    import os
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in DEFAULT_EXCLUDE_DIRS]
        for name in filenames:
            yield Path(dirpath) / name


def scan_repo(root: Path) -> list[Finding]:
    """Whole-repo check: this property is invisible file by file."""
    findings: list[Finding] = []

    test_files: list[str] = []
    manifests: list[Path] = []
    workflows: list[Path] = []

    for path in _iter_files(root):
        rel = str(path.relative_to(root)).replace("\\", "/")
        if path.suffix.lower() in (".py", ".js", ".mjs", ".ts", ".tsx", ".php", ".rb", ".go"):
            if is_test_path(rel):
                test_files.append(rel)
        if path.name in ("package.json", "pyproject.toml", "Makefile", "tox.ini", "setup.cfg"):
            manifests.append(path)
        if "/.github/workflows/" in "/" + rel and path.suffix.lower() in (".yml", ".yaml"):
            workflows.append(path)

    # 1. Tests exist — does any declared command run them?
    if test_files:
        invoked = False
        for manifest in manifests:
            text = "\n".join(read_lines(manifest) or [])
            if manifest.name == "package.json":
                try:
                    scripts = json.loads(text).get("scripts", {})
                except json.JSONDecodeError:
                    scripts = {}
                # A `test` key, or any script whose command invokes a test runner.
                if "test" in scripts or any(TEST_INVOCATION_RE.search(str(v))
                                            for v in scripts.values()):
                    invoked = True
            elif TEST_INVOCATION_RE.search(text):
                invoked = True

        for workflow in workflows:
            if TEST_INVOCATION_RE.search("\n".join(read_lines(workflow) or [])):
                invoked = True

        if not invoked:
            findings.append(Finding(
                gate=GATE_ID,
                severity="high",
                file=manifests[0].relative_to(root).as_posix() if manifests else ".",
                line=1,
                message=(f"{len(test_files)} test file(s) exist but no command runs them. "
                         f"A suite nothing invokes is decoration. Declare a test command "
                         f"and call it from CI."),
                snippet=", ".join(test_files[:3]),
                controls=CONTROLS,
            ))

    # 2. Does any pipeline deploy without running tests first?
    for workflow in workflows:
        text = "\n".join(read_lines(workflow) or [])
        if DEPLOY_RE.search(text) and not TEST_INVOCATION_RE.search(text):
            findings.append(Finding(
                gate=GATE_ID,
                severity="high",
                file=workflow.relative_to(root).as_posix(),
                line=1,
                message=("this workflow deploys but runs no tests. A pipeline that ships "
                         "without testing looks like a safety net and is not one."),
                snippet=workflow.name,
                controls=CONTROLS,
            ))

    return findings
