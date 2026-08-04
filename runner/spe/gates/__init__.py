"""Gate registry.

Each gate is a module exposing `GATE_ID` and `scan(path, rel_path) -> list[Finding]`.
Registration is explicit rather than discovered by import scanning: a gate that exists on
disk but is not listed here does not run, and the runner reports the difference as a
coverage gap. Silent auto-discovery would let a broken gate disappear from a run without
anyone noticing — the same failure class the runner exists to catch.
"""

from __future__ import annotations

from . import (delete_allowlist, hollowness, module_size, silent_failure,
               test_gate_wired)

# Ordered most-consequential first, which is also the order findings are reported in.
REGISTRY = {
    delete_allowlist.GATE_ID: delete_allowlist,
    silent_failure.GATE_ID: silent_failure,
    test_gate_wired.GATE_ID: test_gate_wired,
    hollowness.GATE_ID: hollowness,
    module_size.GATE_ID: module_size,
}

__all__ = ["REGISTRY"]
