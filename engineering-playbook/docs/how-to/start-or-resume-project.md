# Start or resume a project with `AGENTS.md`

- **Owner:** Project owner or engineering lead
- **Last reviewed:** 2026-07-14
- **Review cadence:** When the project lifecycle or assistant workflow changes
- **Related controls:** Software controls 171-177 and applicable governance controls

## Purpose

Create one durable, repository-local project state system that lets a new Codex or Claude task determine whether to ask onboarding questions or resume the next incomplete phase. A short `AGENTS.md` coordinates small linked state modules so assistants do not need to load one oversized document. The workflow prevents company, account, workspace, and project assumptions from leaking between repositories.

## Important filename

The durable Codex instruction filename is `AGENTS.md`, plural. A tiny root `agent.md` may link to it so the user's conversational command `read agent.md` also resolves literally. Never duplicate project rules in the redirect.

Codex reads applicable `AGENTS.md` files when a task starts in the repository. Claude should be given a root `CLAUDE.md` that tells it to read and follow `AGENTS.md`.

## Prerequisites

- A local project folder, preferably initialized as a Git repository
- The neutral standards appropriate to the project
- Permission to create or update local documentation
- No secrets in onboarding answers

## New-project procedure

1. Copy `templates/project-agents-template.md` to the project root as `AGENTS.md`.
2. Copy `templates/project-agent-redirect-template.md` to the project root as `agent.md` when the singular command should work literally.
3. Create `docs/project/`.
4. Copy `templates/project-intake-template.md` to `docs/project/project-intake.md`.
5. Create `docs/project/project-intake/` and copy the five files from `templates/project-intake/` into it, preserving their filenames.
6. Copy `templates/project-account-boundaries-template.md` to `docs/project/account-boundaries.md`.
7. Copy `templates/project-phase-ledger-template.md` to `docs/project/phase-ledger.md`.
8. Copy `templates/project-risks-decisions-template.md` to `docs/project/risks-and-decisions.md`.
9. Copy `templates/project-claude-template.md` to the project root as `CLAUDE.md` when Claude will work in the repository.
10. Fill only facts already supported by the user, repository, or verified external systems.
11. Leave every unresolved decision as `UNANSWERED`; do not guess.
12. Set Phase 0 to `IN_PROGRESS` and all later phases to `NOT_STARTED`.
13. Record known repository and account boundaries, but mark them `UNVERIFIED` until checked through a current read-only command or connector call.
14. Start a new task in the project repository and say: `Read agent.md and continue.`
15. The assistant follows the redirect to `AGENTS.md` and asks no more than five Phase 0 questions at a time.
16. After answers are confirmed, the assistant updates the affected state module and the current-phase summary in `AGENTS.md` before moving forward.
17. Continue until the Phase 0 gate has evidence, then begin Phase 1.

## Existing-project procedure

1. Start the task from the correct repository root.
2. Say: `Read agent.md and continue.` The redirect points to authoritative `AGENTS.md`.
3. The assistant follows the links in `AGENTS.md` and reads the state indexes plus the intake and reference modules required by the current phase.
4. The assistant inspects repository evidence needed to validate the recorded phase.
5. If a required answer is missing, stale, or contradicted, it asks only the questions that block the current gate.
6. If the current phase is complete, it sets the next phase to `IN_PROGRESS` and begins the recorded next action within the user's authorized scope.
7. At task closeout, it updates the affected state modules and the current-phase summary in `AGENTS.md`, then reports remaining unknowns.

## What the assistant must ask and when

The template groups questions by gate:

- **Phase 0:** identity, company ownership, decision authority, objective, accounts, repository, work tracker, domains, existing state, and allowed actions.
- **Phase 1:** users, critical journeys, data, vendors, environments, production exposure, and authoritative sources.
- **Phase 2:** release scope, architecture, identity/security model, legal and accessibility obligations, quality attributes, risks, and prior decisions.
- **Phase 3:** bounded outcome, acceptance criteria, delivery strategy, evidence, constraints, and approved external writes.
- **Phase 6:** release approval, deployment, rollback, operational ownership, communication, stabilization, and legacy retirement.

Questions for later gates remain recorded but do not block early discovery unless their absence creates an immediate safety or scope problem.

## Verification behavior

A project is resumable when:

- `AGENTS.md` names the exact project and owning organization and links every required state module;
- the intake module records all facts as answered, explicitly `UNANSWERED`, or `N/A` with rationale;
- the earliest incomplete phase is unambiguous;
- the phase-ledger module identifies evidence and a concrete next action;
- the account-boundary module uses immutable identifiers where available;
- the risk-and-decision module captures material confirmed choices;
- no credentials or private production data appear in any instruction or state module.

Test the setup in a new task with:

```text
Read AGENTS.md and perform only the mandatory startup protocol. Do not modify code or external systems. Report the verified project, current phase, next required action, and the exact unanswered questions that block the current phase.
```

## Updating the state safely

- Update confirmed answers; do not rewrite history silently.
- Put long explanations in specifications, ADRs, or runbooks and link them from `AGENTS.md`.
- Reopen an earlier phase when new evidence invalidates its gate.
- Keep a specific next action instead of vague text such as `continue development`.
- Record evidence paths, test commands, issue identifiers, commit IDs, or approved decisions.
- Never place tokens, passwords, private keys, customer records, or production submissions in project instructions.

## Cross-computer behavior

Uncommitted project-state files exist only on the current computer. Once their contents have been reviewed and the user authorizes publication, commit `AGENTS.md` and its linked state modules with the project so another computer and another approved assistant receive the same state. Until then, do not imply that the state is synchronized.

## Failure handling

If the assistant begins work without asking required questions, stop it and use:

```text
Stop. Read AGENTS.md completely. Perform the mandatory startup protocol, identify the earliest incomplete phase, and ask only the unanswered questions blocking that phase. Do not implement or modify external systems.
```

If the wrong company, repository, work-tracker team, cloud account, or production environment appears, mark the boundary `MISMATCH`, return `BLOCKED`, and make no external changes.

If a module grows large, split it by phase or subject and link the new parts from `AGENTS.md`. Keep the coordinator limited to startup rules, project identity, current phase, next action, and required links.

## Security and data considerations

`AGENTS.md` and its linked modules are ordinary repository content and may eventually be visible to every collaborator with repository access. Store identifiers and decision state, not credentials or confidential records. Treat account verification as evidence of identity, never as permission for an unrelated write.

## References

- [OpenAI: Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [AGENTS.md specification](https://agents.md)
