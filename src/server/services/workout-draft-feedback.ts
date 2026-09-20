import type { MovementGroup, MovementPlane } from "@prisma/client";
import type { MovementPattern, WorkoutHistorySummary } from "./workout-history-analysis";
import { getMovementPattern } from "./workout-history-analysis";

export type DraftFeedbackItem = {
  code: string;
  message: string;
};

export type DraftFeedback = {
  errors: DraftFeedbackItem[];
  warnings: DraftFeedbackItem[];
  hints: DraftFeedbackItem[];
};

export type DraftExercise = {
  id: string;
  name: string;
  movementGroup: MovementGroup | null;
  movementPlane: MovementPlane | null;
  legBias: "QUAD_DOMINANT" | "HAMSTRING_DOMINANT" | null;
};

const majorGroups: ReadonlyArray<MovementGroup> = ["PUSH", "PULL", "CORE", "LEGS"];

const groupForPattern = (pattern: MovementPattern): MovementGroup => {
  if (pattern.startsWith("PUSH")) return "PUSH";
  if (pattern.startsWith("PULL")) return "PULL";
  if (pattern === "CORE") return "CORE";
  return "LEGS";
};

const patternsForDraft = (draft: readonly DraftExercise[]) =>
  new Set(
    draft.map(getMovementPattern).filter((pattern): pattern is MovementPattern => pattern !== null),
  );

export function getWorkoutDraftFeedback(
  draft: readonly DraftExercise[],
  history: WorkoutHistorySummary,
  neglectedDays = 21,
): DraftFeedback {
  const errors: DraftFeedbackItem[] = [];
  const warnings: DraftFeedbackItem[] = [];
  const hints: DraftFeedbackItem[] = [];
  const patterns = patternsForDraft(draft);

  if (draft.length === 0) {
    errors.push({
      code: "EMPTY_WORKOUT",
      message: "Add at least one exercise to save this workout.",
    });
    return { errors, warnings, hints };
  }

  for (const pattern of patterns) {
    if (!history.lastWorkout?.patterns.includes(pattern)) continue;
    if (pattern.startsWith("PUSH_")) {
      warnings.push({
        code: "REPEATED_PUSH_PLANE",
        message: `This draft repeats ${pattern.replace("PUSH_", "").toLowerCase()} push work from your last workout.`,
      });
    }
    if (pattern.startsWith("PULL_")) {
      warnings.push({
        code: "REPEATED_PULL_PLANE",
        message: `This draft repeats ${pattern.replace("PULL_", "").toLowerCase()} pull work from your last workout.`,
      });
    }
  }

  const recentPatterns = history.windows.last7Days.counts;
  for (const group of majorGroups) {
    const hasRecentGroup = Object.entries(recentPatterns).some(
      ([pattern, count]) => count > 0 && groupForPattern(pattern as MovementPattern) === group,
    );
    if (!hasRecentGroup) {
      hints.push({
        code: `MISSING_${group}_RECENT`,
        message: `No ${group.toLowerCase()} work appears in your last 7 days.`,
      });
    }
  }

  for (const exercise of draft) {
    const frequency = history.windows.last14Days.exercises.find(
      (item) => item.exerciseId === exercise.id,
    );
    if (frequency && frequency.count >= 3) {
      hints.push({
        code: "REPEATED_EXERCISE",
        message: `${exercise.name} appeared ${frequency.count} times in your last 14 days; consider changing the variation.`,
      });
    }

    const daysSince = history.daysSinceExercise[exercise.id];
    if (daysSince !== undefined && daysSince !== null && daysSince > neglectedDays) {
      hints.push({
        code: "NEGLECTED_EXERCISE",
        message: `${exercise.name} has not appeared in a workout for ${daysSince} days.`,
      });
    }
  }

  return { errors, warnings, hints };
}
