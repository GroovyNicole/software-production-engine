# Website architecture, CSS, and accessibility

[Back to the Website Engineering Standard](../website-engineering-standard.md)

## Architecture, CMS, and WordPress engineering

- Separate development, staging, and production. Protect staging with authentication as well as `noindex`, and never assume `noindex` is access control.
- Keep custom theme code, `theme.json`, patterns, styles, scripts, test configuration, and deployment instructions in Git. Document any unavoidable dashboard-only configuration and its export or recovery method.
- Prefer a small block theme, core blocks, versioned patterns, and native platform capabilities before adding page builders or overlapping plugins.
- Use the current platform-supported `theme.json` version as the design-token and editor-control authority. Verify that editor appearance and front-end output remain consistent.
- Treat every plugin as a production dependency. Record its purpose, vendor, maintenance status, permissions, data access, update owner, failure behavior, and removal plan.
- Use the smallest practical plugin set. Do not add a security, caching, SEO, form, or analytics plugin when the platform or an existing approved dependency already meets the requirement.
- Separate content publishing from code deployment. Ordinary editors should not need administrator or code-execution privileges.
- Document the managed host's responsibilities and the operating organization's responsibilities separately. Host-provided backups or security do not eliminate the need to verify restoration, access, forms, privacy, monitoring, and release behavior.

## CSS and design-system requirements

CSS is an interface for the visual system, not a pile of overrides accumulated until one page looks right.

1. Define color, typography, spacing, widths, borders, radii, shadows, and motion in `theme.json` or another single versioned token source.
2. Name tokens by meaning, such as `text`, `surface`, `action`, `focus`, `success`, `warning`, and `danger`; do not name them for one page or a temporary color.
3. Use a documented typography scale, spacing scale, line-length range, and content-width system. Repeated arbitrary values are defects.
4. Scope selectors to CMS blocks, patterns, or project-prefixed components such as `.project-card`; avoid generic names such as `.btn-primary` that can collide with plugins or frameworks.
5. Keep specificity low and predictable. Prefer classes and appropriate `:where()` grouping. Reject ID selectors, deep nesting, and `!important` except for a narrow documented compatibility exception.
6. Avoid broad selectors such as `a`, `p`, `li`, or `body p li` when they can unintentionally restyle plugin widgets, embedded forms, or future components.
7. Define default, hover, focus-visible, active, disabled, loading, error, and success states where applicable. Hover-only styling is incomplete.
8. Use content-driven breakpoints. Test long headings, long names, validation messages, zoom, empty sections, dense sections, and embedded content.
9. Move repeated inline padding, colors, and typography into tokens, block styles, patterns, or component classes.
10. Enforce formatting and linting, document the cascade/load order, remove superseded rules, and maintain CSS and third-party-code budgets.

## Semantic HTML and accessibility

WCAG 2.2 Level AA is the engineering baseline unless a stricter legal, contractual, or project requirement applies. It must be evaluated across complete pages, responsive variations, and complete user processes.

- Use native HTML controls and document structure before adding ARIA. Links navigate; buttons perform actions.
- Provide logical headings, landmarks, skip navigation, descriptive links, labels, accessible errors, status announcements, visible focus, keyboard operation, sufficient contrast, and meaningful alternative text.
- Verify 200 percent text zoom and responsive reflow equivalent to 400 percent zoom at a standard desktop width.
- Test contact, mailing-list, scheduling, download, menu, search, payment, and error-recovery processes as complete experiences when present.
- Use automated scanners as supporting evidence only. Release evidence must also include manual keyboard, focus, zoom/reflow, and representative screen-reader testing.
- Treat accessibility overlays as supplemental at most. They do not repair missing labels, invalid structure, broken focus, inaccessible custom controls, or weak content.
- Publish only accurate accessibility statements. Never infer legal compliance from an automated score or plugin installation.
