"use client";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ComplexSubstitutionPicker } from "./complex-substitution-picker";

vi.mock("@/hooks/use-is-mobile", () => ({
  useIsMobile: () => false,
}));

const complexes = [
  {
    id: "current",
    name: "Armor Building",
    subExercises: [
      { exerciseName: "Clean", reps: 2 },
      { exerciseName: "Press", reps: 1 },
    ],
  },
  {
    id: "alternative",
    name: "King Kong",
    subExercises: [
      { exerciseName: "Gorilla Row", reps: 5 },
      { exerciseName: "Squat Clean", reps: 5 },
    ],
  },
];

describe("ComplexSubstitutionPicker", () => {
  it("shows every other complex with its breakdown and selects one", async () => {
    const onSelect = vi.fn();

    render(
      <ComplexSubstitutionPicker
        currentComplex={complexes[0]}
        originalComplexId="current"
        complexes={complexes}
        onSelect={onSelect}
        onReset={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByLabelText("Find a substitute for Armor Building"));

    expect(
      within(screen.getByRole("dialog")).queryByRole("button", { name: /armor building/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /king kong/i })).toHaveTextContent(
      "5 Gorilla Row · 5 Squat Clean",
    );

    await userEvent.click(screen.getByRole("button", { name: /king kong/i }));

    expect(onSelect).toHaveBeenCalledWith("alternative");
  });
});
