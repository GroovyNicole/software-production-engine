# Professional Engineering Playbook

This repository is a durable, organization- and project-neutral source of engineering standards, control registers, templates, and repeatable delivery procedures.

It exists so professional software and website delivery does not depend on one chat, one computer, one company name, one AI assistant, or memory. Project-specific facts and state belong in each project's own repository.

## Start or resume a project

1. Follow [Start or resume a project with AGENTS.md](docs/how-to/start-or-resume-project.md).
2. Copy the project-state templates into the project repository.
3. Start a task in that repository and say: `Read agent.md and continue.` The tiny redirect opens the authoritative `AGENTS.md`.
4. The assistant asks only the unanswered questions blocking the earliest incomplete phase.
5. Confirmed answers and phase changes are written to the linked project-state modules.

## Neutral standards

- [Professional Software Engineering Standard](docs/standards/software-engineering-standard.md) - index for the modular 200-control software baseline.
- [Professional Website Engineering Standard](docs/standards/website-engineering-standard.md) - index for modular website guidance and the 150-control website baseline.

The standards are intentionally split into small interlinked modules. Full audits still cover every control without omissions.

## Repository map

| Path | Purpose |
|---|---|
| `docs/standards/` | Neutral mandatory standards and control indexes |
| `docs/standards/software/` | Software review method and controls 1-200 by subject |
| `docs/standards/website/` | Website guidance and controls 1-150 by subject |
| `docs/how-to/` | Repeatable procedures with verification and recovery |
| `docs/checklists/` | Execution and release gates |
| `docs/decisions/` | Architecture and policy decision records |
| `docs/reference/` | Reference-source notes; no monolithic authoritative standard |
| `templates/` | Neutral project-state templates and complete specialized project packages, including the article engine |

## Neutrality rule

Reusable standards and templates must not contain real company names, project names, user paths, repository owners, workspace identifiers, domains, vendor account identifiers, or project decisions.

Those facts belong in the project's:

- `AGENTS.md` coordinator;
- `docs/project/project-intake.md`;
- `docs/project/account-boundaries.md`;
- `docs/project/phase-ledger.md`;
- `docs/project/risks-and-decisions.md`;
- specifications, ADRs, implementation plans, and runbooks.

## Repository policy

- Keep repository access appropriate to the owner and intended collaborators.
- Never commit credentials, private keys, production data, client data, or unredacted sensitive findings.
- Make material policy changes through reviewable branches and pull requests when publication is authorized.
- Preserve history and explain supersession in the changelog or an ADR.
- Do not treat an AI conversation as durable project state.
