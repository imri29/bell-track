# TODO: User Authentication & Data Isolation

## Current State (Critical Issues)

### Security Problems
- ❌ **No user data isolation** - All workouts and templates are global
- ❌ **No userId on data models** - Workout, WorkoutTemplate have no user ownership
- ❌ **All queries fetch ALL data** - No user filtering in tRPC routers
- ❌ **NextAuth has no database adapter** - Users not persisted in database
- ❌ **Any logged-in user can see/modify everyone's data**

### What Works
- ✅ Google OAuth sign-in flow
- ✅ Session management (in-memory only)
- ✅ Sign-in/sign-out UI

## Required Implementation

### 1. Add NextAuth Database Adapter

**Install dependencies:**
```bash
npm install @auth/prisma-adapter
```

**Update `src/auth.ts`:**
```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    session({ session, user }) {
      // Add userId to session for tRPC context
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
```

### 2. Update Database Schema

**Add to `prisma/schema.prisma`:**

```prisma
// NextAuth models
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]

  // User's data
  workouts         Workout[]
  workoutTemplates WorkoutTemplate[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@id([identifier, token])
}
```

**Update existing models:**

```prisma
model Workout {
  id        String   @id @default(cuid())
  userId    String   // ADD THIS
  date      DateTime
  duration  Int?
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User                   @relation(fields: [userId], references: [id], onDelete: Cascade) // ADD THIS
  exercises WorkoutExercise[]
  tags      WorkoutTagAssignment[]

  @@index([userId]) // ADD THIS for query performance
}

model WorkoutTemplate {
  id          String   @id @default(cuid())
  userId      String   // ADD THIS
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user      User                 @relation(fields: [userId], references: [id], onDelete: Cascade) // ADD THIS
  exercises WorkoutExercise[]
  tags      WorkoutTemplateTag[]

  @@index([userId]) // ADD THIS for query performance
}

// Decision needed: Should Exercise be per-user or global?
// Option A: Keep Exercise global (shared library)
// Option B: Add userId to Exercise for per-user libraries
```

**Run migration:**
```bash
npx prisma db push
```

### 3. Update tRPC Context & Procedures

**Create `src/server/context.ts`:**
```typescript
import { auth } from "@/auth";

export async function createTRPCContext() {
  const session = await auth();

  return {
    session,
    userId: session?.user?.id,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
```

**Update `src/server/trpc.ts`:**
```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError, z } from "zod";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? z.prettifyError(error.cause) : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.userId,
    },
  });
});
```

**Update `app/api/trpc/[trpc]/route.ts`:**
```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext, // ADD THIS
  });

export { handler as GET, handler as POST };
```

### 4. Update All tRPC Routers

**Update `src/server/api/routers/workout.ts`:**

Change all procedures from `publicProcedure` to `protectedProcedure` and add user filtering:

```typescript
export const workoutRouter = createTRPCRouter({
  getAll: protectedProcedure
    .output(z.array(workoutOutputSchema))
    .query(async ({ ctx }) => {
      const workouts = await prisma.workout.findMany({
        where: { userId: ctx.userId }, // ADD THIS
        orderBy: { createdAt: "desc" },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: [{ group: "asc" }, { order: "asc" }],
          },
          tags: { include: { tag: true } },
        },
      });
      return workouts.map((workout) => serializeWorkout(workout));
    }),

  getById: protectedProcedure
    .input(idSchema)
    .output(workoutOutputSchema.nullable())
    .query(async ({ input, ctx }) => {
      const workout = await prisma.workout.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId, // ADD THIS - security check
        },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: [{ group: "asc" }, { order: "asc" }],
          },
          tags: { include: { tag: true } },
        },
      });

      if (!workout) return null;
      return serializeWorkout(workout);
    }),

  create: protectedProcedure
    .input(createWorkoutSchema)
    .mutation(({ input, ctx }) => {
      const { exercises, tagIds = [], ...workoutData } = input;

      return prisma.workout.create({
        data: {
          ...workoutData,
          userId: ctx.userId, // ADD THIS
          exercises: {
            create: exercises.map((exercise) => ({
              exerciseId: exercise.exerciseId,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              restTime: exercise.restTime,
              notes: exercise.notes,
              group: exercise.group,
              order: exercise.order,
            })),
          },
          ...(tagIds.length > 0 && {
            tags: {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            },
          }),
        },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: [{ group: "asc" }, { order: "asc" }],
          },
          tags: { include: { tag: true } },
        },
      }).then((workout) => serializeWorkout(workout));
    }),

  update: protectedProcedure
    .input(updateWorkoutSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, exercises, tagIds, ...workoutData } = input;

      // Security check - ensure user owns this workout
      const existing = await prisma.workout.findFirst({
        where: { id, userId: ctx.userId },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workout not found or access denied"
        });
      }

      // ... rest of update logic
    }),

  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      // Security check - ensure user owns this workout
      await prisma.workout.delete({
        where: {
          id: input.id,
          userId: ctx.userId, // ADD THIS
        },
      });
      return { success: true };
    }),
});
```

