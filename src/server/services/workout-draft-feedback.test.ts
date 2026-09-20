import { describe, expect, it } from "vitest";
import { analyzeWorkoutHistory } from "./workout-history-analysis";
import { getWorkoutDraftFeedback, type DraftExercise } from "./workout-draft-feedback";

const asOf = new Date("2026-09-11T12:00:00.000Z");
const push: DraftExercise = {
  id: "push-ups",
  name: "Push ups",
  movementGroup: "PUSH",
  movementPlane: "HORIZONTAL",
  legBias: null,
};

const history = analyzeWorkoutHistory(
  [
    { id: "w1", date: new Date("2026-09-10T12:00:00.000Z"), exercises: [push] },
    { id: "w2", date: new Date("2026-09-08T12:00:00.000Z"), exercises: [push] },
    { id: "w3", date: new Date("2026-09-06T12:00:00.000Z"), exercises: [push] },
  ],
  asOf,
);

describe("workout draft feedback", () => {
  it("returns a blocking error only for an empty draft", () => {
    const result = getWorkoutDraftFeedback([], history);

    expect(result.errors).toEqual([
      { code: "EMPTY_WORKOUT", message: "Add at least one exercise to save this workout." },
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("returns explainable non-blocking repetition and coverage feedback", () => {
    const result = getWorkoutDraftFeedback([push], history);

    expect(result.errors).toEqual([]);
    expect(result.warnings[0]?.code).toBe("REPEATED_PUSH_PLANE");
    expect(result.hints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "MISSING_PULL_RECENT" }),
        expect.objectContaining({ code: "MISSING_CORE_RECENT" }),
        expect.objectContaining({ code: "MISSING_LEGS_RECENT" }),
        expect.objectContaining({ code: "REPEATED_EXERCISE" }),
      ]),
    );
  });
});
