# Bell Track - Development Features

## Current Sprint: Exercise Library Foundation

### 🚀 Feature 1: Exercise Library CRUD
**Status**: Ready to Start
**Priority**: P0 (Foundational)

**Description**: Build the core exercise management system where users can create, view, and delete kettlebell exercises with type classification.

**Technical Tasks**:
- [ ] Set up Prisma schema for Exercise model
- [ ] Create tRPC procedures: `exercise.getAll()`, `exercise.create()`, `exercise.delete()`
- [ ] Build exercise form component (name, description, muscle groups, type)
- [ ] Create exercise list/grid view
- [ ] Add basic validation and error handling

**Database Schema**:
```prisma
model Exercise {
  id            String   @id @default(cuid())
  name          String
  description   String?
  muscleGroups  String[] // ["legs", "shoulders", "core"]
  equipment     String   @default("kettlebell")
  type          String   // "exercise" | "complex"
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

## Backlog

### 🔄 Feature 2: Basic Workout Logging
**Status**: Not Started
**Priority**: P1

- Select exercises from library
- Log sets (reps, weight, rest time)
- Save workout with date and notes

### 📊 Feature 3: Workout History
**Status**: Not Started
**Priority**: P2

- View list of past workouts
- Basic workout details view
- Simple progress indicators

---

## Technical Debt / Infrastructure
- [ ] Set up database (SQLite for development)
- [ ] Configure tRPC client/server setup
- [ ] Basic app layout and navigation
- [ ] TypeScript configuration optimization