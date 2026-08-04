# Decision Ledger

Decisions made once, recorded here, and reused forever.

This is the mechanism that makes "human involved only at spec and genuine decisions" true
rather than aspirational (`MANDATE.md` §5). Without it, decision extraction just becomes a
new way to consume the owner's hours: the same questions get re-asked every project, and the
answers get re-derived — differently — each time.

## How it works

- Every entry has a **scope**: `ALL PROJECTS` (a standing policy) or a named project.
- An agent facing a decision **must check this ledger first**. If an entry covers it, the
  agent applies it and does not ask.
- If no entry covers it, the agent **escalates and stops**. It does not choose.
- Entries are never edited in place. A decision that changes gets a new entry that
  supersedes the old one by number, and the old entry stays — superseded, not deleted.

## Status values

| Status | Meaning |
|---|---|
| `ACTIVE` | In force. Apply it. |
| `SUPERSEDED BY nnnn` | Replaced. Kept for history; do not apply. |

---

## 0001 — Collected data is archived, never destroyed

- **Scope:** ALL PROJECTS
- **Status:** ACTIVE
- **Decided:** 2026-08-02 by Nicole Dufrene
- **Source:** `fapp-claudedev/CLAUDE.md` rule 4, confirmed against live findings

Data that has been collected is never hard-deleted. It is archived — a flag, status, or
timestamp that hides the record from a view while the record itself is preserved. This
covers non-matching rows, superseded versions, rejected candidates, and anything a user
removes through the interface.

**Applies to:** every `DELETE FROM`, `DROP`, `TRUNCATE`, ORM delete, and file removal that
touches collected data.

**Does not apply to:** single-use credentials that expire by design (one-time codes, refresh
tokens), operational logs under a stated retention window, monitoring status rows, and
temporary working files that were never the record of anything. These are declared with an
inline `spe:allow delete-allowlist — <reason>` waiver, not silently exempted.

---

## 0002 — Withdrawn human corrections are retained

- **Scope:** ALL PROJECTS
- **Status:** ACTIVE
- **Decided:** 2026-08-02 by Nicole Dufrene

When a person removes a manual correction, override, or judgment they previously entered,
the record of that correction is kept and marked withdrawn. It is not deleted.

**Why:** the history of human corrections is itself data — it shows what was overridden,
when, and by whom. In `fapp-claudedev/cfo_fee_facts.py` the withdrawal path currently
destroys the durable row, so there is no record that a correction was ever made.

---

## 0003 — Rebuild-in-place is prohibited; prior versions are timestamped and kept

- **Scope:** ALL PROJECTS
- **Status:** ACTIVE
- **Decided:** 2026-08-02 by Nicole Dufrene

A refresh, recompute, or re-sync may not empty a table and reinsert. The prior contents are
retained with a version timestamp so the previous state remains readable and comparable.

**Why:** wipe-and-rebuild means a bad upstream response silently destroys good data — a
short result from an API replaces a complete table with an incomplete one, and nothing
records what was there before. In `fapp-claudedev` this pattern appears in `store.py`
(`replace_matters`), `firm_settings.py` (`firm_people`), `leases_examples.py`
(`lease_examples`), and `cfo_fee_facts.py` (`cfo_fee_facts`).

`lease_examples` is the sharpest case: if that table holds learned corrections from the
lease-review training loop, a rebuild destroys training data.

---

## 0004 — Retention caps on generated artifacts are removed

- **Scope:** ALL PROJECTS
- **Status:** ACTIVE
- **Decided:** 2026-08-02 by Nicole Dufrene

Generated reports, snapshots, and derived artifacts are kept in full. No "keep only the
latest N" policy.

**Why:** `fapp-claudedev/cfo_page.py` keeps only the 10 most recent snapshots per report
type. Comparing a figure to the same figure a year ago is exactly the question a CFO report
exists to answer, and a rolling window makes it unanswerable.

---

## 0005 — User-initiated deletion means hide, not destroy

- **Scope:** ALL PROJECTS
- **Status:** ACTIVE
- **Decided:** 2026-08-02 by Nicole Dufrene

When a person deletes something through the interface, the record is hidden from the view
and preserved in storage. The interface may continue to say "Delete"; the storage layer
archives.

**Affects in `fapp-claudedev`:** time entries (`store.py`), published articles
(`store.py`), Zoom meetings (`zoom_transcript_worker.py`), CFO documents (`cfo_page.py`).

---

## 0006 — Generic delete helpers must refuse unfiltered deletion

- **Scope:** ALL PROJECTS
- **Status:** ACTIVE
- **Decided:** 2026-08-02, traced and proposed by Claude, confirmed by decision 0001

A utility that deletes by variable table name must refuse to run without filters.
`fapp-claudedev/feeds/sqlite_adapter.py` already does this and currently has no callers.

**Known gate blind spot:** a future caller would be written `adapter.delete("table", {...})`
with no SQL on the line, so the `delete-allowlist` gate would not see it. Recorded in the
runner's known limitations. Closing it requires either a project-specific pattern for the
adapter's method name or call-graph analysis.
