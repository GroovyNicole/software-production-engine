"""Planted-failure tests for every gate.

The playbook requires that a new deterministic guardrail ship with planted-failure tests
(`engineering-playbook/templates/article-engine/engineering/quality-gates.md`). A gate that
has only been run against real code has been observed to produce output; it has not been
shown to detect what it claims to detect, nor to stay quiet on what it should ignore.

Each test asserts BOTH directions:
  - every planted violation is found (no false negatives), and
  - every clean and every waived line is left alone (no false positives).

The second direction is the one that matters for adoption: a gate that cries wolf gets
switched off, and a switched-off gate enforces nothing.

Run with:  python -m unittest discover -s tests -t .
"""

from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

CONFIG_NAME = "spe.config.json"

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from spe.core import Finding, waived                              # noqa: E402
from spe.gates import (delete_allowlist, hollowness, module_size,  # noqa: E402
                       silent_failure, test_gate_wired)

FIXTURES = Path(__file__).parent / "fixtures"


def scan(module, filename: str) -> list[Finding]:
    path = FIXTURES / filename
    return module.scan(path, filename)


def lines_flagged(findings: list[Finding]) -> set[int]:
    return {f.line for f in findings}


def source_lines(filename: str) -> list[str]:
    return (FIXTURES / filename).read_text(encoding="utf-8").splitlines()


def marked(filename: str, marker: str) -> set[int]:
    """1-indexed line numbers carrying a given end-of-line marker comment."""
    return {i + 1 for i, line in enumerate(source_lines(filename)) if marker in line}


class TestDeleteAllowlist(unittest.TestCase):
    FILE = "planted_deletes.py"

    def setUp(self) -> None:
        self.findings = scan(delete_allowlist, self.FILE)
        self.flagged = lines_flagged(self.findings)

    def test_every_planted_violation_is_detected(self) -> None:
        for line in marked(self.FILE, "# VIOLATION"):
            self.assertIn(line, self.flagged,
                          f"missed a planted deletion at line {line}")

    def test_no_clean_line_is_flagged(self) -> None:
        for line in marked(self.FILE, "# CLEAN"):
            self.assertNotIn(line, self.flagged,
                             f"false positive on a clean line at {line}")

    def test_waived_lines_are_not_flagged(self) -> None:
        # Both waiver placements — preceding line and same line — must be honored.
        src = source_lines(self.FILE)
        waiver_targets = [
            i + 1 for i, line in enumerate(src)
            if "spe:allow delete-allowlist" in line or
            (i > 0 and "spe:allow delete-allowlist" in src[i - 1])
        ]
        for line in waiver_targets:
            self.assertNotIn(line, self.flagged,
                             f"waiver ignored at line {line}")

    def test_severity_is_assigned(self) -> None:
        self.assertTrue(self.findings, "fixture produced no findings at all")
        for finding in self.findings:
            self.assertIn(finding.severity, ("high", "medium", "low"))
            self.assertTrue(finding.message)
            self.assertIn("rule-4", finding.controls)


