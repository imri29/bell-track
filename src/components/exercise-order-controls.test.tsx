"use client";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ExerciseOrderControls } from "@/components/exercise-order-controls";

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe("ExerciseOrderControls", () => {
  it("disables controls when requested", async () => {
    const user = userEvent.setup();
    const onMoveUp = vi.fn();
    const onMoveDown = vi.fn();

    render(
      <ExerciseOrderControls
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        disableUp
        disableDown={false}
      />,
    );

    const moveUpButton = screen.getByLabelText(/move exercise up/i);
    const moveDownButton = screen.getByLabelText(/move exercise down/i);

    expect(moveUpButton).toBeDisabled();
    expect(moveDownButton).not.toBeDisabled();

    await user.click(moveUpButton);
    await user.click(moveDownButton);

    expect(onMoveUp).not.toHaveBeenCalled();
    expect(onMoveDown).toHaveBeenCalledTimes(1);
  });

  it("renders children and fires actions", async () => {
    const user = userEvent.setup();
    const onMoveUp = vi.fn();
    const onMoveDown = vi.fn();

    render(
      <ExerciseOrderControls onMoveUp={onMoveUp} onMoveDown={onMoveDown}>
        <span>Extra control</span>
      </ExerciseOrderControls>,
    );

    expect(screen.getByText("Extra control")).toBeInTheDocument();

    await user.click(screen.getByLabelText(/move exercise up/i));
    await user.click(screen.getByLabelText(/move exercise down/i));

    expect(onMoveUp).toHaveBeenCalledTimes(1);
    expect(onMoveDown).toHaveBeenCalledTimes(1);
  });
});
