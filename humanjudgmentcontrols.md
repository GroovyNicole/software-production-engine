# Controls Requiring Human Judgment

_Derived 2026-08-02 from the Professional Software Engineering Standard (200 controls) in
`engineering-playbook/docs/standards/software/`._

## What this is

Every one of the 200 controls was classified into one of three enforcement types:

| Type | Meaning | Count (est.) |
|---|---|---|
| **Automated** | A check can pass or fail it mechanically. No human needed once built. | ~105 |
| **Artifact** | Satisfied by a generated file that either exists or doesn't (a restore log, a data map, a spend report). Producible by an agent; verifiable by a check. | ~25 |
| **Human judgment** | Requires a policy, risk, legal, or business decision that no check can make. | **~70** |

This document names the ~70. **The count is higher than the initial 40–50 estimate. That estimate was
wrong and is corrected here.**

## Why 70 is not the real workload

Most of these are **decide-once-forever**: you set a standard one time, record it in the decision
ledger, and every future project inherits it. Only a minority are genuinely per-project.

- **Decide once, reuse forever:** ~45
- **Decide per project:** ~25

So the recurring per-project human load is roughly **25 decisions**, not 200 control reviews — and
they are front-loaded into the spec phase, which is where you said you wanted to be involved.

Each entry below is marked `[ONCE]` or `[PER-PROJECT]`.

---

## A. Data lifecycle, retention, and deletion law

The highest-stakes group for a law firm, and the one most likely to be wrong by default.

| Control | The judgment required | |
|---|---|---|
| 31 | What data is retained, why, and for how long | `[ONCE]` + `[PER-PROJECT]` overlay |
| 32 | What "account deletion" actually means in your products | `[ONCE]` |
| 33 | Whether deletion reaches related records, files, indexes, logs, backups, billing — and which exceptions get disclosed | `[ONCE]` |
| 34 | Which legal, financial, security, or operational records must be retained rather than deleted | `[ONCE]` |
| 35 | Where soft deletion applies vs. permanent deletion | `[ONCE]` |
| 46 | Which records are important enough to carry version history | `[PER-PROJECT]` |
| 47, 48 | What an export promises the user — completeness, related data, attachments | `[PER-PROJECT]` |

**Research:** data-retention schedules; the difference between deletion, anonymization, and archival;
GDPR Art. 17 and its exceptions (even if not currently in scope, it defines the vocabulary);
state records-retention rules for legal practice. Note that your own archive-never-delete rule is
already a §35 decision — it should be written into the ledger as a standing policy.

## B. Security policy thresholds

Numbers and durations someone must choose. There is no correct default.

| Control | The judgment required | |
|---|---|---|
| 58 | Password policy: length, complexity, breach checking, MFA requirement, recovery | `[ONCE]` |
| 62 | Access-token lifetime and rotation cadence | `[ONCE]` |
| 80 | What bot/automation defenses are proportionate to the abuse risk | `[PER-PROJECT]` |
| 82 | Whether login/reset responses may reveal that an account exists | `[ONCE]` |
| 160 | How often privileged access is reviewed | `[ONCE]` |
| 161 | Key and long-lived credential rotation schedule | `[ONCE]` |
| 13 | The actual rate limits on login, reset, email, search, upload, forms, expensive API, AI endpoints | `[ONCE]` defaults, `[PER-PROJECT]` tuning |

**Research:** NIST SP 800-63B (the modern password guidance — it contradicts most conventional
advice); OWASP Authentication Cheat Sheet; account-enumeration tradeoffs.

## C. Money, capacity, and spend

| Control | The judgment required | |
|---|---|---|
| 106 | Expected load, and the concurrency/capacity limits that follow | `[PER-PROJECT]` |
| 107 | Storage limits implied by the product/pricing model | `[PER-PROJECT]` |
| 110 | Budget and alert thresholds for cloud, AI, email, storage, third parties | `[ONCE]` defaults |
| 197 | Per-user, per-workflow, and overall AI spending caps | `[ONCE]` defaults |

