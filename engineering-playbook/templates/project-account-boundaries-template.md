# Verified account and environment boundaries

When copied to `docs/project/account-boundaries.md`, the project coordinator is at `../../AGENTS.md`.

## Verified account and environment boundaries

Record immutable identifiers where the service exposes them.

| Boundary | Expected account/workspace | Immutable identifier | Verification method | Status |
|---|---|---|---|---|
| GitHub owner/repository | `UNANSWERED` | `UNANSWERED` | `remote URL plus authenticated account check` | `UNVERIFIED` |
| Work tracker workspace/team | `UNANSWERED` | `UNANSWERED` | `read-only connector listing` | `UNVERIFIED` |
| Cloud/hosting account | `UNANSWERED` | `UNANSWERED` | `read-only account/project inspection` | `UNVERIFIED` |
| Production domain/DNS | `UNANSWERED` | `UNANSWERED` | `registrar/DNS inspection` | `UNVERIFIED` |
| Analytics/telemetry property | `UNANSWERED` | `UNANSWERED` | `read-only property inspection` | `UNVERIFIED` |

No external write may cross a boundary whose status is `UNVERIFIED`, `MISMATCH`, or `UNKNOWN`.
