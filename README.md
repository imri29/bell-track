## Bell Track

Bell Track is a Next.js App Router project for planning and logging kettlebell training. See `docs/` for
feature-specific notes.

## Getting Started

Development tooling is wired for pnpm.

```bash
pnpm install
pnpm run dev
```

Turbopack serves the app at [http://localhost:8080](http://localhost:8080).

## Prisma & Database Notes

The project now targets PostgreSQL. Earlier revisions used SQLite, so existing environments created before the switch
need a one-time reconciliation step:

```bash
pnpm exec prisma migrate resolve --applied 20251004153013_init_postgres
```

Run that once per environment before executing `prisma migrate deploy`.

### Bootstrapping Workout Tags

Templates rely on a base catalog of tags. For a brand-new environment you can simply run the standard seed script:

```bash
pnpm run db:seed 
```

If you cannot seed the full dataset (for example, on an existing production database), upsert the tags manually. The
following SQL is idempotent:

```sql
INSERT INTO "WorkoutTag" ("id", "name", "slug", "description", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'EMOM', 'emom', 'Every minute on the minute sessions for focused pacing.', NOW(), NOW()),
  (gen_random_uuid()::text, 'AMRAP', 'amrap', 'As many rounds as possible—perfect for short, intense blocks.', NOW(), NOW()),
  (gen_random_uuid()::text, 'Main lift + accessory', 'main-lift-accessory', 'Anchor session around one lift then layer supportive work.', NOW(), NOW()),
  (gen_random_uuid()::text, 'Supersets', 'supersets', 'Pair movements back-to-back to keep the heart rate up.', NOW(), NOW()),
  (gen_random_uuid()::text, 'Complex', 'complex', 'Flow through linked movements without putting the bell down.', NOW(), NOW()),
  (gen_random_uuid()::text, 'Conditioning', 'conditioning', 'Sweat-focused sessions when you want to move fast.', NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE
  SET "name" = EXCLUDED."name",
      "description" = EXCLUDED."description",
      "updatedAt" = NOW();
```

Running this in the Neon SQL editor (or via `psql`) restores the tag catalog without touching workouts.
