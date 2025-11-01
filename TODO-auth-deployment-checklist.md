## Deployment & Migration Checklist

### 1. Prepare Production Environment

- Ensure the latest `.env` in production includes:
    - `AUTH_SECRET`
    - `AUTH_GOOGLE_ID`
    - `AUTH_GOOGLE_SECRET`
    - `DATABASE_URL`
- Create a fresh database backup before applying migrations.
- Confirm `npm run build` succeeds locally.

### 2. Apply Prisma Migrations in Production

```bash 
prisma migrate deploy 
```

### 3. Seed / Backfill

- Sign in to the production app with your Google account **once** to create the `User` record.
- Backfill legacy workouts/templates so they belong to your user:

```bash
npm run db:backfill:user -- --email YOUR_EMAIL@example.com
```

- Requires the production database credentials in the environment.

### 4. Verification Steps

- `npm run lint`
- `npm run ts`
- `npm run build`
- `npm run db:seed` (optional, only if seeding is needed in non-prod).

### 5. After Deployment Smoke Test

- Sign in with your main Google account; verify existing data is still visible.
- Sign in with a second account; confirm it sees an empty state.
- Confirm create/update/delete workflows operate only on the current account.

