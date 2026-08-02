# Article Engine Engineering Guide

## Scope

This package is a small, file-based Node.js pipeline with no runtime npm dependencies. It performs topic discovery, two-lane scoring, structured model-assisted research, deterministic source-policy checks, draft generation, quarantine, and local artifact storage. Human review and publishing are deliberately outside the system boundary.

## Canonical engineering baseline

The reusable standards live in this repository's central playbook:

- [Software Engineering Standard](../../../docs/standards/software-engineering-standard.md)
- [Critical controls 1-20](../../../docs/standards/software/controls-001-020-critical.md)
- [Data controls 21-50](../../../docs/standards/software/controls-021-050-data.md)
- [Security controls 51-85](../../../docs/standards/software/controls-051-085-security.md)
- [Reliability controls 86-120](../../../docs/standards/software/controls-086-120-reliability.md)
- [Product/workflow controls 121-150](../../../docs/standards/software/controls-121-150-product-workflow.md)
- [Operational controls 151-180](../../../docs/standards/software/controls-151-180-operations.md)
- [AI controls 181-200](../../../docs/standards/software/controls-181-200-ai.md)

The website standard is not part of the base template because this package has no web UI or publishing surface. Reassess that decision if a dashboard, public API, CMS, authentication, uploads, or multi-user operation is added.

## Scope-appropriate control focus

- **Always:** secrets, server/tool-side validation, bounded operations, error handling, safe logs, dependency discipline, recovery, and documented environment variables.
- **File/data pipeline:** schema validation, atomic writes, locks, duplicate handling, deterministic state transitions, bounded files/queries, and recoverable artifacts.
- **External services:** explicit timeouts/retries, rate/usage limits, approved domains, vendor inventory, terms/licensing review, and spend controls.
- **AI system:** untrusted model output, prompt-injection boundaries, least-privilege tools/data, deterministic post-validation, source traceability, prompt/model versioning, input limits, cost controls, and human confirmation before consequential use.
- **Editorial product:** machine-researched, human-reviewed, and publishable are separate states. A passing validator does not prove factual meaning or professional suitability.

Authentication, tenant isolation, payments, uploads, browser security, and production deployment controls are not present in the base scope. They must be reconsidered, not silently marked complete, when a future instance adds those features.

## Change rule

Ordinary industry customization changes `config/`, `docs/content-profile.md`, and approved voice examples. A change to `src/` must solve a reusable capability or safety problem and include an offline invariant test.
