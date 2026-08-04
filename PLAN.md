# Build Plan — Software Production Engine

_Authored 2026-08-02. Subject to `MANDATE.md`. Requires explicit approval before any phase begins._

---

## 0. Scope

**In scope.** A reusable engine that turns a specification into production-grade software and
enforces its standard mechanically rather than by instruction. Its parts:

| Part | What it is |
|---|---|
| Gate runner | Deterministic checks over a codebase. Built, Phase 0. |
| Gate library | Enough gates to cover the mechanizable share of 350 controls. |
| Coverage manifest | Generated map of control → enforcement, including what is **not** covered. |
| Spec format | Machine-readable requirements, permission model, data classification. |
| Decision ledger | Decisions made once, reused forever. Started, Phase 0. |
| Checklist library | Domain question sets that grow from real failures. |
| Agent roles | Interviewer, architect, test author, implementer, adversary — wired so none can self-certify. |

**Out of scope, explicitly.** Fixing `fapp-claudedev`, `genealogy-database`, `blg-website`, or
`blg-article-finderwriter`. These are **test corpus**. They exist to prove a gate detects what it
claims and stays quiet otherwise. They are never repaired as part of this work. When the engine is
finished it can be pointed at them; that is the payoff, not the work.

This exclusion is written first because it is the boundary that was already crossed once. Concrete
findings pull toward fixing them, because fixing something is what finished work looks like — the
completion bias named in `MANDATE.md` §3, operating on the builder of the thing meant to prevent it.

**Out of scope, secondary.** Distributing the engine as a package; a hosted or GUI surface;
supporting stacks beyond Python, JavaScript/TypeScript, and PHP; and any migration, deployment, or
change to a live system.

---

## 1. Sequencing rationale

`portfolio-evidence.md` Finding 4 records why the genealogy build died: 29 tables, 6 pipelines, ~12
subsystems all declared "not optional," with *no single document ever going end-to-end early*.
Finding 5 records the inverse failure — specification accumulating with no implementation.

**This plan is sequenced against both.** Breadth is deferred until one requirement has travelled the
entire pipeline. Phase 3 is the largest body of work and it is deliberately placed *after* the thin
slice, so that if the loop turns out to be wrong, it is wrong before fifty gates are built on top
of it.

---

## 2. Phases

### Phase 1 — Gate layer foundation

Turn the runner from three hard-coded checks into a coverage system.

| Deliverable | Definition of done |
|---|---|
| Control corpus as data | All 350 controls (software 1–200, website 1–150) in a machine-readable file, verbatim, in order, numbering intact |
| Gate manifest | Each gate declares id, controls enforced, languages, severity, failure condition |
| Coverage report | Generated from gates that exist. Names every control with no gate as **uncovered** |
| Waiver + exemption system | Inline waivers and file exemptions, both requiring a stated reason. Built, needs hardening |
| **DEFECT-001** — exemption paths are root-relative | Found during self-verification 2026-08-02. `spe.config.json` is loaded from the scanned root, so `python -m spe .` inside `runner/` honours its exemptions while `python -m spe ..` from the parent does not — the same file is exempt or not depending on where the runner is pointed. This breaks the determinism claim in `runner/README.md`. Fix: resolve config by walking up from each scanned file, or match exemptions against a repo-anchored path. Not fixed: Phase 1 is unapproved |
| Blind-spot register | Machine-readable, printed on every run — not README prose |
| Remaining 5 evidence-justified gates | Route permission coverage, module size/layering, test-gate-wired, vertical-slice, spec-to-implementation ratio |
| CI wiring | Runner executes on push and PR against itself |

