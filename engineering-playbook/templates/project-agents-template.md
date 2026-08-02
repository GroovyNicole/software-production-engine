# Project Repository Instructions and State

> Copy this file to the root of a project repository as `AGENTS.md`. Replace known placeholders, leave unknown answers as `UNANSWERED`, and keep the phase ledger current. `AGENTS.md` is the authoritative filename. Copy `project-agent-redirect-template.md` as `agent.md` when the user wants that singular command to resolve literally.

## Project identity

- Project or product name: `UNANSWERED`
- Owning company or organization: `UNANSWERED`
- Accountable decision-maker: `UNANSWERED`
- Repository owner and name: `UNANSWERED`
- Project type: `UNANSWERED` (software / website / service / library / automation / research / other)
- Lifecycle: `UNANSWERED` (idea / discovery / build / migration / production / maintenance / retirement)
- Current phase: `0 - Intake and boundaries`
- Next required action: `Answer the Phase 0 questions marked UNANSWERED.`
- State last updated: `YYYY-MM-DD by [person or assistant]`

## Mandatory startup protocol

Every assistant must perform this protocol before proposing or changing project work.

1. Read this entire coordinator, all four Required project-state index modules, and the intake module for the earliest incomplete phase.
2. Read only the Required reference modules needed for the earliest incomplete phase or the user's bounded task. For a full audit, read every required control module in order.
3. Inspect the repository and external systems only to the read-only extent already authorized.
4. Treat the Project intake record and Phase ledger as the durable state, not conversation memory.
5. Find the earliest phase whose status is not `COMPLETE`.
6. Identify only the unanswered questions required to pass that phase's gate.
7. If required answers are missing, ask the smallest coherent batch, no more than five questions at once. Do not begin a later phase.
8. Do not ask questions already answered unless repository evidence conflicts with the recorded answer or the answer is explicitly stale.
9. After the user confirms an answer or material decision, update the applicable project-state module and the coordinator summary during the same task. Do not wait for a reminder.
10. Before marking a phase `COMPLETE`, verify its gate evidence. A claim, plan, or conversation is not implementation evidence.
11. If the current phase is complete, set the next phase to `IN_PROGRESS`, record its first concrete action, and continue only within the user's authorized scope.
12. Begin every resumed task with a short state report: verified project, current phase, blocking unanswered questions, next action, and any account mismatch.

If the user says `read agent.md`, interpret that as `read AGENTS.md and follow the Mandatory startup protocol`.

## Non-negotiable state rules

- Never invent, infer, or silently fill an unanswered project fact.
- Never replace a confirmed answer without identifying the old value, the proposed new value, the reason, and obtaining confirmation when the change is material.
- Never mark a phase complete without durable evidence recorded in the Phase ledger.
- Never mark a control `Verified` without current evidence.
- Never store passwords, API keys, OAuth tokens, session cookies, private keys, recovery codes, production records, client submissions, or other secrets in this file.
- Record secret locations and owners, never secret values.
- Never cross company, workspace, repository, cloud-account, domain, analytics-property, billing, or production boundaries based on a remembered name. Verify immutable identifiers before writes.
- Never create or change external data, accounts, billing, permissions, production systems, DNS, deployments, issues, projects, or integrations without authorization for that exact class of action.
- Never commit, push, merge, publish, deploy, or open a pull request unless the user explicitly requests it in the current task.
- Preserve unrelated user work. Inspect repository status and diffs before staging or editing overlapping files.
- If instructions, evidence, or identities conflict, stop the affected action and report `BLOCKED` with the conflicting facts.
- Keep this file concise enough to load completely. Put long procedures and evidence in linked documents; record their paths here.
- A new chat is temporary context. Confirmed project state belongs in this file before the task ends.

## Required references

- Neutral software standard: `[path or N/A]`
- Neutral website standard: `[path or N/A]`
- Architecture overview: `[path or UNANSWERED]`
- Requirements or product specification: `[path or UNANSWERED]`
- Security or threat model: `[path or UNANSWERED]`
- Data-flow or data-classification document: `[path or UNANSWERED]`
- Test strategy: `[path or UNANSWERED]`
- Deployment and rollback procedure: `[path or UNANSWERED]`
- Operations and incident procedure: `[path or UNANSWERED]`
- Current work tracker or approved plan: `[path/link or UNANSWERED]`

Missing documents may be legitimate in early phases. Record their creation in the Phase ledger rather than pretending they exist.

## Required project-state modules

Read these files in order after this coordinator:

1. `docs/project/project-intake.md` - index to confirmed answers and phase-gated unanswered questions in `docs/project/project-intake/`
2. `docs/project/account-boundaries.md` - immutable account, workspace, repository, domain, cloud, and analytics identifiers
3. `docs/project/phase-ledger.md` - current phase, gate evidence, and next action
4. `docs/project/risks-and-decisions.md` - open risks, blockers, and confirmed material decisions

If any required module is missing, create it from the matching neutral template before implementation. Do not invent its answers.

When the user says `update AGENTS.md`, update this coordinator's current phase and next action plus every linked state module affected by the confirmed information. The coordinator is a map; detailed answers and evidence belong in the modules.

## Session closeout protocol

Before ending a task that changed project knowledge or state:

1. Update confirmed intake answers.
2. Update boundary verification statuses without storing credentials.
3. Update the current phase, evidence location, next action, risks, and blockers.
4. Add confirmed material decisions to the Decision log.
5. Update linked durable documentation when the change belongs there instead of this summary.
6. Report which files changed and what remains unanswered.
7. Do not commit or push unless explicitly authorized.
