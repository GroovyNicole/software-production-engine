# SPE Gate Runner

Deterministic checks that fail on evidence, not on opinion. No model, no network, no
randomness — the same source produces the same findings every run. That determinism is the
point: a check an agent can talk its way past is not a gate.

Python 3.9+, standard library only. Nothing to install.

## Running it

From the `runner/` directory:

```
python -m spe C:\path\to\your\repo
```

Useful flags:

| Flag | Effect |
|---|---|
| `--json findings.json` | write the complete findings list to a file |
| `--changed-only origin/main` | report only findings on lines changed since that ref |
| `--blocking` | exit 1 when findings exist (default is exit 0 — report only) |
| `--quiet` | suppress the summary; useful with `--json` |

**Report-only is the default and is the right mode for adopting gates into existing code.**
Pointing a blocking gate at a repository with years of accumulated findings makes it
unusable on day one, and an unusable gate gets deleted. Use `--changed-only` plus
`--blocking` once you want new code held to the standard while existing findings stay a
backlog you work down when you choose.

## The three gates

| Gate | What it finds | Enforces |
|---|---|---|
| `delete-allowlist` | `DELETE FROM`, `DROP`, `TRUNCATE`, ORM deletes, file removal | `CLAUDE.md` rule 4; controls 33, 34, 35 |
| `silent-failure` | bare `except:`, handlers whose body only discards the error, empty `catch {}` | controls 16, 98 |
| `hollowness` | `NotImplementedError`, `TODO`, `FIXME`, `placeholder`, "for now" | `MANDATE.md` M2; control 172 |

Each gate is one module under `spe/gates/`, registered explicitly in `spe/gates/__init__.py`.
A gate that exists on disk but is not registered does not run — silent auto-discovery would
let a broken gate vanish from a run without anyone noticing, which is the failure class this
runner exists to catch.

Test code is excluded from all three gates. A deferred-work marker in a test and row removal
in test setup are normal; flagging them trains the reader to ignore output.

## Waiving a finding

Some findings are correct code. Expired one-time codes should be deleted. An optional config
file that is legitimately absent should not raise. Declare those inline:

```python
# spe:allow delete-allowlist — one-time OAuth codes are single-use by design
conn.execute("DELETE FROM mcp_codes WHERE code = ?", (code,))
```

The waiver may sit on the offending line or anywhere in the contiguous comment block above
it. **A reason is required** — `# spe:allow delete-allowlist` with no reason does not waive
anything, which keeps a waiver from becoming a reflex.

Waivers live in comments rather than in a config file on purpose. A config anchored to a
file and line number silently detaches from the code it was meant to cover as soon as lines
move, and then excuses something else. A comment moves with its line and is visible to
anyone reading the code.

### Whole-file exemptions

When a file's *purpose* triggers a gate — `spe/gates/hollowness.py` necessarily contains the
markers it searches for — use `spe.config.json` in the scanned repo:

```json
{
  "gates": {
    "hollowness": {
      "enabled": true,
      "exempt": [
        { "path": "spe/gates/hollowness.py", "reason": "defines the markers it searches for" }
      ]
    }
  }
}
```

A `reason` is required here too. An exemption without one is dropped and the gate keeps
applying, because an undocumented exemption is indistinguishable from quietly switching a
gate off.

## Tests

```
python -m unittest discover -s tests -t .
```

Every gate ships with planted-failure fixtures asserting **both** directions: every planted
violation is detected, and every clean or waived line is left alone. The second direction is
what determines whether the gate survives contact with a real codebase — a gate that cries
wolf gets switched off, and a switched-off gate enforces nothing.

The fixtures earned their keep on the first run: `delete-allowlist` originally flagged prose
that merely mentioned `DELETE FROM`, and the clean-line assertion caught it. SQL patterns now
require an execution context on the same line.

## Known limitations

- **SQL assembled in one place and executed in another is not detected.** Accepted false
  negative in v1; narrowing false positives matters more for adoption. The fix is dataflow
  analysis, not a wider regex.
- **`silent-failure` on non-Python languages only detects provably empty catch blocks.**
  Python is analyzed with the AST and is much more precise.
- **A handler returning a meaningful default is not flagged.** Distinguishing a deliberate
  fallback from evasion requires reading intent, which is human judgment.
- **These three gates check a small slice of the 200-control register.** Everything else is
  unchecked, and an empty report means only that these three found nothing.
