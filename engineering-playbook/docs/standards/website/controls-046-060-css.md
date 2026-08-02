# CSS architecture and design-system consistency controls 46-60

[Standard index](../website-engineering-standard.md) | [Previous module](controls-031-045-code-html.md) | [Next module](controls-061-080-accessibility.md)

## Controls

46. A single versioned design-token source governs colors, typography, spacing, radii, borders, shadows, widths, and motion values.
47. Tokens use semantic names such as text, surface, action, focus, success, warning, and danger rather than page-specific or arbitrary names.
48. Typography uses a documented scale, limited font families and weights, readable line lengths, and predictable heading and body roles.
49. Spacing uses a documented scale; repeated arbitrary pixel values and one-off margins are treated as defects.
50. Breakpoints respond to content failure points and are centralized rather than copied inconsistently across components.
51. Selectors are component- or block-scoped and avoid names likely to collide with WordPress, plugins, Bootstrap, embeds, or future features.
52. Specificity stays intentionally low using classes and appropriate :where() grouping so overrides do not become a specificity contest.
53. ID selectors and !important are prohibited except for a documented, narrow compatibility exception with an owner and removal condition.
54. Broad element selectors do not unintentionally restyle admin interfaces, embedded tools, plugin components, form controls, or third-party widgets.
55. Every interactive component defines default, hover, focus-visible, active, disabled, loading, error, and success states as applicable.
56. Focus indicators are clearly visible, meet contrast expectations, are not clipped, and are not removed without an accessible replacement.
57. Text links remain identifiable without relying only on color, and visited-link behavior is deliberate where it improves orientation.
58. Layouts reflow without unintended horizontal scrolling, overlap, clipping, unreadable text, or touch targets that collapse at narrow widths.
59. Motion is purposeful, avoids harmful flashing, and respects prefers-reduced-motion without hiding information or functionality.
60. Duplicate, dead, and superseded CSS is removed; the stylesheet has an enforced size budget and documented ownership.

## Applying this module

Record status, evidence or Not Applicable rationale, risk, owner, tracked work, target date, verification method, and recheck trigger for every applicable control. Store project-specific decisions and evidence locations in the project's `AGENTS.md` and linked state files.