**Research:** unit economics — cost per tenant, per document, per AI call. This is the group that
produced the $300 incident; the numbers are the control.

## D. "Where appropriate" — risk-appetite calls

The standard deliberately defers these. Someone has to close them or they stay open forever.

| Control | The judgment required | |
|---|---|---|
| 7 | Which destructive actions must be confirmed, scoped, or reversible | `[ONCE]` |
| 103 | Where circuit breaking / backoff is warranted vs. plain error handling | `[PER-PROJECT]` |
| 112 | What validation a release needs given its risk — staging, preview, canary | `[ONCE]` |
| 114 | Which releases need feature flags or a kill switch | `[PER-PROJECT]` |
| 122 | Which consequential actions get an undo | `[PER-PROJECT]` |
| 126, 127, 128 | Which user input is valuable enough to autosave, preserve, or warn about losing | `[PER-PROJECT]` |
| 137 | Whether users can view and revoke their own sessions | `[ONCE]` |
| 180 | Whether the product needs maintenance mode / traffic draining | `[PER-PROJECT]` |

## E. Architecture ownership decisions

Cannot be automated because they define what "correct" means for the rest of the system.

| Control | The judgment required | |
|---|---|---|
| 42 | Where duplicate records or operations would actually cause harm | `[PER-PROJECT]` |
| 43 | The canonical source of truth for each important fact | `[PER-PROJECT]` |
| 44 | Synchronization and conflict rules for duplicated data | `[PER-PROJECT]` |
| 45 | Concurrent-editing policy: last-write-wins, locking, or detection | `[ONCE]` default |
| 119 | The API/integration deprecation process | `[ONCE]` |
| 120 | Backward-compatibility obligations to existing clients and stored data | `[PER-PROJECT]` |

**Research:** optimistic vs. pessimistic concurrency; system-of-record design. Control 43 is the one
that most often gets decided by accident and then causes years of pain.

## F. What counts as important

Every one of these is a check that *can* be automated — but only after a human says what to watch.

| Control | The judgment required | |
|---|---|---|
| 17 | Which failures are important enough to alert on | `[PER-PROJECT]` |
| 18 | Which actions are "consequential" and therefore need an audit trail | `[ONCE]` baseline |
| 86 | Which user and business workflows are the most important | `[PER-PROJECT]` |
| 94 | What a health check should actually assert | `[PER-PROJECT]` |
| 95–98 | Alert thresholds for uptime, DB, queues, background jobs | `[ONCE]` defaults |
| 178 | Disaster-recovery priority order across services | `[PER-PROJECT]` |
| 179 | Recovery-time and recovery-point objectives | `[PER-PROJECT]` |

**Research:** RTO/RPO as business decisions rather than technical ones; SLO/error-budget thinking —
Google's SRE book, chapters on SLOs and alerting, is the standard reference and is free online.

## G. Claims, marketing, and professional liability

**This group is entirely yours and carries the most personal risk.** No agent can be permitted
anywhere near it.

| Control | The judgment required | |
|---|---|---|
| 147 | Whether the product implies legal, medical, financial, or compliance capability it wasn't built and reviewed to provide | `[PER-PROJECT]` |
| 148 | Whether product claims exceed verified technical behavior | `[PER-PROJECT]` |
| 149 | Whether words like *secure*, *encrypted*, *preserved*, *anonymous*, *compliant* have a defined, verified basis | `[PER-PROJECT]` |
| 150 | Treating marketing promises as engineering obligations before publication | `[PER-PROJECT]` |

**Research:** FTC guidance on substantiation of technology claims; unauthorized-practice-of-law
exposure for legal-adjacent software; what "HIPAA compliant" and "SOC 2" may and may not be claimed
to mean by a vendor. A product sold to law firms that implies legal judgment is a licensure and
malpractice question before it is an engineering question.

## H. AI data governance

