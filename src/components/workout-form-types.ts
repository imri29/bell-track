import type { ExerciseUnit } from "@/types";

export type WorkoutExerciseFormValues = {
  exerciseId: string;
  sets: number;
  unit: ExerciseUnit;
  reps: string;
  weight: number;
  restTime?: number;
  notes?: string;
  group?: string;
  order: number;
  sectionTitle?: string;
};

export type WorkoutFormValues = {
  date: string;
  duration?: number;
  notes?: string;
  exercises: WorkoutExerciseFormValues[];
  tagIds: string[];
};

export type WorkoutFormSubmitExercise = Omit<WorkoutExerciseFormValues, "order" | "restTime"> & {
  restTime?: number;
  order: number;
};

export type WorkoutFormSubmitData = {
  date: string;
  duration?: number;
  notes?: string;
  exercises: WorkoutFormSubmitExercise[];
  tagIds: string[];
};
