"use client";

import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@/tests/mocks/next";
import { CalendarView } from "@/components/calendar-view";
import type { RouterOutputs } from "@/server/api/root";
import { getRouterMock, resetNextMocks } from "@/tests/mocks/next";

function formatDateLabel(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

vi.mock("@/components/calendar-day-menu", () => ({
  CalendarDayMenu: ({
    children,
    onOpenChange,
    onAddWorkout,
    onAddFromTemplate,
    date,
  }: {
    children: ReactNode;
    onOpenChange: (open: boolean) => void;
    onAddWorkout: () => void;
    onAddFromTemplate: (templateId: string) => void;
    date: Date;
  }) => {
    const label = formatDateLabel(date);
    return (
      <div>
        <button type="button" onClick={() => onOpenChange(true)}>
          Open {label}
        </button>
        <button type="button" onClick={onAddWorkout}>
          Add workout {label}
        </button>
        <button type="button" onClick={() => onAddFromTemplate("template-1")}>
          Add template {label}
        </button>
        {children}
      </div>
    );
  },
}));

vi.mock("@/trpc/react", () => ({
  api: {
    template: {
      getAll: {
        useQuery: () => ({ data: [], isPending: false, error: undefined }),
      },
    },
  },
}));

type WorkoutData = RouterOutputs["workout"]["getAll"][number];

const workouts: WorkoutData[] = [
  {
    id: "w1",
    date: "2024-11-01T12:00:00.000Z",
  } as WorkoutData,
];

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2024, 10, 15, 10, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
  resetNextMocks();
  vi.clearAllMocks();
});

describe("CalendarView", () => {
  it("navigates between months", async () => {
    render(<CalendarView workouts={workouts} />);

    expect(screen.getByRole("heading", { name: "November 2024" })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/go to next month/i));
    expect(screen.getByRole("heading", { name: "December 2024" })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/go to previous month/i));
    expect(screen.getByRole("heading", { name: "November 2024" })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/go to next month/i));
    fireEvent.click(screen.getByRole("button", { name: /today/i }));
    expect(screen.getByRole("heading", { name: "November 2024" })).toBeInTheDocument();
  });

  it("routes to new workout and template flows", async () => {
    const targetDate = new Date(2024, 10, 15, 10, 0, 0);
    const label = formatDateLabel(targetDate);

    render(<CalendarView workouts={workouts} />);

    fireEvent.click(screen.getByRole("button", { name: `Open ${label}` }));
    fireEvent.click(screen.getByRole("button", { name: `Add workout ${label}` }));

    expect(getRouterMock().push).toHaveBeenLastCalledWith(`/history/new?date=${label}`);

    fireEvent.click(screen.getByRole("button", { name: `Open ${label}` }));
    fireEvent.click(screen.getByRole("button", { name: `Add template ${label}` }));

    expect(getRouterMock().push).toHaveBeenLastCalledWith(
      `/history/new?date=${label}&templateId=template-1`,
    );
  });
});