class TestSilentFailure(unittest.TestCase):
    FILE = "planted_silent.py"

    def setUp(self) -> None:
        self.findings = scan(silent_failure, self.FILE)
        self.flagged = lines_flagged(self.findings)

    def test_every_planted_violation_is_detected(self) -> None:
        # Handlers are reported at the `except` line, which sits above the marked body
        # line, so allow a small window rather than requiring an exact match.
        for line in marked(self.FILE, "# VIOLATION"):
            self.assertTrue(
                any(abs(line - flagged) <= 2 for flagged in self.flagged),
                f"missed a planted silent handler near line {line}",
            )

    def test_logged_and_reraised_handlers_are_not_flagged(self) -> None:
        for line in marked(self.FILE, "# CLEAN"):
            self.assertFalse(
                any(abs(line - flagged) <= 1 for flagged in self.flagged),
                f"false positive on a correctly handled error near line {line}",
            )

    def test_bare_except_is_high_severity(self) -> None:
        bare = [f for f in self.findings if "bare `except:`" in f.message]
        self.assertEqual(len(bare), 1, "expected exactly one bare except in the fixture")
        self.assertEqual(bare[0].severity, "high")

    def test_syntax_error_is_reported_not_skipped(self) -> None:
        """An unparseable file must surface as a finding, never as silent success."""
        broken = FIXTURES / "_tmp_broken.py"
        broken.write_text("def f(:\n    pass\n", encoding="utf-8")
        try:
            findings = silent_failure.scan(broken, "_tmp_broken.py")
            self.assertEqual(len(findings), 1)
            self.assertEqual(findings[0].severity, "info")
            self.assertIn("could not be parsed", findings[0].message)
        finally:
            broken.unlink()

    def test_empty_catch_in_javascript(self) -> None:
        js = FIXTURES / "_tmp_empty_catch.js"
        js.write_text(
            "async function f() {\n"
            "  try { await go(); } catch (e) {}\n"      # violation, line 2
            "  try { await go(); } catch (e) { log(e); }\n"   # clean, line 3
            "}\n",
            encoding="utf-8",
        )
        try:
            findings = silent_failure.scan(js, "_tmp_empty_catch.js")
            self.assertEqual(lines_flagged(findings), {2})
        finally:
            js.unlink()


class TestHollowness(unittest.TestCase):
    FILE = "planted_hollow.py"

    def setUp(self) -> None:
        self.findings = scan(hollowness, self.FILE)
        self.flagged = lines_flagged(self.findings)

    def test_every_planted_violation_is_detected(self) -> None:
        for line in marked(self.FILE, "# VIOLATION"):
            self.assertIn(line, self.flagged,
                          f"missed a planted hollowness marker at line {line}")

    def test_clean_and_waived_lines_are_not_flagged(self) -> None:
        for line in marked(self.FILE, "# CLEAN"):
            self.assertNotIn(line, self.flagged,
                             f"false positive at line {line}")

    def test_not_implemented_outranks_todo(self) -> None:
        by_line = {f.line: f for f in self.findings}
        not_impl = [f for f in by_line.values() if "NotImplementedError" in f.snippet]
        self.assertTrue(not_impl)
        self.assertEqual(not_impl[0].severity, "high")

    def test_one_finding_per_line_maximum(self) -> None:
        seen = [f.line for f in self.findings]
        self.assertEqual(len(seen), len(set(seen)),
                         "a line produced more than one finding")


class TestWaiverSyntax(unittest.TestCase):
    """A waiver without a stated reason must not waive anything."""

    def test_reason_is_required(self) -> None:
        self.assertFalse(waived(["x = 1  # spe:allow hollowness"], 0, "hollowness"))
        self.assertTrue(waived(["x = 1  # spe:allow hollowness — tracked as REQ-1"], 0,
                               "hollowness"))

    def test_gate_id_must_match(self) -> None:
        line = ["x = 1  # spe:allow delete-allowlist — some reason"]
        self.assertFalse(waived(line, 0, "hollowness"))
        self.assertTrue(waived(line, 0, "delete-allowlist"))

    def test_waiver_found_in_multiline_comment_block(self) -> None:
        """A reason worth stating often needs more than one line."""
        block = [
            "    # spe:allow silent-failure — the None return IS the recorded failure",
            "    # state; the caller warns explicitly and falls back to a full scan",
            "    except OSError:",
        ]
        self.assertTrue(waived(block, 2, "silent-failure"))

    def test_waiver_search_stops_at_non_comment(self) -> None:
        """A waiver must not leak downward past unrelated code onto a later line."""
        block = [
            "    # spe:allow silent-failure — applies to the line right below only",
            "    do_something()",
            "    except OSError:",
        ]
        self.assertFalse(waived(block, 2, "silent-failure"))


