# Workout Balance & Recommendation Tickets

Related roadmap: `/Users/imri.n/dev/bell-track/docs/workout-recommendation-roadmap.md`

## Status Legend
- `todo`
- `in-progress`
- `done`
- `blocked`

## Ticket Backlog

### WR-001 - Add movement metadata to Exercise (starter)
- Status: `done`
- Assignee: `you`
- Goal: Add the minimum schema foundation so every non-complex exercise can be classified.
- Scope:
  - Add Prisma enums:
    - `MovementGroup` = `PUSH | PULL | CORE | LEGS`
    - `MovementPlane` = `VERTICAL | HORIZONTAL`
    - `LegBias` = `QUAD_DOMINANT | HAMSTRING_DOMINANT`
  - Add fields on `Exercise`:
    - `movementGroup MovementGroup?`
    - `movementPlane MovementPlane?`
    - `legBias LegBias?`
- Acceptance Criteria:
  - Prisma schema compiles.
  - Migration is created with clear name.
  - `pnpm run ts` passes.
- Why this matters:
  - All validation and warning logic depends on structured movement data.

Implementation note: the schema migration and exercise API plumbing are complete. The existing backfill script is tracked separately in WR-002 and requires a configured `DATABASE_URL` to audit or apply against a database.

### WR-002 - Backfill seed data for movement fields
- Status: `in-progress`
- Assignee: `you`
- Goal: Ensure existing exercises have movement metadata where applicable.
- Scope:
  - Update seed files to set movement fields on non-complex exercises.
  - Leave complex entries nullable for now.
- Acceptance Criteria:
  - Seeding runs without errors.
  - Spot check shows movement fields populated for standard exercises.

Implementation note: canonical seed exercises now include explicit movement metadata. Live database discovery/backfill remains pending until a configured `DATABASE_URL` is available; use `pnpm run db:discover:movement` before applying `pnpm run db:backfill:movement`.

### WR-003 - Add draft validation contract in shared schemas
- Status: `todo`
- Assignee: `you`
- Goal: Define API input/output types for workout composition checks.
- Scope:
  - Add `validateDraft` input schema for selected workout items.
  - Add output schema `{ errors: string[]; warnings: string[] }`.
- Acceptance Criteria:
  - Schema types are exported and used by router without `any`.
  - `pnpm run ts` passes.

### WR-004 - Implement full-body validator service (big 4 exact coverage)
- Status: `todo`
- Assignee: `you`
- Goal: Enforce V1 composition rules in backend logic.
- Scope:
  - Implement pure server function that checks workout covers exactly:
    - 1 `PUSH`
    - 1 `PULL`
    - 1 `CORE`
    - 1 `LEGS`
  - Support complex V1 behavior via explicit assignment fields (from WR-005).
- Acceptance Criteria:
  - Function returns deterministic errors.
  - Unit tests cover missing and duplicate categories.

### WR-005 - Add complex assignment override fields on WorkoutExercise
- Status: `todo`
- Assignee: `you`
- Goal: Let a complex count as exactly one of the big 4 in V1.
- Scope:
  - Add optional fields to `WorkoutExercise`:
    - `assignedCategory MovementGroup?`
    - `assignedPlane MovementPlane?` (for push/pull only)
    - `assignedLegBias LegBias?` (for legs only)
- Acceptance Criteria:
  - Migration created.
  - Router create/update accepts and persists these fields.

### WR-006 - Add last-workout pattern warning engine
- Status: `todo`
- Assignee: `you`
- Goal: Warn when selected pattern repeats last workout pattern.
- Scope:
  - Compare current draft signature vs latest workout signature.
  - Warnings for repeated:
    - pull plane
    - push plane
    - leg bias
- Acceptance Criteria:
  - Returns warnings without blocking save.
  - Tests verify repeated vertical pull warning case.

### WR-007 - Expose `workout.validateDraft` tRPC procedure
- Status: `todo`
- Assignee: `you`
- Goal: Surface validator + warning logic to frontend via tRPC.
- Scope:
  - Add procedure in workout router.
  - Wire in auth-aware user context and latest workout lookup.
- Acceptance Criteria:
  - Procedure returns `errors` and `warnings`.
  - Router tests cover auth + basic happy path.

### WR-008 - Show validation errors and warnings in workout form
- Status: `todo`
- Assignee: `you`
- Goal: Provide immediate guidance while building a workout.
- Scope:
  - Call `validateDraft` from form flow.
  - Block submit on errors.
  - Show non-blocking warning banner/list.
