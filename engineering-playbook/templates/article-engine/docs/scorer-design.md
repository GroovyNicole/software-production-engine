# Scorer design

The scorer turns normalized candidate questions into two ranked editorial lists.

## Inputs

- candidate topic, source labels, and guessed cluster from ideation;
- numeric autocomplete and Stack Exchange signals;
- allowed cluster ids and `practice_value` weights from `config/engine.json`;
- optional model judgments for scope, cluster, lane, differentiation, groundability, and evergreen value.

The model never invents search volume. `grounding_authority` strings are research hints, not factual support.

## Lanes

- **Lane A: broad/informational.** Weighted toward observed demand, business value, and evergreen usefulness.
- **Lane B: moat-specific.** Weighted toward differentiation, business value, groundability, and then demand.

Keeping two lists prevents a low-volume specialty topic from being erased by a high-volume generic question.

Current formulas in `src/scorer.js`:

```text
Lane A = 0.55 demand + 0.30 practice_value + 0.15 evergreen
Lane B = 0.40 differentiation + 0.25 practice_value + 0.20 groundability + 0.15 demand
```

## Heuristic fallback

Without an API key, a candidate must have a cluster guess. The configured moat terms determine Lane B.
Differentiation and groundability use conservative defaults. This mode is useful for smoke tests, not as a
replacement for editorial review.

## Tuning

After the first industry run, review at least 20 topics from each lane. Change `practice_value` in
`config/engine.json`, improve seeds/source searches, or clarify scope. Do not change formulas until the
configuration itself has been tested with real candidates.
