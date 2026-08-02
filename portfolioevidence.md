# Portfolio Evidence

_Swept 2026-08-02. Empirical companion to `MANDATE.md`._

## Purpose

`MANDATE.md` argues that prose rules are requests and only mechanical gates are enforcement. This
document is the evidence for that argument, measured across five repositories owned by the same
person, built with AI assistance, under explicit written rules.

**Every gate proposed by this system must cite a finding here.** A gate that cannot name the repo and
line where its absence cost something does not belong in the pipeline — it is an industry checklist
item, not a derived control. (`MANDATE.md` §7.2.)

## Method

Each repository was swept with the same mechanical checks: file and module counts, test file counts,
CI configuration, and greps for `TODO|FIXME|XXX|HACK|placeholder|for now|not implemented`, silent
exception handlers, hard-delete statements, and hardcoded credentials. Every check completes in
under one second. No check required judgment, and every one is reproducible.

`fapp-claudedev` was a full clone. The other four were shallow (`--depth 1`), so commit history was
not available for them and no history-based claim is made about them.

---

## The portfolio

| Repository | Test files | Test gate wired? | CI | TODO/placeholder | Silent `except`/`catch` | Hard deletes |
|---|---|---|---|---|---|---|
| `fapp-claudedev` | 5 (141 modules) | no | none | 110 | 61 | 28 |
| `blg-website` | 0 | no | none | 21 | 0 | 0 |
| `blg-article-finderwriter` | 2 | **no** | deploy only | 0 | 0 | 0 |
| `genealogy-database` | 0 | no | syntax check → deploy | 59 | 47 | 11 |
| `faithstorm` | *empty repository* | — | — | — | — | — |
| **`article-engine` (template)** | **6** | **yes — `npm test`** | **`npm test` on push and PR, Node 18/20/22** | — | — | — |

---

## Finding 1 — Gates exist only where nothing ships

Exactly one artifact in the portfolio has an executable test gate: the `article-engine` template
inside `engineering-playbook/templates/`. It has never been used to build a shipped product.

Every repository that actually ships has no enforced gate. Two have no CI at all. One has CI that
deploys without running a test. One has CI that compile-checks Python syntax and then deploys.

**This is not a coincidence to be explained away — it is the predicted result.** A gate that lives in
a template costs nothing to keep. A gate that runs on every push imposes friction at exactly the
moment someone wants to ship, and nothing prevents its removal.

## Finding 2 — Gates do not survive the trip from template to production

`blg-article-finderwriter` and the `article-engine` template are the same lineage. The difference is
entirely in the enforcement layer:

| | Template (v0.2.0) | Live repo (v0.1.0) |
|---|---|---|
| `package.json` scripts | `start`, `score`, `draft`, `check:customization`, `test`, `test:golden` | `start`, `score` |
| Test files in `tests/` | 6 | 2 |
| CI | runs `npm test` on push and PR across three Node versions | deploys `output/*.json` to the droplet; runs no test |

The live repository has **no `test` script at all**, is missing `claim-support`, `config`,
`research-policy`, and `storage` test files, and has no `check:customization` gate.

Shallow clones prevent determining whether the gates were removed on the way out or improvements
were never carried back in. **Both directions support the same conclusion:** the enforcement lives
where the work does not.

Note the second-order effect: this repo shows **0 TODOs and 0 silent catches** — the cleanest source
in the portfolio. Its code quality is good. Its *verification* is absent. Clean code and enforced
correctness are different things, and only one of them survives without a gate.

## Finding 3 — The most emphatic rule in the portfolio was violated anyway

`fapp-claudedev/CLAUDE.md` rule 4 is marked **ABSOLUTE**, appears first in the file, is capitalized
and bolded, and is read at the start of every session:

> **WE KEEP EVERYTHING — NEVER DELETE DATA, ARCHIVE IT.** … This includes non-matching rows,
> superseded versions, and rejected or unused candidates.

Two violations in the same repository:

- **`email_archive.py:253`** — `c.execute("DELETE FROM archive_messages WHERE conversation_id=?", (cid,))  # drop any stored bodies`, executed when `keep` is false. This hard-deletes the message bodies of non-matching conversations — the exact case the rule names.
- **`cfo_fee_facts.py:371`** — `c.execute("DELETE FROM cfo_fee_facts")` wipes the entire table on every rebuild, destroying superseded versions.

Of the 28 hard-delete sites in the repository, several are legitimate: expired OAuth codes
(`mcp_server.py`), TTL sweeps on `ops_status` and `error_email_log`. **That distinction is precisely
what an allowlist encodes and what prose cannot.**

**This is the single strongest finding in the portfolio.** The rule was stated in the most forceful
language available, positioned for maximum salience, and re-read every session. It was still broken.
Not through disagreement — through ordinary local convenience at line 253. A check that fails the
build on `DELETE FROM` outside an allowlist would have caught both cases in milliseconds, forever,
without consuming a minute of human attention.

## Finding 4 — A failed build, its causes, and a gap in the 200-control register

