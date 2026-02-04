"use client";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getRouterMock, resetNextMocks } from "@/tests/mocks/next";
import { NewWorkoutClient } from "./new-workout-client";

const mockTemplateQuery = vi.fn();
vi.mock("@/trpc/react", () => ({
  api: {
    template: {
      getById: {
        useQuery: (...args: unknown[]) => mockTemplateQuery(...args),
      },
    },
  },
}));

vi.mock("@/components/add-workout-form", () => ({
  AddWorkoutForm: ({ onCancel, onSuccess }: { onCancel?: () => void; onSuccess?: () => void }) => (
    <div>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <button type="button" onClick={onSuccess}>
        Submit
      </button>
    </div>
  ),
}));

vi.mock("@/components/template-combobox", () => ({
  TemplateCombobox: ({ onValueChange }: { onValueChange: (value: string) => void }) => (
    <button type="button" onClick={() => onValueChange("tpl-choose")}>
      Pick template
    </button>
  ),
}));

afterEach(() => {
  resetNextMocks();
  vi.clearAllMocks();
});

describe("NewWorkoutClient", () => {
  it("shows back link and renders form without template", () => {
    mockTemplateQuery.mockReturnValue({
      data: undefined,
      isPending: false,
      error: undefined,
    });

    render(<NewWorkoutClient />);

    expect(screen.getByText(/log workout/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to history/i })).toHaveAttribute(
      "href",
      "/history?view=list",
    );
  });

  it("passes template data to the form when template is loaded", () => {
    mockTemplateQuery.mockReturnValue({
      data: {
        id: "tpl1",
        name: "Template",
        exercises: [
          {
            exerciseId: "ex1",
            sets: 3,
            unit: "REPS",
            reps: "10",
            weight: 24,
            restTime: 60,
            notes: "notes",
            group: "A",
            order: 1,
          },
        ],
        tags: [{ id: "tag1" }],
      },
      isPending: false,
      error: undefined,
    });

    render(<NewWorkoutClient templateId="tpl1" />);

    expect(mockTemplateQuery).toHaveBeenCalledWith(
      { id: "tpl1" },
      expect.objectContaining({ enabled: true }),
    );
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("navigates back to history on cancel or success", async () => {
    mockTemplateQuery.mockReturnValue({
      data: undefined,
      isPending: false,
      error: undefined,
    });

    render(<NewWorkoutClient />);

    await userEvent.click(screen.getByText("Cancel"));
    expect(getRouterMock().push).toHaveBeenCalledWith("/history?view=list");

    await userEvent.click(screen.getByText("Submit"));
    expect(getRouterMock().push).toHaveBeenCalledTimes(2);
    expect(getRouterMock().refresh).toHaveBeenCalled();
  });

  it("navigates to new workout with template when selected", async () => {
    mockTemplateQuery.mockReturnValue({
      data: undefined,
      isPending: false,
      error: undefined,
    });

    render(<NewWorkoutClient date="2026-02-01" />);

    await userEvent.click(screen.getByText("Pick template"));

    expect(getRouterMock().push).toHaveBeenCalledWith(
      "/history/new?date=2026-02-01&templateId=tpl-choose",
    );
  });
});
