# Project phase ledger

When copied to `docs/project/phase-ledger.md`, the project coordinator is at `../../AGENTS.md`.

## Phase ledger

Allowed status values: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `COMPLETE`, `N/A - [reason]`.

| Phase | Status | Required gate evidence | Evidence location | Next action |
|---|---|---|---|---|
| 0. Intake and boundaries | `IN_PROGRESS` | Phase 0 answers; verified repository and account boundaries; action permissions | `This file` | `Ask the next unanswered Phase 0 questions` |
| 1. Discovery and inventory | `NOT_STARTED` | Existing-system inventory; users and journeys; data/vendor/environment maps; current risks | `UNANSWERED` | `Wait for Phase 0` |
| 2. Requirements, architecture, and threat model | `NOT_STARTED` | Approved scope; quality attributes; architecture decisions; threat/data-flow models; control applicability | `UNANSWERED` | `Wait for Phase 1` |
| 3. Delivery plan and backlog | `NOT_STARTED` | Prioritized bounded outcomes; acceptance criteria; dependencies; estimates or sizing; approved write scope | `UNANSWERED` | `Wait for Phase 2` |
| 4. Implementation | `NOT_STARTED` | Reviewed code/config/content changes linked to requirements; migrations and documentation updated | `UNANSWERED` | `Wait for Phase 3` |
| 5. Verification and hardening | `NOT_STARTED` | Automated and manual tests; security/accessibility/performance review; control evidence; defects dispositioned | `UNANSWERED` | `Wait for Phase 4` |
| 6. Release readiness | `NOT_STARTED` | Release gate; backup/restore or rollback evidence; approvals; monitoring/support readiness | `UNANSWERED` | `Wait for Phase 5` |
| 7. Launch or cutover | `NOT_STARTED` | Authorized execution record; live smoke checks; rollback decision; communications | `UNANSWERED` | `Wait for Phase 6` |
| 8. Stabilization and operations | `NOT_STARTED` | Stabilization exit criteria; incident/defect follow-up; ownership and recurring reviews; legacy retirement approval | `UNANSWERED` | `Wait for Phase 7` |

## Phase transition rules

- A phase may move to `IN_PROGRESS` only when all earlier phases are `COMPLETE` or explicitly `N/A` with rationale.
- A phase may move to `COMPLETE` only when every required gate artifact exists and has been checked against repository or external-system evidence.
- If a new fact invalidates an earlier gate, reopen the earliest affected phase and record why.
- Implementation discoveries may update requirements, architecture, risks, and plans; update the earlier artifact instead of hiding the change in code.
- Release pressure, sunk cost, or user enthusiasm never converts `UNKNOWN`, `MISSING`, or `BLOCKED` evidence into approval.
- The next phase is the earliest phase not complete, not the phase an assistant finds most interesting.
