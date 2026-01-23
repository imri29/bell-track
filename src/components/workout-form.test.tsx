"use client";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WorkoutForm } from "@/components/workout-form";

const appendMock = vi.fn();

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: (cb: () => void) => () => cb(),
    control: {},
    setValue: vi.fn(),
    getValues: () => ({ exercises: [] }),
    watch: () => [],
    reset: vi.fn(),
    formState: { errors: {} },
  }),
  useFieldArray: () => ({
    fields: [],
    append: appendMock,
    remove: vi.fn(),
    update: vi.fn(),
    move: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-is-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/trpc/react", () => ({
  api: {
    exercise: {
      getAll: {
        useQuery: () => ({ data: [], isPending: false }),
      },
    },
    template: {
      getTags: {
        useQuery: () => ({ data: [], isPending: false, error: undefined }),
      },
    },
  },
}));

vi.mock("@/components/add-exercise-modal", () => ({
  AddExerciseModal: ({
    isOpen,
    onExerciseCreated,
  }: {
    isOpen: boolean;
    onExerciseCreated?: (exercise: { id: string; name: string; type: string }) => void;
  }) =>
    isOpen ? (
      <button
        type="button"
        onClick={() => onExerciseCreated?.({ id: "ex-new", name: "New", type: "EXERCISE" })}
      >
        Save Exercise
      </button>
    ) : null,
  AddComplexExerciseModal: () => null,
}));

vi.mock("@/components/exercise-combobox", () => ({
  ExerciseCombobox: ({
    onCreateNewExercise,
  }: {
    onCreateNewExercise?: () => void;
    onValueChange: (id: string) => void;
    id?: string;
  }) => (
    <button type="button" onClick={onCreateNewExercise}>
      Create Exercise
    </button>
  ),
}));

vi.mock("@/components/complex-combobox", () => ({
  ComplexCombobox: () => null,
}));

describe("WorkoutForm", () => {
  it("adds a newly created exercise immediately", async () => {
    render(
      <WorkoutForm
        initialValues={{
          date: "2024-11-01",
          duration: undefined,
          notes: "",
          exercises: [],
          tagIds: [],
        }}
        onSubmit={vi.fn()}
        submitLabel="Save"
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /create exercise/i }));
    await userEvent.click(screen.getByRole("button", { name: /save exercise/i }));

    expect(appendMock).toHaveBeenCalledWith({
      exerciseId: "ex-new",
      sets: 5,
      unit: "REPS",
      reps: "12",
      weight: 16,
      restTime: 60,
      notes: "",
      group: "",
      order: 0,
    });
  });
});
