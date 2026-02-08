"use client";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { CalendarDayMenu } from "@/components/calendar-day-menu";
import { useIsMobile } from "@/hooks/use-is-mobile";
import type { RouterOutputs } from "@/server/api/root";

vi.mock("vaul", async () => {
  const React = await import("react");
  const DrawerContext = React.createContext<{ onOpenChange?: (open: boolean) => void } | null>(
    null,
  );

  const Root = ({
    children,
    onOpenChange,
  }: {
    children: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
  }) => <DrawerContext.Provider value={{ onOpenChange }}>{children}</DrawerContext.Provider>;

  const Close = ({
    asChild,
    children,
    onClick,
    ...props
  }: {
    asChild?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
  }) => {
    const ctx = React.useContext(DrawerContext);
    const handleClick = () => {
      onClick?.();
      ctx?.onOpenChange?.(false);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
        onClick: handleClick,
      });
    }

    return (
      <button type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    );
  };

  const Trigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Portal = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Overlay = ({ children, ...props }: { children?: React.ReactNode }) => (
    <div {...props}>{children}</div>
  );
  const Content = ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  );
  const Title = ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  );
  const Description = ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  );

  return {
    Drawer: {
      Root,
      Trigger,
      Portal,
      Close,
      Overlay,
      Content,
      Title,
      Description,
    },
  };
});

vi.mock("@/hooks/use-is-mobile", () => ({
  useIsMobile: vi.fn(),
}));

