import { z } from "zod";
import { EXERCISE_TYPES } from "@/types";

// Common input schemas
export const idSchema = z.object({ id: z.string() });

// Exercise related schemas
export const subExerciseSchema = z.object({
  exerciseName: z.string(),
  reps: z.number().positive(),
});

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  description: z.string().nullable(),
  subExercises: z.string().nullable(),
});

export const exerciseInputSchema = z.object({
  name: z.string(),
  type: z.enum([EXERCISE_TYPES.EXERCISE, EXERCISE_TYPES.COMPLEX]),
  subExercises: z.array(subExerciseSchema).optional(),
  description: z.string().optional(),
});

// Workout exercise schemas (shared between workout and template)
export const workoutExerciseInputSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().min(1),
  reps: z.string(), // JSON array like "[12, 10, 8]"
  weight: z.number().min(0),
  restTime: z.number().optional().nullable(),
  notes: z.string().optional(),
  group: z.string().optional(), // Exercise group (A, B, C, etc.)
  order: z.number().min(0),
});

export const workoutExerciseOutputSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  sets: z.number(),
  reps: z.string(),
  weight: z
    .number()
    .nullable()
    .transform((val) => val ?? 0),
  restTime: z
    .number()
    .nullable()
    .transform((val) => val || undefined),
  notes: z
    .string()
    .nullable()
    .transform((val) => val ?? ""),
  group: z
    .string()
    .nullable()
    .transform((val) => val ?? ""),
  order: z.number(),
  exercise: exerciseSchema,
});
