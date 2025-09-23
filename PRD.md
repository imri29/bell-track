# Bell Track - Product Requirements Document

## Vision
A simple, focused kettlebell workout tracker that helps you build an exercise library and log workouts efficiently.

## Core User Flow
1. **Exercise Management** - Build your personal exercise library on the server
2. **Workout Logging** - Quick workout entry by selecting exercises and logging sets/reps
3. **History** - View past workouts for progress tracking

## Technical Architecture

### Database Schema
```
Exercise:
- id, name, description, muscle_groups[], equipment_needed, type (exercise/complex)

Workout:
- id, date, duration_minutes, notes, created_at

WorkoutExercise:
- id, workout_id, exercise_id, sets[], order

Set:
- reps, weight_kg, rest_seconds, notes
```

### API Design (tRPC)
```
exercise.getAll()
exercise.create(data)
exercise.update(id, data)
exercise.delete(id)

workout.create(data)
workout.getAll()
workout.getById(id)
```

### UI Structure
- **Exercise Library Page** - CRUD for exercises
- **New Workout Page** - Select exercises, log sets
- **Workout History Page** - List past workouts

## MVP Features (Priority Order)
1. ✅ **Exercise CRUD** - Add/edit/delete exercises with type classification
2. ✅ **Basic Workout Logging** - Select exercises, log basic sets
3. ✅ **Workout History** - View past workouts

## Exercise Types
- **Exercise**: Single movement (e.g., kettlebell swing, goblet squat)
- **Complex**: Multiple exercises performed in sequence (e.g., clean + press + squat)

## Target Tech Stack
- Next.js 14+ (App Router)
- tRPC for API layer
- Prisma + PostgreSQL (or SQLite to start)
- React Query (via tRPC) for client state
- Tailwind CSS for styling