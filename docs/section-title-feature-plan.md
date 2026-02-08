# Workout Section Titles (Finisher / EMOM / AMRAP) Plan

## Goal

Allow workouts and templates to label parts of a session with a title (for example: `Strength Block`, `Finisher - EMOM 40/20`), while keeping existing exercise ordering/grouping behavior.

## Complexity

Medium-small. Good first backend-focused end-to-end feature:

- 1 Prisma migration
- Shared API schema updates
- Router create/update/serialize changes
- Form + display changes
- Tests update

No new table is needed for V1.

## V1 Data Model Decision

Add an optional `sectionTitle` field on `WorkoutExercise`.

Why this is the right first step:

- Minimal schema change with immediate UX value.
- Works for both workouts and templates because both use `WorkoutExercise`.
- Avoids introducing a separate `WorkoutSection` model too early.

Tradeoff:

- Section title is repeated per exercise in a section. Acceptable for V1; we can normalize later if needed.

## Implementation Steps (You Build, I Guide)

1. Prisma schema + migration
- File: `prisma/schema.prisma`
- Add `sectionTitle String?` to `WorkoutExercise`.
- Create migration with a clear name, e.g. `add_workout_exercise_section_title`.
- Run Prisma generate/migrate locally.

2. Shared Zod schemas
- File: `src/server/api/schemas.ts`
- Add `sectionTitle` to:
  - `workoutExerciseInputSchema` as optional string (likely with trim and max length guard).
  - `workoutExerciseOutputSchema` with null-to-empty or null-to-undefined transform (match current style in file).

3. Workout router propagation
- File: `src/server/api/routers/workout.ts`
- Ensure `serializeWorkout` includes `sectionTitle`.
- Ensure `create` and `update` map `sectionTitle` into `exercises.create`.

4. Template router propagation
- File: `src/server/api/routers/template.ts`
- Add `sectionTitle` to template exercise input/output schemas.
- Ensure `serializeTemplate`, `create`, and `update` include it.

5. Form types + submit payload
- File: `src/components/workout-form.tsx`
- Extend `WorkoutExerciseFormValues` and submit payload types with `sectionTitle?: string`.
- Include `sectionTitle` in `handleFormSubmit` exercise mapping.
- Add an input for section title in each exercise card (keep it optional).

6. Template create/edit forms
- Files:
  - `src/app/templates/new/page.tsx`
  - `src/app/templates/[id]/edit/page.tsx`
- Extend local form types with `sectionTitle?: string`.
- Ensure submit mappings include it.
- Add section title input near current `group` field.

7. Workout edit + template-to-workout mapping
- Files:
  - `src/app/history/[id]/edit/page.tsx`
  - `src/app/history/new/new-workout-client.tsx`
- Map incoming `sectionTitle` into form initial values/template conversion.

8. Display section headers
- Candidate files:
  - `src/components/workout-list-view.tsx`
  - `src/components/calendar-view.tsx` or day detail components where exercises render
  - `src/app/templates/page.tsx` (template preview cards)
- Render a section header when the section changes:
  - Prefer `sectionTitle` if present.
  - Fallback to current group label behavior if no title.

9. Tests
- Update/add tests for routers first:
  - `src/server/api/routers/workout.test.ts`
  - `src/server/api/routers/template.test.ts`
- Assert `sectionTitle` is accepted on input and returned in serialized output.
- Update UI tests affected by new required shape changes (if any).

10. Verify
- Run:
  - `pnpm run ts`
  - `pnpm run lint`
  - relevant Vitest files
- Manual checks:
  - Create template with titled finisher block.
  - Create workout from template and confirm titles carry over.
  - Edit existing workout/template and update section title.
  - History/calendar/template views show section headers correctly.

## Suggested V1 UX Rules

- `sectionTitle` is optional.
- Max length: 60 characters.
- Empty or whitespace-only values should be treated as undefined.
- Keep `group` unchanged for ordering and existing flows.
- If multiple consecutive exercises share same non-empty `sectionTitle`, show header once.

## Out of Scope (V2 Ideas)

- Dedicated `WorkoutSection` model.
- Section-level metadata (protocol type enum: EMOM/AMRAP/FOR_TIME, duration, notes).
- Drag/drop whole sections.

## Working Agreement For This Feature

For each step:

1. You implement a small slice.
2. You share diff or tell me when it compiles.
3. I review, point out backend concerns, and give next slice.

