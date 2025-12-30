"use client";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { confirmMock, resetConfirmMock } from "@/tests/mocks/confirm";
import { resetNextMocks } from "@/tests/mocks/next";

import { HistoryPageClient, type WorkoutWithExercises } from "./history-page-client";

const mockInvalidateWorkouts = vi.fn();
const mockDelete = vi.fn();
const mockWorkoutQuery = vi.fn();
const mockTemplateQuery = vi.fn();

vi.mock("@/trpc/react", () => ({
  api: {
    useUtils: () => ({
      workout: { getAll: { invalidate: mockInvalidateWorkouts } },
      template: { getAll: { invalidate: vi.fn() } },
    }),
    workout: {
      getAll: {
        useQuery: (...args: unknown[]) => mockWorkoutQuery(...args),
      },
      delete: {
        useMutation: (opts?: { onSuccess?: () => void }) => ({
          mutate: (input: unknown) => {
            mockDelete(input);
            opts?.onSuccess?.();
          },
          isPending: false,
        }),
      },
    },
    template: {
      getAll: {
        useQuery: (...args: unknown[]) => mockTemplateQuery(...args),
      },
    },
  },
}));

const workoutFixture: WorkoutWithExercises = {
  id: "w1",
  date: "2024-11-01T12:00:00.000Z",
  duration: 45,
  notes: "Felt strong",
  createdAt: "2024-11-01T12:00:00.000Z",
  updatedAt: "2024-11-01T12:30:00.000Z",
  exercises: [
    {
      id: "we1",
      exerciseId: "ex1",
      sets: 3,
      unit: "REPS",
      reps: "12",
      weight: 24,
      restTime: 60,
      notes: "",
      group: "A",
      order: 1,
      exercise: {
        id: "ex1",
        name: "Kettlebell Swing",
        type: "EXERCISE",
        subExercises: "[]",
        description: null,
      },
    },
  ],
  tags: [
    {
      id: "t1",
      name: "Conditioning",
      slug: "conditioning",
      description: null,
      createdAt: "2024-10-01T12:00:00.000Z",
      updatedAt: "2024-10-01T12:00:00.000Z",
      assignedAt: "2024-11-01T12:00:00.000Z",
    },
  ],
};

const renderHistory = () => {
  render(<HistoryPageClient initialView="list" />);
};

afterEach(() => {
  resetConfirmMock();
  resetNextMocks();
  vi.clearAllMocks();
});

describe("HistoryPageClient", () => {
  it("renders workouts and basic actions", async () => {
    confirmMock.mockResolvedValue(true);
    mockWorkoutQuery.mockReturnValue({
      data: [workoutFixture],
      isPending: false,
      error: undefined,
    });
    mockTemplateQuery.mockReturnValue({
      data: [],
      isPending: false,
      error: undefined,
    });

    renderHistory();

    expect(screen.getByRole("heading", { name: /workout history/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "01/11/2024 • 45 min" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add workout/i })).toBeInTheDocument();

    const deleteButton = screen.getByLabelText(/delete workout from 01\/11\/2024/i);
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalledWith({ id: "w1" });
      expect(mockInvalidateWorkouts).toHaveBeenCalled();
    });
  });

  it("does not delete when the user cancels", async () => {
    confirmMock.mockResolvedValue(false);
    mockWorkoutQuery.mockReturnValue({
      data: [workoutFixture],
      isPending: false,
      error: undefined,
    });
    mockTemplateQuery.mockReturnValue({
      data: [],
      isPending: false,
      error: undefined,
    });

    renderHistory();

    const deleteButton = screen.getByLabelText(/delete workout from 01\/11\/2024/i);
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });
});