**Scope lock:** may touch `runner/`, `controls/`, `docs/`. May not touch `engineering-playbook/`
(the register is read-only input — the playbook's own rule forbids renumbering or weakening) or any
repository outside `software-production-engine`.

**Verification:** coverage report runs and shows a real number; every gate has planted-failure tests
asserting both directions; runner passes its own gates with zero unexplained findings.

---

### Phase 2 — Thin vertical slice

One requirement travels the whole pipeline. Minimum breadth, maximum depth.

| Deliverable | Definition of done |
|---|---|
| Spec format | Requirement id, statement, acceptance criteria with literal values, forbidden substitutions, touched artifacts, status |
| Falsifiability check | Rejects any acceptance criterion with no literal value, no named exception, no status code. Bans *correct, appropriate, properly, reasonable, handles* |
| Decision extraction | Enumerates every decision a task requires; implementation blocked while any is `OPEN` |
| Ledger consultation | Decisions resolve from `decisions/` automatically; only genuinely new ones escalate |
| Traceability gate | Every requirement has a passing test; every changed production file is executed by a requirement-tagged test |
| Goalpost lock | A PR touching acceptance tests without touching the spec fails |
| Deviation ledger | `BLOCKED` requirements cannot be marked implemented; release refuses while any is open |

**The slice:** one small requirement — spec written, decisions extracted, acceptance test authored
before implementation, implementation produced, gates run, green. End to end, no shortcuts.

**Scope lock:** may touch `spec/`, `decisions/`, `runner/`. May not touch the corpus repositories.

**Verification:** the slice runs start to finish and produces a green result; then deliberately
break each gate in turn and confirm each fails as specified.

---

### Phase 3 — Full gate coverage

The bulk of the work, deliberately last of the build phases.

All 350 controls classified as **automated**, **evidence artifact**, or **human judgment**, with
gates built for the automated set. Below is the gate-family map — every control number is accounted
for, so nothing can be silently omitted.

#### Software controls 1–200

| Controls | Gate family | Type |
|---|---|---|
| 1, 26, 27, 55, 84, 85 | `authz-coverage` — route inventory reconciled against a declared permission matrix; deny-tests generated per DENY cell | automated |
| 2, 187, 188 | `tenant-isolation` — generated cross-tenant access tests; 404 not 403 | automated |
| 3 | `secret-scan` — gitleaks equivalent | automated |
| 4, 56, 57 | `input-validation-coverage` — every endpoint has a server-side schema; protected fields unbindable | automated |
| 5, 81, 90, 133, 134, 136 | `auth-lifecycle-tests` — required test set exists and passes | automated |
| 6, 20, 93, 111 | `recovery-evidence` — restore and rollback exercised, dated | artifact |
| 7, 122, 123, 142 | `destructive-action-guard` — declared destructive actions carry scope, confirmation, reversibility | automated |
| 8, 113 | `transaction-boundary` — multi-write operations bounded or compensated | automated |
| 9, 10, 91, 125 | `idempotency` — retryable operations carry keys; duplicate-request tests | automated |
| 11, 14 | `server-derived-values` — price, role, plan, ownership, entitlement never client-trusted | automated |
| 12, 69, 70, 71, 72 | `file-handling` — upload restrictions, no public private storage, signed-URL expiry | automated |
| 13, 80, 199 | `rate-limit-coverage` — declared endpoints carry limits | automated |
| 15 | `webhook-verification` — signature, dedupe, out-of-order | automated |
| 16, 98 | `silent-failure` — **built** | automated |
| 17, 94, 95, 96, 97, 163 | `monitoring-coverage` — declared important failures have alerts | automated |
| 18, 170 | `audit-trail-coverage` — declared consequential actions write audit rows | automated |
| 19 | `log-scrubbing` — classified fields never reach log calls | automated |
| 21, 22, 36, 37 | `db-constraints` — required, unique, FK, ownership enforced in schema | automated |
| 23 | `money-type` — no binary float on monetary values | automated |
| 24, 25 | `time-canonical` — timezone-aware storage; DST tests where scheduling matters | automated |
| 28, 30, 115 | `migration-discipline` — versioned, reversible, destructive migrations guarded | automated |
| 29 | manual production schema change procedure | human |
| 31, 32, 33, 34, 35 | `delete-allowlist` — **built** — plus retention policy artifact | automated + human |
| 38 | `index-coverage` — query plans checked against realistic data | automated |
| 39, 40, 41 | `bounded-queries` — no unbounded fetch; pagination on growing collections | automated |
| 42, 43, 44, 45, 46 | `canonical-source` — one authority per fact; conflict rule declared; version history | automated + human |
| 47, 48, 49, 50 | `data-exchange` — export completeness, import validation, encoding round-trip | automated |
| 51, 52, 53, 54 | `sast` — injection, XSS, CSRF, unsafe redirect | automated |
| 58, 62, 82, 83 | `auth-policy-conformance` — config asserted against ledger entries | automated |
| 59, 60, 61 | `admin-controls` — MFA, individual accounts, exposure | artifact |
| 63, 160, 161 | credential rotation and review process | human |
| 64, 65, 66, 67 | `env-separation` — distinct secrets, test-mode guards on real sends and charges | automated |
| 68 | least-privilege review | human |
| 73, 117, 118 | `dependency-scan` — CVEs, lockfile discipline, update review | automated |
| 74, 75 | package provenance judgment | human |
| 76, 77 | `headers-cors` — live response assertions | automated |
| 78, 79 | `error-exposure` — no stack traces or raw DB errors to users | automated |
| 86, 87, 88, 89, 92 | `test-coverage-matrix` — workflows, failure paths, permission boundaries, payments, deletion | automated |
| 99, 100, 101, 102, 103 | `resilience` — long work out of request paths, bounded retries, explicit timeouts, containment | automated |
| 104, 105 | `feature-independence` — each feature disabled in turn; app boots, others pass | automated |
| 106, 107 | capacity and storage limits for the product model | human |
| 108, 109, 110, 197, 198 | `spend-bounds` — expensive operations capped; budgets and alarms present | automated |
| 112, 114 | staged exposure and kill-switch policy | human |
| 116 | `config-drift` — detected or reconciled | automated |
| 119, 120 | deprecation and compatibility obligations | human |
| 121 | `error-path-parity` — the effort floor; error branches tested, boundaries covered | automated |
| 124 | `success-honesty` — success reported only after success, or described as pending | automated |
| 126, 127, 128, 129 | input preservation policy | human + automated |
| 130, 131, 132, 135, 137 | `account-lifecycle` — transfer, offboarding, invitations, permission invalidation | automated + human |
| 138, 139, 140, 141, 146 | `accessibility` — automated axe-class checks plus state completeness | automated |
| 143, 144 | supported device and browser matrix | human |
| 145 | `large-dataset` — core screens usable at scale | automated |
| 147, 148, 149, 150 | `claims-review` — **release blocker, human only.** No agent may pass this | human |
| 151, 152, 153 | `inventories` — vendor list, data map, subprocessors | artifact |
| 154, 155, 156 | incident response, security contact, vulnerability disclosure | human |
| 157, 158, 159 | production ownership and access inventory | artifact |
| 162 | `domain-protection` — renewal and ownership controls | automated |
| 164, 165, 166, 167 | `email-integrity` — SPF, DKIM, DMARC, deliverability, identity separation | automated |
| 168, 169 | support tooling and privilege | human |
| 171 | `deploy-reproducibility` — documented and reproducible from source | automated |
| 172 | maintainable by someone other than the builder | human |
| 173, 174, 175, 176, 177 | `system-documentation` — architecture, dependency map, data flow, env vars, integration inventory, generated | artifact |
| 178, 179, 180 | DR priorities, RTO/RPO, maintenance mode | human |
| 181, 182, 185, 186 | `model-boundary` — model output untrusted, cannot act unvalidated, retrieved content is data | automated |
| 183 | which AI actions require human confirmation | human |
| 184 | prompt-injection threat model | human |
| 189, 190 | sensitive-data policy and vendor terms | human |
| 191, 193, 194 | `output-verification` — citations verified, deterministic validation after extraction, traceability | automated |
| 192, 200 | confidence thresholds and uncertainty surfacing | human |
| 195, 196 | `prompt-versioning` — prompts, models, retrieval logic versioned; model changes tested | automated |

#### Website controls 1–150

Covered by families mapped to the register's own module boundaries: governance (1–10), discovery
(11–20), architecture (21–30), HTML (31–45), CSS (46–60), accessibility (61–80), security (81–95),
forms and data (96–110), performance (111–125), content, SEO and migration (126–140), release and
operations (141–150). Classification detail is produced as data in Phase 1's corpus file, on the
same three-way scheme.

The migration family (126–140) inherits `blg-website`'s evidence directly: a migration ledger row
per old URL with an approved outcome, and prelaunch crawl reconciliation.

**Scope lock:** may touch `runner/`, `controls/`, `docs/`. Same prohibitions as Phase 1.

**Verification:** the coverage report accounts for all 350 with no control unclassified. Every
automated gate has planted-failure tests. The count of controls with no gate is published, not
hidden.

---

### Phase 4 — Agent roles

| Role | Constraint |
|---|---|
| Interviewer | Asks only what the ledger cannot answer. Writes spec files. Blocks while anything is `UNANSWERED` |
| Architect | Emits interface contracts and the layering constraint file, frozen before components are built |
| Test author | Writes acceptance tests from the spec before implementation exists. Not the implementer |
| Implementer | Bounded tasks with machine-checkable exit criteria. Declares `files_allowed` first |
| Adversary | First pass is spec-to-implementation fidelity, second is defects. Must produce a failing test to claim a finding. Has no "approve" output |

Wiring rule, non-negotiable: **no agent declares its own work done.** The runner does. Failures
return to the agent and it loops. The human sees output only when green or when a decision escalates.

**Scope lock:** may touch `agents/`, `spec/`. May not modify gates to make an agent pass.

---

### Phase 5 — Proof

Build one small real product end to end with the engine. Not a demo, not the corpus repositories —
something whose failure would be visible.

**Definition of done:** every gate green; every requirement traced; the deviation ledger empty; and
a person other than the builder can deploy and operate it from the generated documentation
(control 172, verified by doing it, not by asserting it).

---

## 3. Rules the builder is bound by

These apply to me, on this work, and each is checkable.

1. **Scope lock per phase.** Files outside the declared set are not touched. Touching one is a
   reported failure, not a silent act. This is the gate that would have caught the drift on
   2026-08-02.
2. **Everything runs through the runner before delivery.** Findings are fixed or waived with a
   stated reason. Nothing is handed over dirty.
3. **No self-certification.** The runner declares done. "It's finished" is not a sentence the
   builder writes.
4. **No hollowness.** No `TODO`, no placeholder, no "for now" in delivered work.
5. **Planted-failure tests are part of a gate, not follow-up.** Both directions — violations caught,
   clean lines untouched. A gate without them is not built.
6. **BLOCKED means stop.** Work that cannot be done as specified is marked `BLOCKED` with a reason.
   It is never simplified, approximated, or substituted.
7. **"No findings" may never mean "not checked."** Unscanned, unparsed, and uncovered are reported
   explicitly and distinctly from clean.
8. **The corpus is never repaired.** Findings in `fapp-claudedev` and the others are test data.

---

## 4. Known risks

| Risk | How it is contained |
|---|---|
| The three-way classification is a hypothesis | The coverage report shows real state, not planned state. Controls move category as gates are built, and the movement is visible |
| Gate noise causes abandonment | Report-only by default; blocking on changed lines only; every gate tuned against the corpus before it counts as built |
| The engine becomes an unmaintained product | Subject to its own gates from Phase 1, and small enough to read |
| Full coverage takes longer than expected | Phase 3 is decomposable control by control; partial coverage is a published number, not a failure state |
| Drift recurs | Scope locks per phase, plus the vertical-slice and spec-ratio gates applied to this repository |

---

## 5. What is needed from the owner

**To start Phase 1:** approval of this plan, and write access to this repository or a commitment to
pull and commit locally.

**During Phase 2:** answers to decision-extraction escalations as they arise — expected to be few,
since the ledger already carries six standing entries.

**Before Phase 5:** the choice of what to build as proof.

**Not needed:** review of gate findings. Findings go to the agent. The owner sees decisions and
exceptions.

---

## 6. Status

Phase 0 complete: `MANDATE.md`, `portfolioevidence.md`, `humanjudgmentcontrols.md`,
`decisions/README.md`, and `runner/` with three gates, seventeen passing tests, and a clean
self-scan.

No phase in this plan has begun. Nothing outside `software-production-engine` has been modified.
