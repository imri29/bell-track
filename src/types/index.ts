import type { ValueOf } from "type-fest";

export const EXERCISE_TYPES = {
  EXERCISE: "EXERCISE",
  COMPLEX: "COMPLEX",
} as const;

export const EXERCISE_TYPE_LABELS = {
  EXERCISE: "Exercise",
  COMPLEX: "Complex",
} as const;

export type ExerciseType = ValueOf<typeof EXERCISE_TYPES>;

export const EXERCISE_UNITS = {
  REPS: "REPS",
  TIME: "TIME",
} as const;

export const EXERCISE_UNIT_LABELS = {
  REPS: "Reps",
  TIME: "Time (sec)",
} as const;

export type ExerciseUnit = ValueOf<typeof EXERCISE_UNITS>;

export type SubExercise = {
  exerciseId: string;
  exerciseName: string;
  reps: number;
};

export type Exercise = {
  id: string;
  name: string;
  type: ExerciseType;
  description: string | null;
  subExercises: SubExercise[] | null;
  createdAt: string;
  updatedAt: string;
};

// API response types
export type CreateExerciseInput = {
  name: string;
  type: ExerciseType;
  description?: string;
  subExercises?: Array<{
    exerciseName: string;
    reps: number;
  }>;
};

export type TemplateData = {
  id: string;
  name: string;
  exercises: Array<{
    exerciseId: string;
    sets: number;
    unit: ExerciseUnit;
    reps: string;
    weight?: number;
    restTime?: number;
    notes?: string;
    group?: string;
    order: number;
  }>;
  tagIds?: string[];
};
