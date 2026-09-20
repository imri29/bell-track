import type { ExerciseType, LegBias, MovementGroup, MovementPlane } from "@prisma/client";
import type { DraftExercise } from "./workout-draft-feedback";
import type { MovementPattern, WorkoutHistorySummary } from "./workout-history-analysis";
import { getMovementPattern } from "./workout-history-analysis";

export type SuggestionExercise = DraftExercise & { type: ExerciseType };

export type ExerciseSuggestion = {
  exerciseId: string;
  name: string;
  reason: string;
  replaceExerciseId?: string;
};

export type SuggestionOptions = {
  avoidVerticalPush?: boolean;
};

const groupLabels: Record<MovementGroup, string> = {
  PUSH: "push",
  PULL: "pull",
  CORE: "core",
  LEGS: "legs",
};

const patternGroup = (pattern: MovementPattern): MovementGroup => {
  if (pattern.startsWith("PUSH")) return "PUSH";
  if (pattern.startsWith("PULL")) return "PULL";
  if (pattern === "CORE") return "CORE";
  return "LEGS";
};

export function getExerciseSuggestions(
  draft: readonly DraftExercise[],
  candidates: readonly SuggestionExercise[],
  history: WorkoutHistorySummary,
  limit = 3,
  options: SuggestionOptions = {},
): ExerciseSuggestion[] {
  const draftIds = new Set(draft.map((exercise) => exercise.id));
  const draftGroups = new Set(
    draft
      .map((exercise) => getMovementPattern(exercise))
      .filter((pattern): pattern is MovementPattern => pattern !== null)
      .map(patternGroup),
  );
  const recentGroups = new Set(
    (Object.entries(history.windows.last7Days.counts) as [MovementPattern, number][])
      .filter(([, count]) => count > 0)
      .map(([pattern]) => patternGroup(pattern)),
  );

  return candidates
    .filter((candidate) => {
      if (candidate.type !== "EXERCISE" || draftIds.has(candidate.id)) return false;
      return !(
        options.avoidVerticalPush &&
        candidate.movementGroup === "PUSH" &&
        candidate.movementPlane === "VERTICAL"
      );
    })
    .map((candidate) => {
      const pattern = getMovementPattern(candidate);
      const group = pattern ? patternGroup(pattern) : null;
      const frequency = history.windows.last14Days.exercises.find(
        (item) => item.exerciseId === candidate.id,
      );
      const addsMissingGroup = group !== null && !recentGroups.has(group);
      const complementsDraft = group !== null && !draftGroups.has(group);
      const score =
        (addsMissingGroup ? 5 : 0) +
        (complementsDraft ? 3 : 0) +
        (frequency ? 0 : 2) -
        (frequency?.count ?? 0);
      const reason = addsMissingGroup
        ? `Adds ${groupLabels[group]} work missing from your last 7 days.`
        : frequency
          ? "Keeps your exercise selection varied."
          : `Adds a ${group ? groupLabels[group] : "classified"} option you have not used recently.`;

      const replaceExercise = group
        ? draft.find((exercise) => {
            const draftPattern = getMovementPattern(exercise);
            return draftPattern ? patternGroup(draftPattern) === group : false;
          })
        : undefined;
      return { candidate, score, reason, replaceExerciseId: replaceExercise?.id };
    })
    .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name))
    .slice(0, limit)
    .map(({ candidate, reason, replaceExerciseId }) => ({
      exerciseId: candidate.id,
      name: candidate.name,
      reason,
      ...(replaceExerciseId ? { replaceExerciseId } : {}),
    }));
}

export type SuggestionMetadata = {
  id: string;
  name: string;
  type: ExerciseType;
  movementGroup: MovementGroup | null;
  movementPlane: MovementPlane | null;
  legBias: LegBias | null;
};
