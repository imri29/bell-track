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
   - Local Development: Continues using SQLite (`file:./dev.db`)
   - Database URL: `postgresql://neondb_owner:npg_8ZeIPsFV4wlh@ep-sparkling-lab-ad92a3lk-pooler.c-2.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require`

### 🚨 URGENT: Remaining Steps to Complete Migration
**The production app is still broken - need to deploy the schema changes!**

1. **Commit and Deploy Schema Changes**
   ```bash
   git add prisma/schema.prisma
   git commit -m "Update Prisma schema to use PostgreSQL for production"
   git push origin main
   ```

2. **Verify Deployment**
   - Check that Vercel deployment completes successfully
   - Test production app - database queries should work
   - All tables (Exercise, Workout, WorkoutExercise, WorkoutTemplate) are created in PostgreSQL

### Current Issue
Production deployment has old schema (`provider = "sqlite"`) but production `DATABASE_URL` is PostgreSQL, causing validation errors. Need to deploy the updated schema.

## Development Commands

### Type Checking
- `yarn ts` - Run TypeScript type checking without emitting files
- always prefer to derive state instead of adding useless useState