**Similar updates needed for:**
- `src/server/api/routers/template.ts`
- `src/server/api/routers/exercise.ts` (if making per-user)

### 5. Migrate Existing Data

Since production database has your workouts already, we need to assign them to your user:

**Create `scripts/migrate-existing-data.ts`:**
```typescript
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function migrateData() {
  // Replace with your actual email after first sign-in
  const YOUR_EMAIL = "your-email@gmail.com";

  const user = await prisma.user.findUnique({
    where: { email: YOUR_EMAIL },
  });

  if (!user) {
    console.error("User not found. Sign in first, then run this script.");
    process.exit(1);
  }

  console.log(`Found user: ${user.email} (${user.id})`);

  // Update all workouts without userId
  const workoutCount = await prisma.workout.updateMany({
    where: { userId: null },
    data: { userId: user.id },
  });

  console.log(`Migrated ${workoutCount.count} workouts to ${user.email}`);

  // Update all templates without userId
  const templateCount = await prisma.workoutTemplate.updateMany({
    where: { userId: null },
    data: { userId: user.id },
  });

  console.log(`Migrated ${templateCount.count} templates to ${user.email}`);
}

migrateData()
  .then(() => console.log("Migration complete!"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Add to package.json:**
```json
{
  "scripts": {
    "migrate:user-data": "tsx scripts/migrate-existing-data.ts"
  }
}
```

**Migration steps:**
1. Deploy schema changes to production
2. Sign in with Google (creates User record)
3. Update YOUR_EMAIL in script
4. Run: `npm run migrate:user-data`

### 6. New User Onboarding

**Create `src/server/lib/seed-user-data.ts`:**
```typescript
import { PrismaClient } from "@/generated/prisma";

export async function seedNewUserData(userId: string) {
  const prisma = new PrismaClient();

  // Check if user already has data
  const existingWorkouts = await prisma.workout.count({
    where: { userId },
  });

  if (existingWorkouts > 0) {
    console.log("User already has data, skipping seed");
    return;
  }

  // Add starter exercises (if Exercise is per-user)
  // Or skip this if Exercise is global

  // Add starter templates
  const starterTemplate = await prisma.workoutTemplate.create({
    data: {
      userId,
      name: "Beginner Kettlebell Workout",
      description: "A simple starter workout to get you going",
      exercises: {
        create: [
          // ... add some default exercises
        ],
      },
    },
  });

  console.log(`Seeded starter data for user ${userId}`);
}
```

**Call in auth callback (optional):**
```typescript
// In src/auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  // ...
  events: {
    async createUser({ user }) {
      // Seed data for new users
      await seedNewUserData(user.id);
    },
  },
});
```

## Implementation Checklist

- [ ] Install @auth/prisma-adapter
- [ ] Update schema with User/Account/Session models
- [ ] Add userId to Workout and WorkoutTemplate
- [ ] Decide: Exercise per-user or global?
- [ ] Run prisma db push
- [ ] Create tRPC context with auth
- [ ] Add protectedProcedure to trpc.ts
- [ ] Update workout router with user filtering
- [ ] Update template router with user filtering
- [ ] Update exercise router (if per-user)
- [ ] Update tRPC route handler to use createContext
- [ ] Test locally with sign-in
- [ ] Deploy to production
- [ ] Sign in to production
- [ ] Run data migration script
- [ ] Create seed function for new users
- [ ] Test with another Google account

## Testing Checklist

- [ ] Can sign in with Google
- [ ] User record created in database
- [ ] Can only see own workouts
- [ ] Can only edit own workouts
- [ ] Can only delete own workouts
- [ ] Can create new workouts
- [ ] Sign in with different account shows empty state
- [ ] New user gets seed data (if implemented)
- [ ] Existing production data assigned to correct user

## Environment Variables

Ensure these are set in production (.env):

```bash
AUTH_SECRET="<generate-with-openssl-rand-base64-32>"
AUTH_GOOGLE_ID="<from-google-console>"
AUTH_GOOGLE_SECRET="<from-google-console>"
DATABASE_URL="<postgresql-connection-string>"
```

## Notes

- Exercise library decision: Keep global for now (easier), can make per-user later
- Consider adding email verification if needed
- May want to add user settings/preferences table later
- Consider rate limiting for API calls
