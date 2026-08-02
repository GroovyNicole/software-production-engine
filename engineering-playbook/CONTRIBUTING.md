# Contributing

## Change workflow

1. Inspect repository status and the applicable `AGENTS.md` instructions.
2. Identify whether the change belongs in the neutral core, a reusable template, or a project-specific repository.
3. Update the authoritative module and all affected indexes, adjacent-module links, templates, and cross-references.
4. Verify links, terminology, neutrality, control numbering, and module size.
5. Update `CHANGELOG.md` for material changes.
6. Commit, push, or open a pull request only when explicitly authorized.

## Neutrality requirement

Neutral standards and templates must use roles and placeholders such as `the organization`, `the project`, `[COMPANY]`, `[REPOSITORY]`, and `[WORK TRACKER]`.

Do not place real company names, project names, repository owners, local user paths, workspace/team identifiers, domains, vendor-account identifiers, or project decisions in neutral modules. Put them in the applicable project repository.

## Documentation standard

Every how-to guide states:

- purpose and intended reader;
- prerequisites and required access;
- ordered procedure;
- expected result and verification;
- common failures and safe recovery;
- security, data, and rollback considerations;
- owner and review date.

Use `templates/how-to-guide-template.md`.

## Modularity standard

- Index files provide navigation and loading guidance rather than duplicating module content.
- Split large control registers and procedures by coherent subject or phase.
- Link every module to its authoritative index.
- Link sequential modules to their neighbors.
- Keep exact numbering and meaning when splitting controls.
- A full audit assembles every module and validates the complete range.

## Control changes

Changes involving either control register require extra care:

- identify the affected control numbers;
- explain whether the change clarifies, strengthens, supersedes, or adds implementation guidance;
- preserve traceability to earlier language;
- update related review and release instructions;
- verify software controls run exactly 1-200 and website controls exactly 1-150 without gaps or duplicates.

Do not remove or weaken a control solely because a current project has not implemented it. Record the project gap instead.

## Review checklist

- The change has one clear purpose.
- Neutral content contains no project or company leakage.
- Claims do not overstate security, compliance, accessibility, or readiness.
- Responsibilities and evidence are explicit.
- No confidential or sensitive information is present.
- Internal links and file paths resolve.
- Control numbering and module navigation are complete.
- The changelog and affected references are current.
