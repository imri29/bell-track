# Workout Balance & Recommendation Roadmap

## Feature Goal

Help the user build balanced, varied workouts using recent training history. The app should offer short, explainable hints while a workout is being created:

- “You trained horizontal push yesterday; vertical push may balance today’s session.”
- “You have done push-ups 5 times in the last 14 days; consider changing the variation.”
- “Cossack squats have not appeared in your workouts for 21 days.”
- “This draft has push and hinge work, but no pull or squat pattern.”

This is a coaching aid, not a rigid program generator. Recommendations should be deterministic, transparent, and easy to dismiss.

## Product Principles

- Start with non-blocking hints. Do not prevent a workout because it is not perfectly balanced.
- Explain every warning or suggestion in plain language.
- Use recent history, not just the immediately previous workout.
- Separate movement coverage from exercise variety. Repeating a movement pattern can be useful while repeating the exact same exercise may still be worth changing.
- Prefer the user’s existing exercise library for suggestions.
- Keep complex exercises nullable or explicitly assignable until their movement contributions are defined.
- Do not make medical or injury-safety claims. Shoulder-related preferences can influence suggestions, but the user remains in control.

## Delivery Plan

### Part 1: Movement Taxonomy and Metadata

**Goal:** Give exercises enough structured metadata for reliable analysis.

Add fields for:

- Primary movement pattern: `horizontal-push`, `vertical-push`, `horizontal-pull`, `vertical-pull`, `squat`, `hinge`, `lunge`, `core`, `carry`, or `rotation`.
- Optional body regions: chest, shoulders, back, quads, hamstrings, glutes, or full body.
- Optional leg bias: quad-dominant or hamstring-dominant.
- Optional equipment and difficulty metadata for later filtering.

Deliverable: schema, migration, seed/backfill, and exercise-library editing support where needed.

Acceptance criteria:

- Existing standard exercises have usable movement metadata.
- Complexes may remain nullable or use an explicit assignment.
- No recommendation behavior changes yet.

### Part 2: History Analysis Service

**Goal:** Turn logged workouts into a reusable, deterministic training summary.

Create a pure analysis layer that can calculate:

- Patterns used in the last workout.
- Pattern frequency over the last 7 and 14 days.
- Days since each pattern was trained.
- Body-region coverage over the selected window.
- Exact exercise frequency and last-used date.
- Missing or underrepresented patterns.

Deliverable: typed server-side summary with unit tests and no UI dependency.

Acceptance criteria:

- Empty history is handled safely.
- Results are deterministic for the same workout set.
- Each result retains enough detail to produce an explanation.

### Part 3: Draft Balance Hints

**Goal:** Show useful feedback while composing a workout.

Add a `workout.validateDraft` or similarly named tRPC procedure that receives the current draft and returns:

- `errors`: only genuine input problems, such as an empty workout.
- `warnings`: useful but non-blocking overlap or coverage concerns.
- `hints`: positive recommendations, such as an undertrained pattern or neglected exercise.

Initial rules:

- Warn when a draft repeats the same push/pull plane as the previous workout.
- Hint when a major pattern is absent from the recent 7-day window.
- Hint when an exact exercise appears unusually often in the last 14 days.
- Remind when an exercise has not been used for a configurable period, initially 21 days.

Deliverable: backend contract, router procedure, and form-level feedback.

Acceptance criteria:

- Warnings never block saving.
- Every warning and hint includes a reason string.
- The form updates feedback as the draft changes without making excessive requests.
- Mobile layout remains readable and does not obscure submit controls.

### Part 4: Explainable Exercise Suggestions

**Goal:** Turn hints into actionable alternatives from the existing library.

Add deterministic candidate scoring:

- Boost undertrained movement patterns.
- Penalize patterns and exact exercises used very recently.
- Prefer exercises matching available equipment and the draft’s intent.
- Respect optional user preferences such as shoulder-friendly movements.

Expose a procedure such as `workout.getSuggestions` returning exercise IDs, scores or rank, and a human-readable reason.

Acceptance criteria:

- Suggestions are drawn from the user’s exercise library.
- A suggestion can be inserted into the draft with one action.
- The reason explains the recommendation without exposing opaque scoring details.

### Part 5: Progress and Variety View

**Goal:** Make longer-term patterns visible without turning the app into a spreadsheet.

Add a compact dashboard or history summary showing:

- Pattern coverage this week.
- Most-repeated exercises over 14 or 30 days.
- Neglected exercises and patterns.
- Simple progress indicators for selected exercises, such as best weight or total reps.

Acceptance criteria:

- The view is useful with sparse history.
- Metrics use clearly labeled time windows.
- Progress is shown alongside balance and variety, not as a replacement for them.

### Part 6: Personalization and Rule Settings

**Goal:** Let the user tune the coaching behavior after the defaults prove useful.

Possible settings:

- Analysis window: 7, 14, or 30 days.
- Variety reminder threshold.
- Preferred equipment.
- Movements to avoid or prioritize.
- Whether hints should be quiet, standard, or more proactive.

Do this only after the default rules have been tested in real use.

## Initial Movement Taxonomy

Use these as the first-class movement patterns:

- `horizontal-push`
- `vertical-push`
- `horizontal-pull`
- `vertical-pull`
- `squat`
- `hinge`
- `lunge`
- `core`
- `carry`
- `rotation`

Body region and movement pattern are related but should not be collapsed into one field. For example, a push-up is a horizontal push that primarily involves chest, shoulders, and triceps.

## Recommended Implementation Slices

Work part by part, keeping each change reviewable:

1. Part 1 only: schema and metadata foundation.
2. Part 2 only: pure history summary and tests.
3. Part 3: tRPC contract, then form feedback.
4. Part 4: suggestions and one-click insertion.
5. Part 5: progress/variety summary.
6. Part 6: personalization after real-world feedback.

Start with Part 1 and review the taxonomy and backfill before implementing recommendation logic.

## Related Planning Documents

- `docs/workout-recommendation-tickets.md` contains the implementation backlog.
- `docs/section-title-feature-plan.md` covers section labels and is complementary to this feature.
