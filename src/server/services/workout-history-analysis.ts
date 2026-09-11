import type { LegBias, MovementGroup, MovementPlane } from "@prisma/client";

export const MOVEMENT_PATTERNS = [
  "PUSH_VERTICAL",
  "PUSH_HORIZONTAL",
  "PULL_VERTICAL",
  "PULL_HORIZONTAL",
  "CORE",
  "LEGS_QUAD_DOMINANT",
  "LEGS_HAMSTRING_DOMINANT",
  "LEGS_UNKNOWN",
] as const;

export type MovementPattern = (typeof MOVEMENT_PATTERNS)[number];

export const BODY_REGIONS = [
  "CHEST",
  "SHOULDERS",
  "BACK",
  "QUADS",
  "HAMSTRINGS",
  "GLUTES",
  "FULL_BODY",
] as const;

export type BodyRegion = (typeof BODY_REGIONS)[number];

export type HistoryAnalysisExercise = {
  id: string;
  name: string;
  movementGroup: MovementGroup | null;
  movementPlane: MovementPlane | null;
  legBias: LegBias | null;
  bodyRegions?: readonly BodyRegion[];
};

export type HistoryAnalysisWorkout = {
  id: string;
  date: Date;
  exercises: readonly HistoryAnalysisExercise[];
};

export type PatternSummary = {
  workoutCount: number;
  counts: Record<MovementPattern, number>;
};

export type ExerciseFrequency = {
  exerciseId: string;
  name: string;
  count: number;
  lastUsedAt: Date;
};

export type HistoryWindowSummary = PatternSummary & {
  startDate: Date;
  endDate: Date;
  bodyRegionCounts: Record<BodyRegion, number>;
  exercises: ExerciseFrequency[];
};

export type WorkoutHistorySummary = {
  asOf: Date;
  lastWorkout: {
    id: string;
    date: Date;
    patterns: MovementPattern[];
    exerciseIds: string[];
  } | null;
  windows: {
    last7Days: HistoryWindowSummary;
    last14Days: HistoryWindowSummary;
  };
  daysSincePattern: Record<MovementPattern, number | null>;
  daysSinceExercise: Record<string, number | null>;
};

const createPatternCounts = (): Record<MovementPattern, number> =>
  Object.fromEntries(MOVEMENT_PATTERNS.map((pattern) => [pattern, 0])) as Record<
    MovementPattern,
    number
  >;

const createBodyRegionCounts = (): Record<BodyRegion, number> =>
  Object.fromEntries(BODY_REGIONS.map((region) => [region, 0])) as Record<BodyRegion, number>;

export function getMovementPattern(exercise: HistoryAnalysisExercise): MovementPattern | null {
  if (exercise.movementGroup === "PUSH" && exercise.movementPlane) {
    return `PUSH_${exercise.movementPlane}`;
  }

  if (exercise.movementGroup === "PULL" && exercise.movementPlane) {
    return `PULL_${exercise.movementPlane}`;
  }

  if (exercise.movementGroup === "CORE") {
    return "CORE";
  }

  if (exercise.movementGroup === "LEGS") {
    if (exercise.legBias === "QUAD_DOMINANT") return "LEGS_QUAD_DOMINANT";
    if (exercise.legBias === "HAMSTRING_DOMINANT") return "LEGS_HAMSTRING_DOMINANT";
    return "LEGS_UNKNOWN";
  }

  return null;
}

const daysBetween = (from: Date, to: Date) =>
  Math.max(0, Math.floor((from.getTime() - to.getTime()) / (24 * 60 * 60 * 1000)));

function summarizeWindow(
  workouts: readonly HistoryAnalysisWorkout[],
  asOf: Date,
  days: number,
): HistoryWindowSummary {
  const startDate = new Date(asOf.getTime() - days * 24 * 60 * 60 * 1000);
  const included = workouts.filter((workout) => workout.date >= startDate && workout.date <= asOf);
  const counts = createPatternCounts();
  const bodyRegionCounts = createBodyRegionCounts();
  const exerciseMap = new Map<string, ExerciseFrequency>();

  for (const workout of included) {
    const patterns = new Set<MovementPattern>();

    for (const exercise of workout.exercises) {
      const pattern = getMovementPattern(exercise);
      if (pattern) patterns.add(pattern);

      for (const region of exercise.bodyRegions ?? []) {
        bodyRegionCounts[region] += 1;
      }

      const existing = exerciseMap.get(exercise.id);
      if (existing) {
        existing.count += 1;
        if (exercise.name.localeCompare(existing.name) < 0) existing.name = exercise.name;
        if (workout.date > existing.lastUsedAt) existing.lastUsedAt = workout.date;
      } else {
        exerciseMap.set(exercise.id, {
          exerciseId: exercise.id,
          name: exercise.name,
          count: 1,
          lastUsedAt: workout.date,
        });
      }
    }

    for (const pattern of patterns) counts[pattern] += 1;
  }

  return {
    startDate,
    endDate: asOf,
    workoutCount: included.length,
    counts,
    bodyRegionCounts,
    exercises: [...exerciseMap.values()].sort((a, b) => a.exerciseId.localeCompare(b.exerciseId)),
  };
}

export function analyzeWorkoutHistory(
  workouts: readonly HistoryAnalysisWorkout[],
  asOf: Date,
): WorkoutHistorySummary {
  const orderedWorkouts = [...workouts]
    .filter((workout) => workout.date <= asOf)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  const lastWorkout = orderedWorkouts[0];
  const lastWorkoutPatterns = new Set<MovementPattern>();
  const lastUsedByPattern = new Map<MovementPattern, Date>();
  const lastUsedByExercise = new Map<string, Date>();

  for (const workout of orderedWorkouts) {
    const workoutPatterns = new Set<MovementPattern>();
    for (const exercise of workout.exercises) {
      const pattern = getMovementPattern(exercise);
      if (pattern) workoutPatterns.add(pattern);
      if (!lastUsedByExercise.has(exercise.id)) lastUsedByExercise.set(exercise.id, workout.date);
    }

    if (workout === lastWorkout) {
      for (const pattern of workoutPatterns) lastWorkoutPatterns.add(pattern);
    }
    for (const pattern of workoutPatterns) {
      if (!lastUsedByPattern.has(pattern)) lastUsedByPattern.set(pattern, workout.date);
    }
  }

  const daysSincePattern = createPatternCounts() as Record<MovementPattern, number | null>;
  for (const pattern of MOVEMENT_PATTERNS) {
    const lastUsed = lastUsedByPattern.get(pattern);
    daysSincePattern[pattern] = lastUsed ? daysBetween(asOf, lastUsed) : null;
  }

  const daysSinceExercise: Record<string, number | null> = {};
  for (const [exerciseId, lastUsed] of lastUsedByExercise) {
    daysSinceExercise[exerciseId] = daysBetween(asOf, lastUsed);
  }

  return {
    asOf,
    lastWorkout: lastWorkout
      ? {
          id: lastWorkout.id,
          date: lastWorkout.date,
          patterns: [...lastWorkoutPatterns].sort(),
          exerciseIds: [...new Set(lastWorkout.exercises.map((exercise) => exercise.id))].sort(),
        }
      : null,
    windows: {
      last7Days: summarizeWindow(orderedWorkouts, asOf, 7),
      last14Days: summarizeWindow(orderedWorkouts, asOf, 14),
    },
    daysSincePattern,
    daysSinceExercise,
  };
}
