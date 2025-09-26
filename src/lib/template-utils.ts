import type { RouterOutputs } from "@/server/api/root";
import type { TemplateData } from "@/types";

type TemplateWithExercises = RouterOutputs["template"]["getAll"][number];

/**
 * Converts template data from database format (null values) to form format (undefined values)
 */
export function templateToFormData(
  template: TemplateWithExercises,
): TemplateData {
  return {
    id: template.id,
    name: template.name,
    exercises: template.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight ?? undefined,
      restTime: ex.restTime ?? undefined,
      notes: ex.notes ?? undefined,
      group: ex.group ?? undefined,
      order: ex.order,
    })),
  };
}