`genealogy-database/IMPROVEMENT_REVIEW.md` documents a build where *"the actual Perplexity-built code
is gone (deleted)."* It attributes the failure to three causes, none of which are about the design
being wrong:

1. **Split brain** — orchestration logic lived in both n8n JSON and Python. Two authorities for one
   responsibility. Covered by the "one authoritative engine per calculation" rule; enforceable by an
   engine registry that fails on duplicate registration.
2. **Big-bang scope** — 29 tables, 6 pipelines, ~12 subsystems, all declared "not optional," with
   *"no single document ever going end-to-end early."*
3. **Concrete technical mismatches** (notably embedding dimension) surfacing as confusing failures.

**Cause 2 is not covered by any of the 200 controls.** The register governs the properties of a built
system; it says nothing about build sequencing. This is a new control derived from actual failure
history rather than from convention:

> **A vertical slice must pass end-to-end before subsystem N+1 may begin.** One complete path —
> ingest through output — must run against real input and pass its acceptance test before additional
> subsystems are started. Gate condition on the build plan, not the code.

This is the first entry in the compounding checklist library described in `MANDATE.md` §5.

## Finding 5 — Planning is not the constraint

`blg-website` is 33 MB across 165 files: 34 markdown documents, 35 text files, 48 images, 13 HTML
files, and **345 lines of PHP**. Zero tests. No CI.

The planning artifacts are genuinely strong. `BLG-Website-Migration-Report.md` correctly inventories
~300 URLs, identifies that media is hosted on infrastructure the firm does not own, catches that the
domain is registered independently of the CMS (which de-risks cutover), specifies staging with
noindex and password protection, DNS TTL lowering, and a rollback window. Its accessibility section
flags reliance on an accessiBe overlay and 5 of 7 images missing alt text — matching website control
33, which prohibits treating an overlay score as sole accessibility evidence. `BLG-Redirect-Map.md`
correctly concludes that most of the ~300 URLs need no redirect and enumerates only the rules
actually required.

**This is competent professional work, and the repository still contains almost no implementation.**
A shallow single-commit clone cannot prove the build never happened — it may have happened outside
version control, which would itself be a finding. What is verifiable: the ratio of specification to
implementation in this repository is roughly 200:1 by file count.

The failure mode this names is distinct from the others in this document and does not appear in the
200-control register either:

> **Plans are cheap to produce and are produced repeatedly; implementation is not.** An agent under
> completion bias will satisfy "make progress" by generating another document, because a document is
> a complete-looking artifact. Enforcement: a project may not accumulate specification artifacts past
> a defined threshold without a passing end-to-end acceptance test on at least one requirement.

Together with Finding 4, this makes two of the register's gaps sequencing problems — which is
consistent with the register governing artifacts rather than process.

---

## Gates justified by this evidence

Each row cites its origin. No gate appears here without one.

| Gate | Failure condition | Evidence |
|---|---|---|
| **Delete allowlist** | `DELETE FROM`, `DROP TABLE/COLUMN`, `TRUNCATE`, or ORM delete outside an explicit allowlist | Finding 3 — `email_archive.py:253`, `cfo_fee_facts.py:371` |
| **No silent failure** | bare `except`, or `except`/`catch` whose body is only `pass`/empty | 61 sites in `fapp`, 47 in `genealogy-database` |
| **Test gate must be wired** | test files exist but no command runs them, or CI deploys without running them | Finding 2 — `blg-article-finderwriter` |
| **Route permission coverage** | any route without an authorization denial test | `fapp`: 121 routes, 0 permission tests |
| **Hollowness** | `TODO`/`FIXME`/`placeholder`/`for now` in non-test production paths | 110 in `fapp`, 59 in `genealogy-database`, 21 in `blg-website` |
| **Module size / layering** | module exceeds threshold, or layer import contract violated | `console.py` 4,551 lines; `app.js` 1,949; no `domain/application/infrastructure/web` split despite `CLAUDE.md` §1 mandating it |
| **Vertical slice first** | subsystem N+1 begins before one end-to-end path passes acceptance | Finding 4 — `IMPROVEMENT_REVIEW.md` cause 2 |
| **Spec-to-implementation ratio** | specification artifacts accumulate past threshold with no passing end-to-end test | Finding 5 — `blg-website` |

## What this evidence does not establish

- **Coverage.** Roughly a dozen of the 200 controls were checked mechanically. The rest are untested,
  and no claim is made about them.
- **History.** Four of five repositories were cloned shallow. No claim is made about when gates were
  added or removed, or about the order of events in any of them.
- **Causation.** These repositories correlate absence-of-gates with presence-of-defects. That is
  consistent with the thesis and does not prove it. The disproof would be a repository with enforced
  gates that accumulated the same defects; the portfolio contains no such case, but it also contains
  only one gated artifact.
- **Severity.** A count of 61 silent exception handlers is a count, not a risk assessment. Some may be
  correct. Determining which requires reading each one, which has not been done.
- **`faithstorm`** is empty and contributed nothing.
