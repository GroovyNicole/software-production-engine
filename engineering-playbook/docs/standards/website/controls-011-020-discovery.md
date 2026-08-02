# Discovery, inventory, and migration evidence controls 11-20

[Standard index](../website-engineering-standard.md) | [Previous module](controls-001-010-governance.md) | [Next module](controls-021-030-architecture.md)

## Controls

11. A machine-readable inventory covers every current URL, status code, canonical URL, indexability state, and content type.
12. Every page is mapped to an approved template or documented exception rather than recreated as an ungoverned one-off design.
13. Images, documents, video, fonts, logos, icons, and downloadable assets are inventoried with ownership, license, source, and replacement status.
14. Current titles, descriptions, headings, structured data, internal links, canonicals, robots directives, and sitemap membership are captured before migration.
15. Forms, scheduling, email marketing, maps, search, payments, downloads, and other functional integrations are inventoried end to end.
16. All analytics, advertising, tag-manager, session-recording, chat, and tracking scripts are inventoried, deduplicated, and assigned a business purpose.
17. The current site's accessibility baseline is documented using automated checks plus keyboard, zoom, and assistive-technology sampling.
18. The current site's performance baseline records representative mobile and desktop lab results and available field data.
19. A data-flow record shows what users submit, where data goes, who receives it, how long it remains, and how deletion occurs.
20. A migration ledger contains one row per old URL with its intended destination, action, owner, content status, redirect status, QA evidence, and approval.

## Applying this module

Record status, evidence or Not Applicable rationale, risk, owner, tracked work, target date, verification method, and recheck trigger for every applicable control. Store project-specific decisions and evidence locations in the project's `AGENTS.md` and linked state files.