vi.mock("@/components/complex-name-tooltip", () => ({
  ComplexNameTooltip: ({ name, className }: { name: string; className?: string }) => (
    <span className={className}>{name}</span>
  ),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

type WorkoutData = RouterOutputs["workout"]["getAll"][number];

type TemplateData = RouterOutputs["template"]["getAll"][number];

const sharedDates = {
  createdAt: "2024-10-01T12:00:00.000Z",
  updatedAt: "2024-10-02T12:00:00.000Z",
  assignedAt: "2024-10-03T12:00:00.000Z",
};

const workoutFixture: WorkoutData = {
  id: "w1",
  date: "2024-11-01T12:00:00.000Z",
  duration: 45,
  notes: "Felt strong",
  createdAt: sharedDates.createdAt,
  updatedAt: sharedDates.updatedAt,
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
        name: "Swing",
        type: "EXERCISE",
        subExercises: "[]",
        description: null,
      },
    },
    {
      id: "we2",
      exerciseId: "ex2",
      sets: 4,
      unit: "REPS",
      reps: "8",
      weight: 20,
      restTime: 60,
      notes: "",
      group: "A",
      order: 2,
      exercise: {
        id: "ex2",
        name: "Clean",
        type: "EXERCISE",
        subExercises: "[]",
        description: null,
      },
    },
    {
      id: "we3",
      exerciseId: "ex3",
      sets: 2,
      unit: "TIME",
      reps: "30",
      weight: 0,
      restTime: 45,
      notes: "",
      group: "B",
      sectionTitle: "Finisher",
      order: 3,
      exercise: {
        id: "ex3",
        name: "Snatch",
        type: "EXERCISE",
        subExercises: "[]",
        description: null,
      },
    },
    {
      id: "we4",
      exerciseId: "ex4",
      sets: 3,
      unit: "REPS",
      reps: "10",
      weight: 16,
      restTime: 45,
      notes: "",
      group: "",
      order: 4,
      exercise: {
        id: "ex4",
        name: "Press",
        type: "EXERCISE",
        subExercises: "[]",
        description: null,
      },
    },
    {
      id: "we5",
      exerciseId: "ex5",
      sets: 3,
      unit: "REPS",
      reps: "6",
      weight: 28,
      restTime: 45,
      notes: "",
      group: "",
      order: 5,
      exercise: {
        id: "ex5",
        name: "Row",
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
      createdAt: sharedDates.createdAt,
      updatedAt: sharedDates.updatedAt,
      assignedAt: sharedDates.assignedAt,
    },
  ],
};

const templateFixture: TemplateData = {
  id: "t1",
  name: "Strength Builder",
  description: "Full body template",
  createdAt: sharedDates.createdAt,
  updatedAt: sharedDates.updatedAt,
  exercises: [
    {
      id: "te1",
      exerciseId: "ex1",
      sets: 3,
      unit: "REPS",
      reps: "8",
      weight: 24,
      restTime: 90,
      notes: "",
      group: "A",
      order: 1,
      exercise: {
        id: "ex1",
        name: "Clean",
        type: "EXERCISE",
        subExercises: "[]",
        description: null,
      },
      sectionTitle: null,
    },
  ],
  tags: [],
};

describe("CalendarDayMenu", () => {
  it("renders desktop actions and triggers workout handlers", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onAddWorkout = vi.fn();
    const onAddFromTemplate = vi.fn();
    const onEditWorkout = vi.fn();
    const onDeleteWorkout = vi.fn();

    vi.mocked(useIsMobile).mockReturnValue(false);

    render(
      <CalendarDayMenu
        date={new Date(2024, 10, 1)}
        workouts={[workoutFixture]}
        templates={[templateFixture]}
        isOpen
        onOpenChange={onOpenChange}
        onAddWorkout={onAddWorkout}
        onAddFromTemplate={onAddFromTemplate}
        onEditWorkout={onEditWorkout}
        onDeleteWorkout={onDeleteWorkout}
      >
        <button type="button">Open</button>
      </CalendarDayMenu>,
    );

    expect(screen.getByText("01/11/2024")).toBeInTheDocument();
    expect(screen.getByText("Workout 1")).toBeInTheDocument();
    expect(screen.getByText("Strength")).toBeInTheDocument();
    expect(screen.getByText("FINISHER")).toBeInTheDocument();
    expect(screen.getByText(/and 1 more exercise/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add another workout/i }));
    await user.click(screen.getByRole("button", { name: /new workout/i }));
    expect(onAddWorkout).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await user.click(screen.getByRole("button", { name: /strength builder/i }));
    expect(onAddFromTemplate).toHaveBeenCalledWith("t1");

    await user.click(screen.getByLabelText(/edit workout/i));
    expect(onEditWorkout).toHaveBeenCalledWith(workoutFixture);

    await user.click(screen.getByLabelText(/delete workout/i));
    expect(onDeleteWorkout).toHaveBeenCalledWith(workoutFixture);
  });

  it("renders mobile get-started actions when there are no workouts", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onAddWorkout = vi.fn();

    vi.mocked(useIsMobile).mockReturnValue(true);

    render(
      <CalendarDayMenu
        date={new Date(2024, 10, 2)}
        workouts={[]}
        templates={[]}
        isOpen
        onOpenChange={onOpenChange}
        onAddWorkout={onAddWorkout}
        onAddFromTemplate={vi.fn()}
      >
        <button type="button">Open</button>
      </CalendarDayMenu>,
    );

    expect(screen.getByText(/get started/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /manage templates/i })).toHaveAttribute(
      "href",
      "/templates",
    );

    await user.click(screen.getByRole("button", { name: /new workout/i }));
    expect(onAddWorkout).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("toggles mobile template list for existing workouts", async () => {
    const user = userEvent.setup();

    vi.mocked(useIsMobile).mockReturnValue(true);

    render(
      <CalendarDayMenu
        date={new Date(2024, 10, 3)}
        workouts={[workoutFixture]}
        templates={[templateFixture]}
        isOpen
        onOpenChange={vi.fn()}
        onAddWorkout={vi.fn()}
        onAddFromTemplate={vi.fn()}
      >
        <button type="button">Open</button>
      </CalendarDayMenu>,
    );

    await user.click(screen.getByRole("button", { name: /add another workout/i }));
    expect(screen.getByText(/add another/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /hide/i }));
    expect(screen.getByRole("button", { name: /add another workout/i })).toBeInTheDocument();
  });
});
