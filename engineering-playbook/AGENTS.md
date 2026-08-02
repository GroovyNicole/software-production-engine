# Engineering Playbook Repository Instructions

## Purpose

Maintain an organization- and project-neutral engineering control system that can be reused by different companies, repositories, products, websites, people, Codex, Claude, and other approved assistants.

The GitHub account that hosts this repository does not define the organizations governed by the neutral standards.

## Mandatory startup behavior

1. Read `README.md`, `CONTRIBUTING.md`, and the relevant documentation index before changing content.
2. Identify whether the requested change belongs in the neutral core, a reusable template, or a project-specific repository.
3. Keep company names, project names, account identifiers, repositories, domains, vendors, deadlines, and implementation decisions out of neutral standards and templates.
4. Put project-specific content in that project's `AGENTS.md`, linked project-state modules, specifications, ADRs, plans, and runbooks.
5. Inspect all affected links, control modules, templates, and indexes together.
6. Update `CHANGELOG.md` for material changes.

## Non-negotiable control rules

- Preserve exactly Professional Software Engineering Controls 1-200 and Website Engineering Controls 1-150.
- Do not omit, merge, duplicate, renumber, weaken, or silently mark controls Not Applicable.
- A full audit must enumerate every control in order even though the standards are stored in modules.
- Do not claim a control is Verified without current evidence.
- Distinguish implementation, documentation, automated testing, manual testing, and operational verification.
- Every Not Applicable result needs a written rationale.

## Modularity rules

- Keep index files short. Their purpose is scope, precedence, navigation, and module-loading guidance.
- Store control groups and major procedures in interlinked modules.
- Prefer a focused module that can be read completely over a monolithic publication.
- Every module links back to its authoritative index and to adjacent modules where sequence matters.
- When splitting or moving content, preserve meaning, numbering, references, and an obvious load path.
- Project `AGENTS.md` files should remain short coordinators. Detailed intake answers, boundaries, phases, risks, and decisions belong in linked project-state modules.

## Project startup system

The reusable startup system consists of:

- `templates/project-agents-template.md`
- `templates/project-agent-redirect-template.md`
- `templates/project-intake-template.md`
- `templates/project-intake/phase-0.md` through `phase-6.md` (the five linked phase question sets)
- `templates/project-account-boundaries-template.md`
- `templates/project-phase-ledger-template.md`
- `templates/project-risks-decisions-template.md`
- `templates/project-claude-template.md`
- `docs/how-to/start-or-resume-project.md`

These templates must remain neutral. They must force assistants to ask only phase-blocking unanswered questions, update durable state after confirmed answers, resume the earliest incomplete phase, and fail closed on identity or evidence conflicts.

## Security and write safety

- Never add credentials, private keys, OAuth material, session data, production data, client data, or unredacted sensitive findings.
- Record where a secret is managed and who owns it, never the secret value.
- Prefer small, reviewable changes and record material policy choices as ADRs.
- Preserve unrelated user work.
- Do not commit, push, open or merge a pull request, publish, or deploy unless explicitly requested in the current task.

## Source priority

If guidance conflicts, use this order:

1. Applicable law, contract, and explicit organization policy
2. Confirmed project instructions and decisions
3. Neutral standards in `docs/standards/`
4. How-to guides and checklists
5. Tool-specific suggestions

Flag conflicts instead of silently selecting the most convenient instruction.
