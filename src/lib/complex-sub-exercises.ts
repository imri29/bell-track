export type ComplexSubExercise = {
  exerciseName: string;
  reps: number;
};

export function parseComplexSubExercises(
  subExercises: ComplexSubExercise[] | string | null | undefined,
): ComplexSubExercise[] {
  if (Array.isArray(subExercises)) {
    return subExercises;
  }

  if (typeof subExercises !== "string") {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(subExercises);
    return Array.isArray(parsed) ? (parsed as ComplexSubExercise[]) : [];
  } catch {
    return [];
  }
}
