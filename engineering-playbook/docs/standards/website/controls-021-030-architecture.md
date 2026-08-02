# Architecture, platform, and environments controls 21-30

[Standard index](../website-engineering-standard.md) | [Previous module](controls-011-020-discovery.md) | [Next module](controls-031-045-code-html.md)

## Controls

21. Development, staging, and production are separated, named, access-controlled, and protected from accidental cross-environment actions.
22. Staging is password-protected in addition to using noindex, and it contains no unnecessary production personal or confidential data.
23. Production deployments are reproducible from versioned source or an exported, reviewable configuration rather than undocumented dashboard edits.
24. The platform responsibility model states what the host secures and backs up and what the operating organization must configure, test, monitor, and recover.
25. Themes, plugins, blocks, and libraries are selected for active maintenance, accessibility, compatibility, support, and minimal privilege.
26. The site uses the smallest practical dependency and plugin set; overlapping plugins and duplicate platform features are avoided.
27. Failures of external services such as forms, email, maps, analytics, fonts, scheduling, or payment providers degrade safely.
28. Environment-specific domains, IDs, API endpoints, keys, caching behavior, robots rules, and feature settings are documented without exposing secrets.
29. Backups cover database, uploads, theme or custom code, configuration, and necessary external exports, and restoration is tested.
30. A rollback procedure identifies the prior deploy, database or content implications, DNS fallback, responsible person, and verification steps.

## Applying this module

Record status, evidence or Not Applicable rationale, risk, owner, tracked work, target date, verification method, and recheck trigger for every applicable control. Store project-specific decisions and evidence locations in the project's `AGENTS.md` and linked state files.
