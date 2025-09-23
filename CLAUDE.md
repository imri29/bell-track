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
   - Add/edit kettlebell exercises
   - Store exercise details (name, muscle groups, equipment needed)
2. Workout logging
   - Select exercises for workout
   - Log sets, reps, weight, rest time
   - Add workout notes and duration
3. Workout history and progress tracking
   - View past workouts
   - Track progress over time

**Database Models Needed:**
- Exercise (id, name, description, muscle_groups, equipment)
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