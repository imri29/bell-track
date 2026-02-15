# Workout Recommendation Roadmap (V1 → V3)

## Feature Goal

Build a progression of recommendation features so the app can guide what to train next while balancing body-part/movement coverage.

Example:
- If the last workout already included a horizontal push pattern (e.g., push-ups), v1 should warn about overlap.
- In v2, the app should suggest an alternative pattern (e.g., vertical press).
- In v3, the app should generate a full workout using explicit rules plus this week's training history.

## Recommended Delivery Sequence

## V1: Warning Only (Ship First)

### Goal
Detect recent movement-pattern overlap and show warnings before workout submission.

### Data/Schema Direction
- Add `primaryPattern` to `Exercise` (enum).
- Add optional `secondaryPatterns` to `Exercise` (array).

### Backend Logic
- Create backend analysis function (service/helper), for example:
  - `analyzeLastWorkoutPatterns(userId)`
- Return pattern overlap data to the workout form flow.

### UI Behavior
- Show warning text like:
  - "You hit horizontal push in your last workout."

### Why It Matters
- Establishes the movement-classification foundation.
- Creates reusable history analysis for v2 and v3.

## V2: Suggest Alternatives

### Goal
Recommend exercises from undertrained patterns rather than only warning.

### Scoring Strategy (Deterministic)
- Penalize patterns trained in last 1-2 workouts.
- Boost patterns not trained this week.
- Rank candidate exercises by score.

### API Direction
- Add a tRPC procedure such as:
  - `workout.getSuggestions`
- Return suggestions with reason strings.

### Explainability Requirement
- Every suggestion should include a plain-language reason, e.g.:
  - "Suggested because vertical push has not been trained in 6 days."

### Why It Matters
- Moves from passive warning to actionable recommendation.
- Keeps behavior predictable and easy to test.

## V3: Rule-Based Workout Builder

### Goal
Generate a complete workout from user-defined rules + this week's workout history.

### Rules Model Direction
Store a `WorkoutRuleSet` (JSON or normalized tables) with constraints such as:
- Required patterns per week.
- Maximum repeat frequency windows.
- Target session duration.
- Equipment constraints.

### Builder Pipeline
1. Fetch weekly movement-pattern counts.
2. Apply hard constraints.
3. Rank candidate exercises.
4. Assemble a workout draft.
5. Validate final movement coverage against rules.

### Why It Matters
- Turns recommendation logic into a repeatable planning system.
- Reuses the same taxonomy and scoring primitives from v1/v2.

## Critical Early Decision: Movement Taxonomy

Define a movement taxonomy now, because all versions depend on it.

Suggested starting taxonomy:
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

## Backend Learning Value (Why This Sequence Is Strong)

- V1 teaches schema + history analysis.
- V2 teaches recommendation/scoring APIs.
- V3 teaches constraint-based backend architecture.
- Nothing is throwaway: each step is a strict superset of the previous one.

## Suggested Next Implementation Slice

Start with v1 end-to-end:
1. Add exercise pattern fields in Prisma schema.
2. Create migration and update seed/test data.
3. Add tRPC procedure for overlap analysis.
4. Surface warnings in the workout creation UI.
5. Add tests for pattern overlap behavior.
