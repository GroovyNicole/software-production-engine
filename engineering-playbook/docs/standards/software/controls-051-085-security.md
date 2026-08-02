# Security controls 51-85

[Standard index](../software-engineering-standard.md) | [Review method](review-method.md) | [Previous module](controls-021-050-data.md) | [Next module](controls-086-120-reliability.md)

## Controls

51. Queries and data access are protected against SQL or equivalent injection.
52. Rendered user-controlled content is protected against cross-site scripting.
53. Cookie-authenticated state-changing requests have CSRF protection where required.
54. Redirect targets are validated to prevent unsafe redirects.
55. Every object access is protected against insecure direct object reference vulnerabilities.
56. Binding and update logic prevents mass assignment of unapproved fields.
57. Protected fields such as role, owner ID, plan, price, and administrator status cannot be changed by ordinary users.
58. Password policy is appropriate and supported by rate limiting, breach checks, MFA, and recovery controls as needed.
59. Administrators use multi-factor authentication.
60. Administrators have individual accounts; shared administrator credentials are prohibited or tightly controlled emergencies.
61. Administrative interfaces are strongly protected, monitored, and not exposed unnecessarily.
62. Access tokens expire or rotate appropriately instead of remaining permanent by default.
63. Leaked credentials can be identified, revoked, rotated, and investigated promptly.
64. Development, test, staging, and production use separate secrets.
65. Production user data is not copied into local development without an approved, protected, and minimized process.
66. Development, test, staging, and production environments are separated with clear boundaries.
67. Test systems cannot accidentally send real communications, charge real cards, or modify production.
68. Cloud and service permissions follow least privilege.
69. Storage containing private data is not publicly accessible.
70. Private file URLs are not permanent public capabilities.
71. Signed URLs have the shortest practical expiration and appropriate scope.
72. Private files are not served through predictable, authorization-free paths.
73. Dependencies are scanned, reviewed, patched, and retired through a defined vulnerability-management process.
74. Packages suggested by AI are verified before installation.
75. Packages are checked for suspicious names, provenance, maintenance, necessity, and excessive privileges.
76. Appropriate security headers are configured and tested.
77. CORS allows only required origins, methods, headers, and credential behavior.
78. Detailed stack traces are not exposed to end users.
79. Raw database errors are not exposed to end users.
80. High-abuse public endpoints have bot or automation defenses appropriate to risk.
81. Verification and reset links expire, are single-use when appropriate, and cannot be replayed indefinitely.
82. Login and reset responses do not reveal whether an account exists beyond the chosen risk policy.
83. Session tokens are stored and transmitted securely.
84. Frontend route guards are not the only authorization mechanism.
85. Administrative privilege is never represented only by a browser-side variable or client claim.

## Applying this module

For every applicable control, record status, evidence or Not Applicable rationale, risk, owner, tracked work, verification method, and recheck trigger using the [review method](review-method.md). Project-specific decisions and evidence locations belong in the project's `AGENTS.md` and linked state files.
