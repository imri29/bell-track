# Workout Recommendation Tickets (V1 First)

Related roadmap: `/Users/imri.n/dev/bell-track/docs/workout-recommendation-roadmap.md`

## Status Legend
- `todo`
- `in-progress`
- `done`
- `blocked`

## Ticket Backlog

### WR-001 - Add movement metadata to Exercise (starter)
- Status: `todo`
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

### WR-002 - Backfill seed data for movement fields
- Status: `todo`
- Assignee: `you`
- Goal: Ensure existing exercises have movement metadata where applicable.
- Scope:
  - Update seed files to set movement fields on non-complex exercises.
  - Leave complex entries nullable for now.
- Acceptance Criteria:
  - Seeding runs without errors.
  - Spot check shows movement fields populated for standard exercises.

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

## Minimal First Ticket (Start Here)

### Start with WR-001 only
- Keep it intentionally small: schema + migration + typecheck.
- Do not touch UI or router behavior yet.
- Share the migration diff and schema after completion, then we will review before WR-002.

