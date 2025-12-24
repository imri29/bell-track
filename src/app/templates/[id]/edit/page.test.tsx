"use client";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getRouterMock,
  resetNextMocks,
  setParamsMock,
} from "@/tests/mocks/next";

import EditTemplatePage from "./page";

const mockUpdateTemplate = vi.fn();
const mockInvalidateTemplates = vi.fn();
const mockInvalidateTemplate = vi.fn();
const mockExercisesQuery = vi.fn();
const mockTagsQuery = vi.fn();
const mockTemplateQuery = vi.fn();

const resetMock = vi.fn();
const handleSubmitMock = vi.fn((cb) =>
  cb({
    name: "Updated",
    description: "Desc",
    exercises: [
      {
        exerciseId: "ex1",
        sets: 4,
        unit: "REPS",
        reps: "10",
        weight: 20,
        restTime: 45,
        notes: "",
        group: "",
        order: 3,
      },
    ],
    tagIds: ["tag1"],
  }),
);

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    use: <T,>(promise: Promise<T>) => ({
      id: "tpl1",
      ...(typeof promise === "object" ? promise : {}),
    }),
  };
});

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: (cb: () => void) => () => handleSubmitMock(cb),
    control: {},
    reset: resetMock,
    setValue: vi.fn(),
    watch: () => ["tag1"],
    formState: { errors: {} },
  }),
  Controller: ({
    render,
  }: {
    render: (props: { field: unknown }) => unknown;
  }) => render({ field: { value: "REPS", onChange: vi.fn() } }),
  useFieldArray: () => ({
    fields: [],
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
  ComplexNameTooltip: ({ children }: { children: ReactNode }) => (
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
      template: {
        getAll: { invalidate: mockInvalidateTemplates },
        getById: { invalidate: mockInvalidateTemplate },
      },
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
      getById: {
        useQuery: (...args: unknown[]) => mockTemplateQuery(...args),
      },
      update: {
        useMutation: (opts?: { onSuccess?: () => void }) => ({
          mutate: (input: unknown) => {
            mockUpdateTemplate(input);
            opts?.onSuccess?.();
          },
          isPending: false,
        }),
      },
    },
  },
}));

beforeEach(() => {
  setParamsMock({ id: "tpl1" });
});

afterEach(() => {
  resetNextMocks();
  vi.clearAllMocks();
});

describe("EditTemplatePage", () => {
  it("renders template data and updates on submit", async () => {
    mockExercisesQuery.mockReturnValue({ data: [], isPending: false });
    mockTagsQuery.mockReturnValue({
      data: [{ id: "tag1", name: "Strength", slug: "strength" }],
      isPending: false,
      error: undefined,
    });
    mockTemplateQuery.mockReturnValue({
      data: {
        id: "tpl1",
        name: "Template",
        description: "Desc",
        createdAt: "2024-10-01T12:00:00.000Z",
        updatedAt: "2024-10-01T12:00:00.000Z",
        exercises: [
          {
            id: "te1",
            exerciseId: "ex1",
            sets: 3,
            unit: "REPS",
            reps: "8",
            weight: 16,
            restTime: 60,
            notes: "",
            group: "",
            order: 0,
            exercise: {
              id: "ex1",
              name: "Swing",
              type: "EXERCISE",
              subExercises: "[]",
              description: null,
            },
          },
        ],
        tags: [
          {
            id: "tag1",
            name: "Strength",
            slug: "strength",
            description: null,
            createdAt: "2024-10-01T12:00:00.000Z",
            updatedAt: "2024-10-02T12:00:00.000Z",
            assignedAt: "2024-10-03T12:00:00.000Z",
          },
        ],
      },
      isPending: false,
      error: undefined,
    });

    render(<EditTemplatePage params={Promise.resolve({ id: "tpl1" })} />);

    expect(
      screen.getByRole("heading", { name: /edit template/i }),
    ).toBeInTheDocument();
    expect(resetMock).toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateTemplate).toHaveBeenCalledWith({
        id: "tpl1",
        name: "Updated",
        description: "Desc",
        exercises: [
          {
            exerciseId: "ex1",
            sets: 4,
            unit: "REPS",
            reps: "10",
            weight: 20,
            restTime: 45,
            notes: "",
            group: "",
            order: 0,
          },
        ],
        tagIds: ["tag1"],
      });
      expect(mockInvalidateTemplates).toHaveBeenCalled();
      expect(mockInvalidateTemplate).toHaveBeenCalledWith({ id: "tpl1" });
      expect(getRouterMock().push).toHaveBeenCalledWith("/templates");
    });
  });
});