| Control | The judgment required | |
|---|---|---|
| 183 | Which AI-assisted actions are consequential enough to require human confirmation | `[ONCE]` baseline |
| 184 | The prompt-injection threat model for tools, retrieval, documents, external content | `[PER-PROJECT]` |
| 189 | The policy governing what sensitive data may be sent to a model, and what disclosure is required | `[ONCE]` |
| 190 | Whether a model vendor's retention, training, region, security, and subprocessor terms are acceptable | `[ONCE]` per vendor |
| 192 | Confidence thresholds for extraction and classification, and the fallback below them | `[PER-PROJECT]` |
| 200 | When uncertainty must be surfaced rather than presented as an authoritative answer | `[PER-PROJECT]` |

**Research:** model-provider data-processing terms and zero-retention options; client-confidentiality
obligations when client documents pass through a third-party model; ABA Formal Opinion 512 (2024) on
generative AI and lawyer duties.

## I. Operational process ownership

| Control | The judgment required | |
|---|---|---|
| 29 | The controlled emergency procedure for touching a production database | `[ONCE]` |
| 63 | The process for identifying, revoking, rotating, and investigating leaked credentials | `[ONCE]` |
| 68 | Whether cloud/service permissions are genuinely least-privilege | `[PER-PROJECT]` review |
| 73 | The dependency vulnerability-management process — triage, patch, retire | `[ONCE]` |
| 74, 75 | Whether an AI-suggested package is trustworthy: provenance, maintenance, necessity, privilege | `[PER-PROJECT]` judgment call |
| 131 | Removing a departed administrator without losing control of systems or data | `[ONCE]` |
| 152 | Authoring the data map — where user and company data lives and travels | `[PER-PROJECT]` |
| 153 | Which subprocessors are acceptable | `[ONCE]` per vendor |
| 154 | The incident-response plan | `[ONCE]` |
| 156 | The vulnerability-report intake, triage, and disclosure process | `[ONCE]` |
| 159 | Offboarding contractors and employees | `[ONCE]` |
| 166, 167 | Email identity: managed sending service, and separating marketing from transactional | `[ONCE]` |
| 168, 169 | What support staff may see and do without unsafe production access | `[ONCE]` |
| 172 | **Whether the system can actually be maintained by someone other than its builder** | `[PER-PROJECT]` |

**Control 172 is the operability test underneath "marketable."** It is the one control here that
cannot be delegated, automated, or self-assessed — and it's the one that determines whether a
product is a sellable asset or a personal dependency.

## J. Supported surface

| Control | The judgment required | |
|---|---|---|
| 130 | The ownership-transfer model and its safeguards | `[ONCE]` |
| 134 | Whether a password change revokes existing sessions | `[ONCE]` |
| 135 | How promptly permission changes must invalidate cached access | `[ONCE]` |
| 136 | The revocation window for disabled users | `[ONCE]` |
| 138 | The accessibility conformance target and who owns remediation | `[ONCE]` |
| 143, 144 | Which devices and browsers are supported | `[ONCE]` |

**Research:** WCAG 2.2 AA as the normal commercial target, and what committing to it obligates.

---

## How this list is meant to be used

1. **Everything marked `[ONCE]` becomes a decision-ledger entry.** Research it once, decide it once,
   and every future project inherits the answer without asking again. That is the mechanism that
   makes "human involved only at spec and genuine decisions" true rather than aspirational.
2. **Everything marked `[PER-PROJECT]` becomes a blocking question in the intake phases.** It is
   asked during spec, and implementation cannot begin while it is `UNANSWERED` — which is already
   how `engineering-playbook/templates/project-intake/` is designed to work.
3. **No agent may answer any control on this list.** An agent may draft options and state tradeoffs.
   It may not select. Selection without a recorded human answer is the exact failure mechanism M1 in
   `MANDATE.md`.
4. **The remaining ~130 controls are the automation backlog.** They are what the enforcement layer
   must eventually check mechanically, and none of them should ever consume your attention again
   once built.

## Accuracy note

The three-way classification above is a first pass by reading the control text, not by testing
whether a check can actually be written for each. Some controls classified Automated will prove to
need judgment, and some classified Human will turn out to be mechanizable once the underlying policy
is set. The classification is a working hypothesis to be corrected control by control as the
enforcement layer is built — not a finished result.
