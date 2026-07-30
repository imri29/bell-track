import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { ComplexExerciseBuilder, type ComplexExerciseFormValues } from "./complex-exercise-builder";

vi.mock("@/components/exercise-combobox", () => ({
  ExerciseCombobox: ({ onValueChange }: { onValueChange: (value: string) => void }) => (
    <button type="button" onClick={() => onValueChange("lunge")}>
      Add lunge
    </button>
  ),
}));

function ComplexExerciseBuilderHarness() {
  const { control, register } = useForm<ComplexExerciseFormValues>({
    defaultValues: {
      name: "",
      description: "",
      subExercises: [],
    },
  });

  return (
    <ComplexExerciseBuilder
      control={control}
      register={register}
      exercises={[{ id: "lunge", name: "Lunge", type: "EXERCISE" }]}
    />
  );
}

describe("ComplexExerciseBuilder", () => {
  it("allows the same exercise to appear more than once in a complex", async () => {
    const user = userEvent.setup();
    render(<ComplexExerciseBuilderHarness />);

    await user.click(screen.getByRole("button", { name: "Add lunge" }));
    await user.click(screen.getByRole("button", { name: "Add lunge" }));

    expect(screen.getAllByText("Lunge")).toHaveLength(2);
    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getByText("2.")).toBeInTheDocument();
  });
});
