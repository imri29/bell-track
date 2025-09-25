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

**Future Features (Later):**
- Workout templates
- Progress charts and analytics
- Exercise form videos/descriptions

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