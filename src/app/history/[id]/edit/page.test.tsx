"use client";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RouterOutputs } from "@/server/api/root";
import {
  getRouterMock,
  resetNextMocks,
  setParamsMock,
} from "@/tests/mocks/next";
import EditWorkoutPage from "./page";

type WorkoutDetail = NonNullable<RouterOutputs["workout"]["getById"]>;

vi.mock("@/components/workout-form", () => ({
  WorkoutForm: ({
    onSubmit,
    onCancel,
    submitLabel,
  }: {
    onSubmit: (data: unknown) => void;
    onCancel: () => void;
    submitLabel: string;
  }) => (
    <div>
      <button type="button" onClick={() => onSubmit({ payload: true })}>
        {submitLabel}
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

const mockWorkoutQuery = vi.fn();
const mockWorkoutUpdate = vi.fn();
const mockInvalidateAll = vi.fn();
const mockInvalidateById = vi.fn();

vi.mock("@/trpc/react", () => ({
  api: {
    useUtils: () => ({
      workout: {
        getAll: { invalidate: mockInvalidateAll },
        getById: { invalidate: mockInvalidateById },
      },
    }),
    workout: {
      getById: {
        useQuery: (...args: unknown[]) => mockWorkoutQuery(...args),
      },
      update: {
        useMutation: (opts?: { onSuccess?: () => void }) => ({
          mutate: (input: unknown) => {
            mockWorkoutUpdate(input);
            opts?.onSuccess?.();
          },
          isPending: false,
        }),
      },
    },
  },
}));

const workoutFixture: WorkoutDetail = {
  id: "w1",
  date: "2024-11-01T12:00:00.000Z",
  duration: 40,
  notes: "note",
  createdAt: "2024-11-01T12:00:00.000Z",
  updatedAt: "2024-11-01T12:00:00.000Z",
  exercises: [
    {
      id: "we1",
      exerciseId: "ex1",
      sets: 3,
      reps: "12",
      weight: 24,
      restTime: 60,
      notes: "notes",
      group: "A",
      order: 1,
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
};

afterEach(() => {
  resetNextMocks();
  vi.clearAllMocks();
});

beforeEach(() => {
  setParamsMock({ id: "w1" });
});

describe("EditWorkoutPage", () => {
  it("renders form when workout data is loaded and saves changes", async () => {
    mockWorkoutQuery.mockReturnValue({
      data: workoutFixture,
      isPending: false,
      error: undefined,
    });

    render(<EditWorkoutPage />);

    expect(
      screen.getByRole("heading", { name: /edit workout/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/save changes/i)).toBeInTheDocument();

    await userEvent.click(screen.getByText(/save changes/i));

    await waitFor(() => {
      expect(mockWorkoutUpdate).toHaveBeenCalledWith({
        id: "w1",
        payload: true,
      });
      expect(mockInvalidateAll).toHaveBeenCalled();
      expect(mockInvalidateById).toHaveBeenCalledWith({ id: "w1" });
      expect(getRouterMock().push).toHaveBeenCalledWith("/history?view=list");
      expect(getRouterMock().refresh).toHaveBeenCalled();
    });
  });

  it("shows fallback when workout is missing", () => {
    mockWorkoutQuery.mockReturnValue({
      data: null,
      isPending: false,
      error: undefined,
    });

    render(<EditWorkoutPage />);

    expect(screen.getByText(/couldn't find that workout/i)).toBeInTheDocument();
  });
});
