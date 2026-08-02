# Repository, code quality, and semantic HTML controls 31-45

[Standard index](../website-engineering-standard.md) | [Previous module](controls-021-030-architecture.md) | [Next module](controls-046-060-css.md)

## Controls

31. Custom theme code, patterns, templates, scripts, styles, configuration, and documentation are version-controlled in an identified repository.
32. Generated artifacts are distinguishable from authoritative source and can be reproduced by documented commands.
33. Changes use short-lived branches, focused commits, reviewable diffs, pull requests, and documented verification evidence.
34. Dependencies and build tools are pinned or locked, reviewed before introduction, and updated through an intentional process.
35. Formatting, linting, validation, and static analysis run consistently locally and in continuous integration where code is deployed.
36. Repositories, build output, browser code, CMS fields, screenshots, logs, and documentation contain no secrets or private production data.
37. Pages use semantic header, navigation, main, article, aside, and footer structures appropriate to the content.
38. Markup has valid nesting, unique IDs, correctly associated labels, and no duplicate or malformed interactive controls.
39. Each page has one clear primary heading and a logical heading hierarchy that reflects document structure rather than visual size.
40. Links navigate, buttons perform actions, and custom controls are not used where native HTML provides the required behavior.
41. Core content, navigation, and forms remain usable under progressive enhancement when nonessential JavaScript fails.
42. Reusable templates avoid inline event handlers, arbitrary inline styles, copied script fragments, and page-specific code that bypasses the design system.
43. External links, downloads, new-window behavior, and target attributes are deliberate, understandable, and safely configured.
44. Every document includes an appropriate doctype, language, character encoding, viewport configuration, title, and core metadata.
45. Structured data is generated from truthful visible content and passes the relevant validator without unsupported claims.

## Applying this module

Record status, evidence or Not Applicable rationale, risk, owner, tracked work, target date, verification method, and recheck trigger for every applicable control. Store project-specific decisions and evidence locations in the project's `AGENTS.md` and linked state files.
