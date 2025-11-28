"use client";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRouterMock, resetNextMocks } from "@/tests/mocks/next";

import NewTemplatePage from "./page";

const mockCreateTemplate = vi.fn();
const mockInvalidateTemplates = vi.fn();
const mockExercisesQuery = vi.fn();
const mockTagsQuery = vi.fn();

const formData = {
  name: "Power Day",
  description: "",
  exercises: [
    {
      exerciseId: "ex1",
      sets: 3,
      reps: "8",
      weight: 24,
      restTime: undefined,
      notes: "",
      group: "A",
      order: 5,
    },
  ],
  tagIds: ["tag1"],
};

const handleSubmitMock = vi.fn((cb) => () => cb(formData));
const registerMock = vi.fn();
const setValueMock = vi.fn();

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    register: registerMock,
    handleSubmit: handleSubmitMock,
    control: {},
    setValue: setValueMock,
    watch: () => formData.tagIds,
    formState: { errors: {} },
  }),
  useFieldArray: () => ({
    fields: formData.exercises,
    append: vi.fn(),
    remove: vi.fn(),
    move: vi.fn(),
  }),
}));

vi.mock("@/components/add-exercise-modal", () => ({
  AddExerciseModal: () => null,
  AddComplexExerciseModal: () => null,
}));

vi.mock("@/components/complex-name-tooltip", () => ({
  ComplexNameTooltip: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/components/complex-select", () => ({
  ComplexSelect: ({
    onSelect,
  }: {
    onSelect: (id: string) => void;
    id?: string;
  }) => (
    <button type="button" onClick={() => onSelect("ex1")}>
      Select Complex
    </button>
  ),
}));

vi.mock("@/components/exercise-select", () => ({
  ExerciseSelect: ({
    onSelect,
  }: {
    onSelect: (id: string) => void;
    id?: string;
  }) => (
    <button type="button" onClick={() => onSelect("ex1")}>
      Select Exercise
    </button>
  ),
}));

vi.mock("@/components/exercise-order-controls", () => ({
  ExerciseOrderControls: () => <div>OrderControls</div>,
}));

vi.mock("@/trpc/react", () => ({
  api: {
    useUtils: () => ({
      template: { getAll: { invalidate: mockInvalidateTemplates } },
    }),
    exercise: {
      getAll: {
        useQuery: (...args: unknown[]) => mockExercisesQuery(...args),
      },
    },
    template: {
      getTags: {
        useQuery: (...args: unknown[]) => mockTagsQuery(...args),
      },
      create: {
        useMutation: (opts?: { onSuccess?: () => void }) => ({
          mutate: (input: unknown) => {
            mockCreateTemplate(input);
            opts?.onSuccess?.();
          },
          isPending: false,
        }),
      },
    },
  },
}));

afterEach(() => {
  resetNextMocks();
  vi.clearAllMocks();
});

describe("NewTemplatePage", () => {
  it("submits template data and navigates back on success", async () => {
    mockExercisesQuery.mockReturnValue({ data: [], isPending: false });
    mockTagsQuery.mockReturnValue({
      data: [{ id: "tag1", name: "Strength", slug: "strength" }],
      isPending: false,
      error: undefined,
    });

    render(<NewTemplatePage />);

    expect(
      screen.getByRole("heading", { name: /create new template/i }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /create template/i }),
    );

    expect(handleSubmitMock).toHaveBeenCalled();
    expect(mockCreateTemplate).toHaveBeenCalledWith({
      name: "Power Day",
      description: undefined,
      exercises: [
        {
          exerciseId: "ex1",
          sets: 3,
          reps: "8",
          weight: 24,
          restTime: undefined,
          notes: "",
          group: "A",
          order: 0,
        },
      ],
      tagIds: ["tag1"],
    });
    expect(mockInvalidateTemplates).toHaveBeenCalled();
    expect(getRouterMock().push).toHaveBeenCalledWith("/templates");
  });
});
