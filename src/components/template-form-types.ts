import type { ExerciseUnit } from "@/types";

export type TemplateExerciseFormData = {
  exerciseId: string;
  sets: number;
  unit: ExerciseUnit;
  reps: string;
  weight?: number;
  restTime?: number;
  notes?: string;
  group?: string;
  order: number;
  sectionTitle?: string;
};

export type TemplateFormData = {
  name: string;
  description?: string;
  exercises: TemplateExerciseFormData[];
  tagIds: string[];
};
