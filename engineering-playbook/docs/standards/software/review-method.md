# Software control review method

[Back to the Professional Software Engineering Standard](../software-engineering-standard.md)

## Status vocabulary

- **Verified:** Current evidence proves the control is implemented and operating in the reviewed scope.
- **Partial:** Some required elements exist, but a material gap remains.
- **Missing:** The required protection, process, or capability is absent.
- **Unknown:** Evidence is insufficient. Unknown must never be treated as safe.
- **Not Applicable:** The control is outside the defined scope, with a written rationale.

## Required record

| Field | Required content |
|---|---|
| Control | Exact control number |
| Status | Verified, Partial, Missing, Unknown, or Not Applicable |
| Evidence or rationale | Durable evidence, or the reason for Not Applicable |
| Risk and impact | Failure or abuse scenario, affected users/data, severity, and likelihood |
| Owner and work | Accountable owner and tracked work item or accepted exception |
| Verification method | Exact test, review, exercise, or observation that will close the gap |
| Recheck | Date or triggering event |

## Operating rules

- Initial and quarterly reviews account for all controls 1-200 in order.
- Pull-request and change reviews evaluate every affected control.
- Release reviews always revisit controls 1-20 and every additional affected control.
- Every Partial, Missing, or material Unknown result receives severity, owner, tracked work item, target date, and verification method.
- Exceptions record the reason, risk, compensating control, accountable approver, and expiration or recheck date.
- Automated checks support engineering judgment; they do not replace authorization, accessibility, recovery, operational, or manual verification.
- Controls remain independent. Do not merge, renumber, weaken, or silently omit them.
- Project-specific state and the next incomplete lifecycle phase belong in the project `AGENTS.md` and linked project-state modules.

## Professional minimum

Before a system is described as production-ready, its accountable owner needs current evidence for at least:

- server-side authentication and authorization;
- strict user and tenant data isolation where applicable;
- server-side input validation;
- secure secret management and environment separation;
- database constraints and safe migrations;
- backups with tested restoration;
- safe payment and webhook handling where applicable;
- idempotency for retryable and consequential operations;
- logging without sensitive data;
- monitoring and actionable alerts;
- rate limiting and abuse controls;
- safe file handling;
- tested deletion and recovery behavior;
- automated tests for critical workflows and permission boundaries;
- staged deployment, rollback or forward recovery, and documented operations;
- data handling, vendor, access, and production ownership documentation.

A visible workflow is not a complete product. Production readiness includes the systems that keep the workflow safe, recoverable, observable, maintainable, and honest.
