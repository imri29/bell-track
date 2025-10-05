interface ExerciseLike {
  id: string;
  type: string;
}

export interface ExerciseFormDefaults {
  exerciseId: string;
  sets: number;
  reps: string;
  weight: number;
  restTime?: number;
  notes: string;
  group: string;
  order: number;
}

export const buildExerciseFormDefaults = (
  exercise: ExerciseLike,
  order: number,
): ExerciseFormDefaults => ({
  exerciseId: exercise.id,
  sets: 5,
  reps: exercise.type === "COMPLEX" ? "1" : "12",
  weight: 16,
  restTime: exercise.type === "COMPLEX" ? 90 : 60,
  notes: "",
  group: "",
  order,
});
