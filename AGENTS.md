# Repository Guidelines

## Project Structure & Module Organization

Bell Track runs on Next.js App Router inside `src/app`, with route groups combining server components, `loading.tsx`,
and API handlers. Shared UI lives in `src/components` (shadcn primitives in `src/components/ui`), contexts in
`src/contexts`, and reusable utilities in `src/lib`. tRPC routers reside in `src/trpc`, while `src/server` contains
Prisma-backed domain services consumed by routers and server actions. Database schema and seeds are under `prisma/`,
generated artifacts belong in `src/generated`, and static assets sit in `public/`. Place new feature helpers beside the
code that imports them.

## Build, Test, and Development Commands

- `npm run dev` — Next.js + Turbopack on http://localhost:8080.
- `npm run build` — production bundle; run before pushing deploy branches.
- `npm run start` — serve the previously built app for smoke checks.
- `npm run lint` — Biome lint rules (fails on style + simple bugs).
- `npm run format` — apply Biome's auto-format.
- `npm run ts` — TypeScript `--noEmit` verification.
- `npm run db:seed` — execute `prisma/seed.ts` against the configured database.
- `npm run db:seed:prod` — seed only canonical data (workout tags) for production.
- `npm run db:studio` — open Prisma Studio for local data inspection.

## Coding Style & Naming Conventions

Biome enforces 2-space indentation, organized import blocks, and trailing commas. Prefer named exports, camelCase
symbols, and kebab-case filenames (for example, `workout-log-card.tsx`).
Reach for the `@/` alias instead of lengthy relative paths. Favor `type` aliases and literal unions with `as const`, and
validate inputs with Zod. UI code should compose shadcn components (`<Button>`, `<Input>`) rather than raw
elements—stick with the shadcn system unless the design spec says otherwise.
Treat TypeScript errors as blockers: do not ignore diagnostics or introduce `any` without explicit approval. Skip
`useMemo` unless profiling shows the need—React Compiler handles common memoization.

## Testing Guidelines

Automated tests are not yet standardized; align in your PR when adding them (Vitest + React Testing Library is the
expected direction). Co-locate specs as `*.test.ts(x)` near implementation code and seed deterministic data if the
scenarios depend on Prisma. Until a test command lands in `package.json`, cover changes through manual flows in
`npm run dev` and record the steps or media in the PR.

## Commit & Pull Request Guidelines

Follow the current history: concise, present-tense subjects (`add workout log card`) and focused diffs. Summaries should
mention schema or seed impacts. PR descriptions must call out the problem, solution, and verification, link issues or
Linear tickets, and attach screenshots for UI updates. Highlight any required `npm run db:seed` so reviewers can mirror
your environment.

## Agent Workflow Expectations

- Consult `FEATURES.md` before picking up work so the roadmap stays the single source of truth.
- When a feature is marked as complete in `FEATURES.md`, verify the implementation matches the documented scope before
  closing it out or marking it shipped.

## Instructions

- Make sure you use Next 15 instructions