class TestModuleSize(unittest.TestCase):
    """Planted-failure tests for module-size.

    Uses generated files rather than checked-in fixtures: an 1,800-line fixture would be
    noise in the repository, and the property under test is purely the line count.
    """

    def setUp(self) -> None:
        import tempfile
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def _write(self, name: str, line_count: int, header: str = "") -> Path:
        path = self.root / name
        body = header + "\n".join(f"x = {i}" for i in range(line_count))
        path.write_text(body, encoding="utf-8")
        return path

    def test_small_file_is_not_flagged(self) -> None:
        path = self._write("small.py", 200)
        self.assertEqual(module_size.scan(path, "small.py"), [])

    def test_file_just_under_the_limit_is_not_flagged(self) -> None:
        path = self._write("edge.py", module_size.MEDIUM_THRESHOLD - 1)
        self.assertEqual(module_size.scan(path, "edge.py"), [])

    def test_medium_file_is_flagged_medium(self) -> None:
        path = self._write("mid.py", module_size.MEDIUM_THRESHOLD + 10)
        findings = module_size.scan(path, "mid.py")
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0].severity, "medium")
        self.assertEqual(findings[0].line, 1)

    def test_very_large_file_is_flagged_high(self) -> None:
        path = self._write("huge.py", module_size.HIGH_THRESHOLD + 10)
        findings = module_size.scan(path, "huge.py")
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0].severity, "high")

    def test_waiver_at_the_top_of_the_file_silences_it(self) -> None:
        path = self._write(
            "waived.py", module_size.HIGH_THRESHOLD + 10,
            header="# spe:allow module-size — generated file, never edited by hand\n")
        self.assertEqual(module_size.scan(path, "waived.py"), [])

    def test_waiver_buried_deep_does_not_count(self) -> None:
        """A whole-file waiver has to be visible to someone opening the file."""
        path = self.root / "buried.py"
        lines = [f"x = {i}" for i in range(module_size.HIGH_THRESHOLD + 10)]
        lines[900] = "# spe:allow module-size — hidden nine hundred lines down"
        path.write_text("\n".join(lines), encoding="utf-8")
        self.assertEqual(len(module_size.scan(path, "buried.py")), 1)


class TestTestGateWired(unittest.TestCase):
    """Planted-failure tests for test-gate-wired — the blg-article-finderwriter failure."""

    def setUp(self) -> None:
        import tempfile
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "tests").mkdir()
        (self.root / "tests" / "test_thing.py").write_text("def test_x():\n    pass\n",
                                                           encoding="utf-8")

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def _package_json(self, scripts: dict) -> None:
        (self.root / "package.json").write_text(
            json.dumps({"name": "x", "scripts": scripts}), encoding="utf-8")

    def _workflow(self, name: str, body: str) -> None:
        wf = self.root / ".github" / "workflows"
        wf.mkdir(parents=True, exist_ok=True)
        (wf / name).write_text(body, encoding="utf-8")

    def test_tests_exist_but_nothing_runs_them(self) -> None:
        """The exact finderwriter shape: test files present, no test script."""
        self._package_json({"start": "node run.js", "score": "node run.js"})
        findings = test_gate_wired.scan_repo(self.root)
        self.assertTrue(any("no command runs them" in f.message for f in findings))

    def test_declared_test_script_satisfies_the_gate(self) -> None:
        self._package_json({"start": "node run.js", "test": "node --test"})
        findings = test_gate_wired.scan_repo(self.root)
        self.assertFalse(any("no command runs them" in f.message for f in findings))

    def test_ci_running_tests_satisfies_the_gate(self) -> None:
        self._package_json({"start": "node run.js"})
        self._workflow("ci.yml", "jobs:\n  t:\n    steps:\n      - run: pytest\n")
        findings = test_gate_wired.scan_repo(self.root)
        self.assertFalse(any("no command runs them" in f.message for f in findings))

    def test_deploy_without_tests_is_flagged(self) -> None:
        self._package_json({"test": "node --test"})
        self._workflow("deploy.yml", "jobs:\n  d:\n    steps:\n      - run: rsync -a out/ server:/srv\n")
        findings = test_gate_wired.scan_repo(self.root)
        self.assertTrue(any("deploys but runs no tests" in f.message for f in findings))

    def test_deploy_that_also_tests_is_not_flagged(self) -> None:
        self._package_json({"test": "node --test"})
        self._workflow("deploy.yml",
                       "jobs:\n  d:\n    steps:\n      - run: npm test\n"
                       "      - run: rsync -a out/ server:/srv\n")
        findings = test_gate_wired.scan_repo(self.root)
        self.assertFalse(any("deploys but runs no tests" in f.message for f in findings))

    def test_repo_with_no_tests_at_all_is_silent_here(self) -> None:
        """Absence of tests is control 86's problem, not this gate's. Do not double-report."""
        (self.root / "tests" / "test_thing.py").unlink()
        self._package_json({"start": "node run.js"})
        findings = test_gate_wired.scan_repo(self.root)
        self.assertFalse(any("no command runs them" in f.message for f in findings))


