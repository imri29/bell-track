"use client";

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ExerciseCardData } from "@/components/exercises/exercise-card";
import { confirmMock, resetConfirmMock } from "@/tests/mocks/confirm";
import { EXERCISE_TYPES } from "@/types";
import ExercisesPage from "./page";

vi.mock("@/components/add-exercise-modal", () => ({
  AddExerciseModal: () => null,
  AddComplexExerciseModal: () => null,
  EditExerciseModal: () => null,
}));

const mockInvalidateExercises = vi.fn();
const mockDeleteExercise = vi.fn();
const mockExercisesQuery = vi.fn();

vi.mock("@/trpc/react", () => ({
  api: {
    useUtils: () => ({
      exercise: { getAll: { invalidate: mockInvalidateExercises } },
    }),
    exercise: {
      getAll: {
        useQuery: (...args: unknown[]) => mockExercisesQuery(...args),
      },
      delete: {
        useMutation: (opts?: {
          onMutate?: (input: { id: string }) => void;
          onSuccess?: () => void;
          onSettled?: () => void;
        }) => ({
          mutate: (input: { id: string }) => {
            mockDeleteExercise(input);
            opts?.onMutate?.(input);
            opts?.onSuccess?.();
            opts?.onSettled?.();
          },
        }),
      },
    },
  },
}));

const exerciseFixture: ExerciseCardData = {
  id: "e1",
  name: "Kettlebell Swing",
  type: EXERCISE_TYPES.EXERCISE,
  description: "Hip hinge power",
  createdAt: "2024-10-01T12:00:00.000Z",
  updatedAt: "2024-10-02T12:00:00.000Z",
  subExercises: null,
};

const complexFixture: ExerciseCardData = {
  id: "e2",
  name: "Complex A",
  type: EXERCISE_TYPES.COMPLEX,
  description: "Chain of movements",
  createdAt: "2024-10-05T12:00:00.000Z",
  updatedAt: "2024-10-06T12:00:00.000Z",
  subExercises: [
    { exerciseName: "Clean", reps: 5 },
    { exerciseName: "Press", reps: 5 },
  ],
};

const renderExercisesPage = () => {
  render(<ExercisesPage />);
};

afterEach(() => {
  resetConfirmMock();
  vi.clearAllMocks();
});

describe("ExercisesPage", () => {
  it("lists exercises, filters by type, and deletes after confirmation", async () => {
    confirmMock.mockResolvedValue(true);
    mockExercisesQuery.mockReturnValue({
      data: [exerciseFixture, complexFixture],
      isPending: false,
      error: undefined,
      refetch: vi.fn(),
    });

    renderExercisesPage();

    expect(
      screen.getByRole("heading", { name: /exercise library/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/you have 2 exercises/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add exercise/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /add complex/i })).toBeVisible();

    expect(screen.getByText("Kettlebell Swing")).toBeInTheDocument();
    expect(screen.getByText("Complex A")).toBeInTheDocument();

    const complexesTab = screen.getByRole("tab", { name: /complexes/i });
    await userEvent.click(complexesTab);

    expect(screen.queryByText("Kettlebell Swing")).not.toBeInTheDocument();
    expect(screen.getByText("Complex A")).toBeInTheDocument();

    const complexCard = screen.getByText("Complex A").closest("article");
    const deleteButton = complexCard
      ? within(complexCard).getByLabelText(/delete exercise/i)
      : screen.getAllByLabelText(/delete exercise/i)[0];

    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalled();
      expect(mockDeleteExercise).toHaveBeenCalledWith({ id: "e2" });
      expect(mockInvalidateExercises).toHaveBeenCalled();
    });
  });

  it("shows error and retry when query fails", async () => {
    const refetchMock = vi.fn();
    mockExercisesQuery.mockReturnValue({
      data: undefined,
      isPending: false,
      error: new Error("boom"),
      refetch: refetchMock,
    });

    renderExercisesPage();

    expect(
      screen.getByText(/couldn't load your exercises/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(refetchMock).toHaveBeenCalled();
  });
});
