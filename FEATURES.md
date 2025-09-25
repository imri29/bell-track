# Bell Track - Development Features

## Current Sprint: Exercise Library Foundation

### 🚀 Feature 1: Exercise Library CRUD
**Status**: ✅ COMPLETED
**Priority**: P0 (Foundational)

**Description**: Build the core exercise management system where users can create, view, and delete kettlebell exercises with type classification.

**Technical Tasks**:
- [x] Set up Prisma schema for Exercise model
- [x] Create tRPC procedures: `exercise.getAll()`, `exercise.create()`, `exercise.delete()`
- [x] Build exercise form component (name, description, type)
- [x] Create exercise list view with complex sub-exercise support
- [x] Add shadcn/ui components and styling
- [x] Fix JSON parsing for subExercises array
- [x] Add proper TypeScript types for complex exercises

**Database Schema**:
```prisma
enum ExerciseType {
  EXERCISE
  COMPLEX
}

model Exercise {
  id            String   @id @default(cuid())
  name          String   @unique
  type          ExerciseType
  subExercises  String?  // JSON array of exercise IDs for complex types
  description   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Learning Goals**:
- Prisma schema design and migrations
- tRPC procedure creation and type safety
- React Query integration with tRPC
- Form handling in Next.js App Router

---

## Current Sprint: Workout Logging

### 🔄 Feature 2: Basic Workout Logging
**Status**: Ready to Start
**Priority**: P1 (Next Up!)

**Description**: Build workout logging functionality where users can select exercises and log their workout sessions.

**Technical Tasks**:
- [ ] Create Workout and WorkoutExercise models in Prisma
- [ ] Build workout creation form with exercise selection
- [ ] Add set logging (reps, weight, rest time)
- [ ] Create workout session management
- [ ] Save workout with date and notes
- [ ] Display current workout in progress

**Database Schema Additions Needed**:
```prisma
model Workout {
  id              String   @id @default(cuid())
  date            DateTime @default(now())
  duration        Int?     // minutes
  notes           String?
  workoutExercises WorkoutExercise[]
  createdAt       DateTime @default(now())
}

model WorkoutExercise {
  id          String   @id @default(cuid())
  workoutId   String
  exerciseId  String
  sets        Int
  reps        Int
  weight      Float?   // kg
  restTime    Int?     // seconds
  workout     Workout  @relation(fields: [workoutId], references: [id])
  exercise    Exercise @relation(fields: [exerciseId], references: [id])
}
```

**Learning Goals**:
- Complex form handling with dynamic arrays
- Multi-model database relationships
- State management for workout sessions
- Time tracking and session management

---

## Backlog

### 📊 Feature 3: Workout History
**Status**: Not Started
**Priority**: P2

- View list of past workouts
- Basic workout details view
- Simple progress indicators

---

## Technical Debt / Infrastructure
- [x] Set up database (SQLite for development)
- [x] Configure tRPC client/server setup
- [x] Basic app layout and navigation
- [x] TypeScript configuration optimization
- [x] shadcn/ui component system setup