class TestEveryRegisteredGateActuallyRuns(unittest.TestCase):
    """DEFECT-002 regression.

    Enablement used to be read from DEFAULT_CONFIG, which listed only the first three
    gates. Registering a fourth left it dormant — while the coverage report, which reads
    the registry, went on counting its controls as enforced. Claimed but not running is
    exactly the failure this tool exists to catch, so it gets a test that fails the moment
    a registered gate stops being reachable.
    """

    def test_default_config_does_not_gate_registration(self) -> None:
        import tempfile
        from spe.cli import run
        from spe.core import load_config
        from spe.gates import REGISTRY

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "x.py").write_text("x = 1\n", encoding="utf-8")
            result = run(root, load_config(root), None, "test")
            self.assertEqual(set(result.gates_run), set(REGISTRY),
                             "a registered gate did not run under the default config")


class TestExemptionAnchoring(unittest.TestCase):
    """DEFECT-001 regression.

    Exemption globs were matched against a path relative to the scan root, so the same file
    was exempt or not depending on where the runner was pointed. A gate whose verdict
    depends on the invocation directory is not deterministic, which is the one property the
    runner must have.
    """

    def setUp(self) -> None:
        import tempfile
        self.tmp = tempfile.TemporaryDirectory()
        root = Path(self.tmp.name)
        (root / "project" / "src").mkdir(parents=True)
        (root / "project" / "src" / "patterns.py").write_text(
            'MARKERS = ["TODO", "FIXME"]\n', encoding="utf-8")
        (root / "project" / CONFIG_NAME).write_text(json.dumps({
            "gates": {"hollowness": {"enabled": True, "exempt": [
                {"path": "src/patterns.py", "reason": "defines the markers it searches for"}
            ]}}
        }), encoding="utf-8")
        self.root = root

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def _findings_scanning_from(self, scan_root: Path) -> int:
        from spe.cli import run
        from spe.core import load_config
        return len(run(scan_root, load_config(scan_root), None, "test").findings)

    def test_same_verdict_from_project_root_and_from_parent(self) -> None:
        from_project = self._findings_scanning_from(self.root / "project")
        from_parent = self._findings_scanning_from(self.root)
        self.assertEqual(from_project, 0, "exemption ignored when scanning the project")
        self.assertEqual(from_parent, 0,
                         "exemption ignored when scanning from the parent — DEFECT-001")

    def test_exemption_without_a_reason_does_not_exempt(self) -> None:
        (self.root / "project" / CONFIG_NAME).write_text(json.dumps({
            "gates": {"hollowness": {"enabled": True, "exempt": [
                {"path": "src/patterns.py"}
            ]}}
        }), encoding="utf-8")
        self.assertGreater(self._findings_scanning_from(self.root / "project"), 0,
                           "an exemption with no stated reason must not exempt anything")


if __name__ == "__main__":
    unittest.main(verbosity=2)
