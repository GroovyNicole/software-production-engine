# Professional Website Engineering Standard

Version 1.0 - July 14, 2026

## Purpose

This organization- and project-neutral index governs secure, accessible, consistent, maintainable, performant, and search-safe websites. Project names, company names, accounts, repositories, domains, platforms, vendors, deadlines, and migration decisions belong in the project's `AGENTS.md`, specifications, ADRs, and runbooks.

The standard is split into small interlinked modules. Load only the modules required by the current phase or change. A complete initial or quarterly website audit must still evaluate Website Engineering Controls 1-150 and every applicable Professional Software Engineering Control 1-200 without omissions.

## Guidance modules

- [Operating model, lifecycle, implementation requirements, and sources of truth](website/operating-lifecycle.md)
- [Architecture, CMS/WordPress, CSS, semantic HTML, and accessibility](website/architecture-css-accessibility.md)
- [Security, privacy, forms, performance, content, SEO, and migration](website/security-performance-content.md)
- [Testing, release evidence, Definition of Done, and references](website/testing-release.md)
- [Paste-ready website engineering prompts](website/prompts.md)

## Control modules

- [Controls 1-10: Governance and accountability](website/controls-001-010-governance.md)
- [Controls 11-20: Discovery, inventory, and migration evidence](website/controls-011-020-discovery.md)
- [Controls 21-30: Architecture, platform, and environments](website/controls-021-030-architecture.md)
- [Controls 31-45: Repository, code quality, and semantic HTML](website/controls-031-045-code-html.md)
- [Controls 46-60: CSS architecture and design-system consistency](website/controls-046-060-css.md)
- [Controls 61-80: Accessibility and usable interaction](website/controls-061-080-accessibility.md)
- [Controls 81-95: Security and privileged administration](website/controls-081-095-security.md)
- [Controls 96-110: Forms, privacy, data, and third-party services](website/controls-096-110-forms-data.md)
- [Controls 111-125: Performance, resilience, and delivery quality](website/controls-111-125-performance.md)
- [Controls 126-140: Content quality, SEO, and migration safety](website/controls-126-140-content-seo-migration.md)
- [Controls 141-150: Testing, release, and continuous operation](website/controls-141-150-release-operations.md)

## What to load by phase

- **Intake and discovery:** Operating model plus controls 1-20 and every implicated software-control module.
- **Architecture and design:** Architecture/CSS/accessibility plus controls 21-80 and applicable software data, security, reliability, operations, and AI modules.
- **Forms, integrations, content, or migration:** Security/performance/content plus controls 81-140 and applicable software modules.
- **Implementation review:** Every guidance and control module affected by the change.
- **Release:** Testing/release plus controls 141-150, controls 1-20, and every other affected module.
- **Initial or quarterly review:** All website modules and all applicable software modules.

The project `AGENTS.md` records the current phase, applicable modules, project-specific decisions, evidence locations, and next action.
