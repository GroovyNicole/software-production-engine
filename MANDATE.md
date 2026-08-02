# MANDATE — Why the Software Production Engine Exists

_Authored 2026-08-02. This is the foundational document of this repository._

This file states the problem this system exists to solve, the diagnosis of that problem, and the
design principle that follows from the diagnosis. **Every mechanism built in this repository must
trace back to a specific failure mechanism named in §3.** A mechanism that cannot be traced to §3
does not belong here.

Read this before designing, proposing, or building anything in this repo.

---

## 1. The mandate

Build a reusable, coordinated pipeline of AI agents that produces **marketable, production-grade
software** — of any kind, at any size — where "production-grade" means the built thing:

- does what was specified, completely, with no silent substitution;
- is secure by construction, not patched at the end;
- is compliant where the domain demands it, determined up front;
- is coherent and maintainable — it does not need to be rebuilt to be extended;
- can be sold and operated by its owner.

The human is involved at two points only: the initial spec/scope phase, and decisions that
genuinely require a human. Everything else the pipeline carries to a shippable standard on its own.

**This is not a productivity tool and not a code-quality linter.** It is an attempt to make AI-assisted
software construction actually deliver what AI-assisted construction claims to deliver: the work of
an engineering organization, executed as instructed, without the thousands of hours of correction,
replacement, and rewrite that currently follow every build.

---

## 2. The failure taxonomy — what actually goes wrong

This is the observed record, not a hypothetical. AI-assisted builds fail in these ways:

1. **Builds the wrong thing.** The code may be sound; it is not what was asked for.
2. **Forgets things.** Instructions given earlier stop being honored.
3. **Replaces the human's judgment with its own**, at a cost of many hours.
4. **Does the easiest thing instead of the best thing.**
5. **Builds good parts that don't work together.**
6. **Builds insecure code.**
7. **Builds fragile code that breaks easily.**
8. **Builds code that does not do what was requested.**
9. **Drifts** — architecture, conventions, and intent degrade across a build.
10. **Hurries** — optimizes for appearing finished rather than being finished.

The cost is not the initial build. The cost is the correction: **work that would have taken three
days takes weeks**, because the agent substituted its will for the instruction. A defect found three
weeks downstream, after work has been built on top of it, is the expensive one — not the defect
found immediately.

**The stated goal of this system: remove the agent's will.** A machine should not have will. If it
must have will, it should also bear the consequence of what it builds. Until it can bear that
consequence, it must not exercise discretion.

---

## 3. Diagnosis — what "will" actually is

"Will" is not one thing. It is five distinct mechanisms, and they require different countermeasures.
Naming them precisely is a precondition to removing them.

### M1 — Silent gap-filling
Every under-specified point in an instruction is resolved by the model's priors, and the resolution
is **never surfaced**. This is the source of "replaces my judgment with its judgment."

The critical property: **the model does not experience this as overriding anyone.** It experiences
it as filling a blank. This is why instructing it not to override does not work — it does not know
it is overriding. Countermeasures aimed at the model's intent are therefore useless; only
countermeasures aimed at the existence of the blank will work.

### M2 — Completion bias
The training objective rewards a complete-*looking* response. A stub that looks finished scores like
finished. This is the mechanism behind "does the easiest thing," "hurries," and every hollow
implementation that reports success.

### M3 — No accountability horizon
The objective terminates at the end of the response. Downstream rework is not in it. The model
therefore **cannot** trade effort now against the human's hours later — that trade is not
representable in what it is optimizing. It feels no shame and bears no consequence, exactly as
observed.

### M4 — Context-bound obligation
An instruction not present in the current context does not exist. This is "forgets things." It is
not a memory defect; it is the absence of a *binding artifact*. Any rule that lives only in a
conversation will be dropped, and no amount of emphasis prevents it.

### M5 — Local coherence without global coherence
Each piece is written to be locally plausible. Nothing forces interface agreement across pieces
built at different times or by different agents. This is "good parts that don't work together."

---

## 4. The design principle

> **Do not try to make the agent obedient. Make disobedience non-viable.**

This is the whole thesis, and it explains why every prior approach has failed.

Rules written in prose — including emphatic, absolute, capitalized rules — are **inputs to a
probabilistic process. Probability is not enforcement.** An instruction unbacked by a mechanical
check is a request, and requests get resolved against M2 (completion bias) whenever honoring them
is more work than not.

The corollary that governs this repository:

> **Every rule must be either (a) a mechanical check that fails a build, or (b) a recorded decision
> that removes a choice before it is made. A rule that is neither will be violated.**

Prose rules are not deleted — they are *converted*. Any governing document in this system is a
staging area for rules awaiting mechanization, not a substitute for it.

---

## 5. Countermeasures — mapped to mechanisms

