import { describe, expect, it } from "vitest";
import {
  analyzeWorkoutHistory,
  getMovementPattern,
  type HistoryAnalysisWorkout,
} from "./workout-history-analysis";

const exercise = (overrides: Partial<HistoryAnalysisWorkout["exercises"][number]> = {}) => ({
  id: "swing",
  name: "Swing",
  movementGroup: "LEGS" as const,
  movementPlane: null,
  legBias: "HAMSTRING_DOMINANT" as const,
  ...overrides,
});

const workout = (id: string, date: string, exercises: HistoryAnalysisWorkout["exercises"]) => ({
  id,
  date: new Date(date),
  exercises,
});

describe("workout history analysis", () => {
  it("maps available metadata to stable patterns", () => {
    expect(
      getMovementPattern(
        exercise({ movementGroup: "PUSH", movementPlane: "VERTICAL", legBias: null }),
      ),
    ).toBe("PUSH_VERTICAL");
    expect(
      getMovementPattern(
        exercise({ movementGroup: "PULL", movementPlane: "HORIZONTAL", legBias: null }),
      ),
    ).toBe("PULL_HORIZONTAL");
    expect(
      getMovementPattern(exercise({ movementGroup: "LEGS", movementPlane: null, legBias: null })),
    ).toBe("LEGS_UNKNOWN");
    expect(
      getMovementPattern(exercise({ movementGroup: null, movementPlane: null, legBias: null })),
    ).toBeNull();
  });

  it("calculates recency and frequency across rolling windows", () => {
    const asOf = new Date("2026-09-11T12:00:00.000Z");
    const workouts = [
      workout("w1", "2026-09-10T12:00:00.000Z", [
        exercise(),
        exercise({
          id: "push-ups",
          name: "Push ups",
          movementGroup: "PUSH",
          movementPlane: "HORIZONTAL",
          legBias: null,
        }),
      ]),
      workout("w2", "2026-09-05T12:00:00.000Z", [
        exercise({
          id: "row",
          name: "Row",
          movementGroup: "PULL",
          movementPlane: "HORIZONTAL",
          legBias: null,
        }),
      ]),
      workout("w3", "2026-08-20T12:00:00.000Z", [
        exercise({
          id: "push-ups",
          name: "Push ups",
          movementGroup: "PUSH",
          movementPlane: "HORIZONTAL",
          legBias: null,
        }),
      ]),
    ];

    const result = analyzeWorkoutHistory(workouts, asOf);

    expect(result.lastWorkout?.id).toBe("w1");
    expect(result.lastWorkout?.patterns).toEqual(["LEGS_HAMSTRING_DOMINANT", "PUSH_HORIZONTAL"]);
    expect(result.windows.last7Days.workoutCount).toBe(2);
    expect(result.windows.last7Days.counts.PUSH_HORIZONTAL).toBe(1);
    expect(result.windows.last14Days.exercises).toEqual([
      {
        exerciseId: "push-ups",
        name: "Push ups",
        count: 1,
        lastUsedAt: new Date("2026-09-10T12:00:00.000Z"),
      },
      {
        exerciseId: "row",
        name: "Row",
        count: 1,
        lastUsedAt: new Date("2026-09-05T12:00:00.000Z"),
      },
      {
        exerciseId: "swing",
        name: "Swing",
        count: 1,
        lastUsedAt: new Date("2026-09-10T12:00:00.000Z"),
      },
    ]);
    expect(result.daysSincePattern.PULL_HORIZONTAL).toBe(6);
    expect(result.daysSincePattern.CORE).toBeNull();
  });

  it("returns safe empty results", () => {
    const result = analyzeWorkoutHistory([], new Date("2026-09-11T12:00:00.000Z"));

    expect(result.lastWorkout).toBeNull();
    expect(result.windows.last7Days.workoutCount).toBe(0);
    expect(result.windows.last14Days.exercises).toEqual([]);
    expect(Object.values(result.daysSincePattern).every((value) => value === null)).toBe(true);
  });
});
