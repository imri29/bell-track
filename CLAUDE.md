# Bell Track - Kettlebell Workout Tracker

## Learning Goals

This project is designed to help me practice and learn full-stack app development with focus on:

### Technologies to Learn/Practice

- **Next.js**: Using App Router, Server Components, API routes
- **tRPC**: End-to-end type safety, API design, integration with React Query
- **Backend Development**: Database design, ORM usage, API architecture
- **Database**: Prisma ORM, PostgreSQL (or SQLite to start)
- **Full-Stack TypeScript**: Sharing types between client/server

### Project Requirements

**Core Features:**

1. Exercise database management
    - Add/edit kettlebell exercises and complexes
    - Store exercise details (name, type, description)
    - Support for complex exercises (multiple sub-exercises)
2. Workout logging
    - Select exercises for workout
    - Log sets, reps, weight, rest time
    - Add workout notes and duration
3. Workout history and progress tracking
    - View past workouts
    - Track progress over time

**Database Models Needed:**

- Exercise (id, name, type, description, subExercises)
- Workout (id, date, duration, notes)
- WorkoutExercise (workout_id, exercise_id, sets, reps, weight)

**Technology Stack:**

- Next.js 14+ (App Router)
- tRPC for API layer
- Prisma + PostgreSQL (or SQLite to start simple)
- React Query (via tRPC) for client state
- Tailwind CSS for styling
- shadcn/ui for UI components

**Future Features (Later):**

- Workout templates
- Progress charts and analytics
- Exercise form videos/descriptions
- History page tabs (list view and calendar view)

## Architecture Notes

### Next.js + tRPC Structure

This project uses two separate server-side layers:

**1. Next.js API Routes (`app/api/`)**

- HTTP endpoint handlers that receive web requests
- Located in `app/api/trpc/[trpc]/route.ts`
- Acts as transport layer - handles HTTP requests/responses
- Uses tRPC's `fetchRequestHandler` to bridge HTTP and tRPC

**2. tRPC Business Logic (`src/server/`)**

- Contains actual tRPC routers and procedures
- Pure business logic, database operations, validation
- Not tied to HTTP - could work with other transports
- Located in `src/server/api/` with routers in subdirectories

**Request Flow:**

1. Client makes HTTP request to `/api/trpc/something`
2. Next.js routes to `app/api/trpc/[trpc]/route.ts`
3. HTTP handler calls `appRouter` from `src/server/`
4. Router executes business logic procedure
5. Result flows back through HTTP handler to client

**Why This Separation:**

- **Separation of concerns**: HTTP handling vs business logic
- **Testability**: Can test procedures without HTTP layer
- **Flexibility**: Could add other endpoints (GraphQL, WebSocket) using same logic
- **Organization**: Keeps API logic separate from Next.js routing
- file names needs to be kebab-case

## Current Implementation Status

### ✅ Completed Features

1. **Database Schema & Models**
    - Exercise model with support for complexes
    - Workout model with date, duration, notes
    - WorkoutExercise join table with sets, reps, weight, order, group
    - Prisma setup with SQLite

2. **tRPC API Layer**
    - Exercise router with CRUD operations
    - Workout router with create, read, delete operations
    - Full type safety between client and server

3. **Core Pages**
    - `/` - Home page with navigation
    - `/templates` - Exercise management and templates
    - `/history` - Workout history with list view (✨ currently displays all workouts in chronological order)

4. **Key Components**
    - AddWorkoutModal - Complete workout logging with exercise selection
    - Exercise management with complex exercise support
    - Workout display with grouped exercises
    - Navigation component

### 🚧 In Progress / Next Steps

- History page tabs (list view and calendar view) - **Added to PRD**

## Database Migration to Production (PostgreSQL)

### ✅ Completed Steps (2025-09-28)

1. **Database Setup**
    - Created Neon PostgreSQL database in Vercel
    - Updated Prisma schema: `provider = "sqlite"` → `provider = "postgresql"`
    - Configured Vercel environment variables with PostgreSQL connection string
    - Successfully pushed schema to PostgreSQL: `npx prisma db push`

2. **Environment Configuration**
    - Production: Uses PostgreSQL via Vercel environment variable `DATABASE_URL`

### ✅ COMPLETED: Migration Successfully Deployed (2025-09-28)

1. **Schema Changes Deployed**
    - ✅ Updated Prisma schema to PostgreSQL
    - ✅ Added `postinstall: "prisma generate"` script to package.json
    - ✅ Deployed to production - all database queries working

2. **Production Status**
    - ✅ Vercel deployment successful
    - ✅ PostgreSQL database fully operational
    - ✅ All tables created and accessible

### 🚧 OPTIONAL: Next Steps for Better Development Experience

#### Switch Development to PostgreSQL (Recommended)

**Benefits:**

- Same database in dev and prod (eliminates SQLite vs PostgreSQL differences)
- Easier data migration between environments
- More realistic development environment

**Steps to switch dev to PostgreSQL:**

1. **Update local .env to use PostgreSQL:** d
   ```bash
   # Replace current SQLite URL with PostgreSQL
   DATABASE_URL="<DB_URL>"
   ```

2. **Optional: Create separate dev database (cleaner approach):**
    - Create another Neon database for development
    - Use different connection string for local dev
    - Keeps dev and prod data completely separate

#### Migrate Dev Data to Production

**Goal:** Copy all your local SQLite workout/exercise data to production PostgreSQL

**Steps:**

1. **Export data from SQLite:**
   ```bash
   # First, switch local env back to SQLite temporarily
   DATABASE_URL="file:./dev.db"

   # Create data export script or use Prisma Studio to view/copy data
   npx prisma studio
   ```

2. **Import data to PostgreSQL:**
   ```bash
   # Switch local env to PostgreSQL
   DATABASE_URL="postgresql://..."

   # Use seed script or manual data entry to recreate workouts/exercises
   # Could create a migration script to transfer data
   ```

3. **Alternative: Use database migration tools:**
    - Export SQLite to SQL dump
    - Convert and import to PostgreSQL
    - Tools like `sqlite3 .dump` and custom conversion scripts

### ✅ COMPLETED: Full PostgreSQL Migration (2025-09-28)

#### Database Migration Completed

- ✅ **Data Migration**: Successfully migrated all local SQLite data to PostgreSQL production
    - 64 exercises imported
    - 3 workout templates imported
    - 2 workouts imported
- ✅ **Development Environment**: Switched to PostgreSQL for consistent dev/prod experience
- ✅ **Build Verification**: All TypeScript compilation and builds working correctly

#### Current Database State

- **Local Development:** PostgreSQL (same database as production)
- **Production:** PostgreSQL with full data set
- **Benefits Achieved:**
    - ✅ Eliminated SQLite vs PostgreSQL differences
    - ✅ Consistent development and production environments
    - ✅ All workout data preserved and accessible in both environments

## Development Commands

### Available Scripts

- `npm run dev` - Start development server (Next.js with Turbopack on port 8080)
- `npm run build` - Build production application (Next.js with Turbopack)
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter checks
- `npm run format` - Format code with Biome
- `npm run ts` - Run TypeScript type checking without emitting files
- `npm run db:seed` - Seed the database with sample data
- `npm run db:studio` - Open Prisma Studio for database management

### Important Notes

- Always prefer to derive state instead of adding useless useState
- **TypeScript checking**: Use `npm run ts` (NOT `npm run typecheck`)
- use shadcn components unless instructed otherwise
- do not allow "any" or ts erros