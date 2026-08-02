# Writer design

`src/writer.js` creates a draft from one ranked topic plus structured research from `src/verify.js`.

The prompt is populated from `config/engine.json`, including brand, field, reader, moat, word range, and
disclaimer. Optional approved articles in the configured voice-exemplar file provide cadence examples.

The research prompt payload contains only claim ids, statements, and scope. The model returns the ids it used.
After drafting, deterministic checks reject unknown ids and hard facts that do not occur in a direct claim
statement. Style cleanup removes source-number prose, dashes, and excess colons; the invariants are checked
again after cleanup.

Passing the machine checks produces `status: "drafted"`, not human approval. Every new record remains:

```json
{
  "verified": false,
  "review_status": "pending_human_review",
  "human_reviewed": false,
  "publishable": false
}
```

Machine-research claims and their supporting URLs stay in the hidden review trail. They are not appended to
the reader-facing article body. A failure creates a quarantined `.NEEDS-FIX.md` artifact.

See `ARCHITECTURE.md` for the full contract and `CUSTOMIZE-FOR-ANY-INDUSTRY.md` for the supported way to
change industries.
