import { describe, expect, it } from "vitest";
import { getExerciseSuggestions, type SuggestionExercise } from "./exercise-suggestions";
import { analyzeWorkoutHistory } from "./workout-history-analysis";

const asOf = new Date("2026-09-11T12:00:00.000Z");
const push: SuggestionExercise = {
  id: "push-ups",
  name: "Push ups",
  type: "EXERCISE",
  movementGroup: "PUSH",
  movementPlane: "HORIZONTAL",
  legBias: null,
};

describe("exercise suggestions", () => {
  it("prefers an unused complementary movement group", () => {
    const history = analyzeWorkoutHistory(
      [{ id: "w1", date: new Date("2026-09-10T12:00:00.000Z"), exercises: [push] }],
      asOf,
    );
    const suggestions = getExerciseSuggestions(
      [push],
      [
        push,
        {
          ...push,
          id: "row",
          name: "Single Arm Row",
          movementGroup: "PULL",
          movementPlane: "HORIZONTAL",
        },
        { ...push, id: "press", name: "Strict Press", movementPlane: "VERTICAL" },
      ],
      history,
    );

    expect(suggestions[0]).toEqual({
      exerciseId: "row",
      name: "Single Arm Row",
      reason: "Adds pull work missing from your last 7 days.",
    });
  });

  it("marks same-role suggestions as safe replacements", () => {
    const history = analyzeWorkoutHistory([], asOf);
    const suggestions = getExerciseSuggestions(
      [push],
      [push, { ...push, id: "strict-press", name: "Strict Press", movementPlane: "VERTICAL" }],
      history,
    );

    expect(suggestions[0]?.replaceExerciseId).toBe("push-ups");
  });
});