- Acceptance Criteria:
  - Missing big-4 slot blocks submission.
  - Repeated pattern shows warning and still allows submission.

### WR-009 - V1 polish and regression tests
- Status: `todo`
- Assignee: `you`
- Goal: Make V1 stable and reviewable.
- Scope:
  - Add/adjust router and UI tests for final V1 behavior.
  - Run `pnpm run ts` and targeted tests.
- Acceptance Criteria:
  - No TypeScript errors.
  - Core V1 scenarios covered by tests.

### WR-010 - Add training-history summary service
- Status: `todo`
- Assignee: `you`
- Goal: Produce a reusable summary of movement coverage, recency, and exercise repetition.
- Scope:
  - Analyze the last 7 and 14 days of workouts.
  - Return last-workout patterns, pattern counts, days since trained, and exact exercise frequency.
  - Keep the service pure and independent of React or tRPC.
- Acceptance Criteria:
  - Empty history and sparse history are handled safely.
  - Results are deterministic and fully typed.
  - Unit tests cover recency, frequency, and neglected exercises.

### WR-011 - Expand draft feedback contract
- Status: `todo`
- Assignee: `you`
- Goal: Distinguish blocking input errors from non-blocking coaching feedback.
- Scope:
  - Return `{ errors, warnings, hints }` with reason strings.
  - Keep warnings and hints non-blocking.
  - Include stable codes so the UI can render them consistently.
- Acceptance Criteria:
  - Repeated patterns produce warnings.
  - Missing recent coverage and repeated exact exercises produce hints.
  - Every message is explainable to the user.

### WR-012 - Add draft balance panel
- Status: `todo`
- Assignee: `you`
- Goal: Surface balance feedback while composing a workout.
- Scope:
  - Call the draft feedback procedure as the draft changes.
  - Debounce or otherwise avoid a request for every keystroke.
  - Show compact feedback near the form actions.
- Acceptance Criteria:
  - Feedback updates when exercises are added, removed, or changed.
  - Warnings do not prevent saving.
  - Mobile layout does not obscure the submit controls.

### WR-013 - Add explainable exercise suggestions
- Status: `todo`
- Assignee: `you`
- Goal: Offer existing-library alternatives for undertrained patterns and overused exercises.
- Scope:
  - Add deterministic candidate ranking.
  - Respect equipment and optional shoulder-friendly preferences.
  - Return a reason with every suggestion.
- Acceptance Criteria:
  - Suggestions use existing exercises only.
  - A suggestion can be inserted into the current draft.
  - Ranking behavior has unit tests.

### WR-014 - Add balance and variety summary
- Status: `todo`
- Assignee: `you`
- Goal: Provide a lightweight history view for coverage, repetition, and neglected movements.
- Scope:
  - Show weekly pattern coverage.
  - Show most-repeated exercises over 14 or 30 days.
  - Show patterns and exercises not used recently.
  - Add simple progress indicators where data is available.
- Acceptance Criteria:
  - Time windows are visible.
  - Sparse history produces a useful empty state.
  - Summary complements, rather than replaces, workout history.

## Minimal First Ticket (Start Here)

### Start with WR-001 only
- Keep it intentionally small: schema + migration + typecheck.
- Do not touch UI or router behavior yet.
- Share the migration diff and schema after completion, then we will review before WR-002.

## Revised Product Direction

WR-004 and WR-008 should not initially enforce an exact one-of-each workout composition. The first release should provide non-blocking balance hints based on recent history. Strict validation can be reconsidered later if real usage shows that the user wants it.

## Deferred Project Tasks

### OPS-001 - Mark production DATABASE_URL as sensitive in Vercel
- Status: `todo`
- Assignee: `you`
- Goal: Protect the production database credential in Vercel’s environment-variable dashboard.
- Scope:
  - Confirm the exact `DATABASE_URL` value points to the intended production Neon database.
  - Remove and re-add the Production variable with Vercel’s Sensitive option enabled.
  - Redeploy after saving the variable.
- Acceptance Criteria:
  - Production has exactly one active `DATABASE_URL` value.
  - The variable is marked Sensitive and is not readable in the dashboard.
  - The deployed app can still connect to PostgreSQL after redeployment.
- Note: Do not modify the unrelated `POSTGRES_*` integration variables unless the deployment itself requires it.