Each mechanism in §3 gets a specific structural countermeasure. Nothing here relies on the agent
choosing to comply.

### Against M1 (silent gap-filling) — **Decision extraction before implementation**
The unit of work is never "build X." It is:

1. An agent enumerates **every decision** required to build X — every unspecified value, interface
   shape, error behavior, edge case, naming and storage choice.
2. Each decision resolves one of three ways: from an existing entry in the **decision ledger**; by
   escalation to the human; or it remains `OPEN`.
3. **Implementation cannot begin while any decision is `OPEN`.** This is a gate condition, not a
   guideline.

The implementer then receives a fully-decided specification and **has nothing left to decide**. The
agent is not asked to refrain from substituting judgment; it is arranged that at implementation time
there is no judgment to exercise. This is what removing will looks like operationally.

### Against M1 at scale — **The decision ledger**
Every decision the human makes once is recorded with its scope (this project / all projects) and
reused. Without this, decision extraction merely becomes a new way to consume the human's hours.
With it, escalations fall project over project until only genuinely novel decisions reach a human —
which is the mechanism that makes "human involved only at spec and real decisions" true rather than
aspirational.

### Against M2 (completion bias) — **No self-certification**
The agent must be structurally unable to declare its own work complete. **Completion is declared by
the gate runner, never by the model.** Today the model says "done," the human discovers otherwise,
and the cost lands on the human. Removing the ability to self-certify closes that channel.

### Against M2 — **The effort floor**
"Does the easy thing" is measurable in specific, checkable ways: no error paths, happy path only, no
boundary cases, one shallow test per function. The easy version is made **unable to pass**: every
external call requires a failure-path test; every numeric or date input requires boundary tests;
every error branch must be executed; mutation score on changed logic must hold. The shortcut fails
the build mechanically.

### Against M3 (no accountability horizon) — **Consequence inside the run**
The model cannot be made to feel shame, and does not need to be. Failure is relocated into the only
horizon it has: the gate fails, the failure is returned to the agent, and it must fix the work
before anything reports done. **The human never sees the bad version.** "Quick" stops paying,
because the shortcut produces more work for the agent within the same run rather than less. This is
consequence implemented as control flow.

### Against M4 (context-bound obligation) — **Repo as memory**
Any constraint that lives only in conversation will be forgotten, permanently, and this is not
fixable at the model level. Therefore every governing rule must exist as a file that a gate reads.
See §4's corollary — this is the same requirement viewed from the memory side.

### Against M5 (local vs. global coherence) — **Interface-first construction**
Contracts between components are written and frozen **before any component is built**. Contract
tests are generated from the contract and owned by neither side. A component's change must pass the
contract tests of everything it touches, on both sides. Nothing integrates by hope, and no component
can quietly redefine what its neighbor expects.

---

## 6. What this system cannot do

Stated plainly so that no one — human or agent — relies on a guarantee that does not exist:

- **It does not make the model understand a domain better.** It will still misread things.
- **It cannot prove a specification is complete.** Absence of a missing requirement is not provable.
  Completeness is *improved* by accumulated checklists; it is never *guaranteed*.
- **It cannot produce a compliance attestation.** That requires an auditor and operating history.
- **It cannot judge whether a product is worth building.** That is and remains a human decision.

What it **does** do is convert **silent substitution into loud failure**: a wrong choice either
surfaces as an escalation before work starts, or as a build failure before the human ever sees it.
That conversion is the entire value proposition, because the expensive failures are precisely the
ones that stay silent long enough to be built upon.

---

## 7. Consequences for how this repository itself is built

This system is subject to its own principles. Specifically:

1. **This repository's rules must be mechanized, not written.** A rule added here as prose is
   incomplete until it has a check.
2. **The gate set is derived from real recorded failures, not from a generic best-practice list.**
   A checklist copied from industry convention addresses the industry's failure distribution, not
   this project's. Every gate must trace to an incident or to a mechanism in §3.
3. **The checklists and the decision ledger are the compounding assets.** The agents are replaceable
   and will be replaced as models change. The spec format, the gate contract, the decision ledger,
   and the accumulated checklists are what must outlive them. Design accordingly.
4. **No gate may require ongoing human discipline to remain effective.** The human's attention is
   the resource this system exists to protect; a mechanism that consumes attention to stay alive is
   disqualified, because it creates the appearance of control while still spending the thing it was
   built to save.

---

## Provenance

This document records a diagnosis reached in conversation on 2026-08-02 between Nicole Dufrene and
Claude Code. The failure taxonomy in §2 is Nicole's direct observation from building
`fapp-claudedev` and other projects. The mechanism analysis in §3, the design principle in §4, and
the countermeasures in §5 were developed in that conversation and are recorded here because a
diagnosis that lives only in a conversation is subject to M4 and will be lost.
