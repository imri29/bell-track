import type { Session } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@/generated/prisma";
import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@/server/trpc";

const workoutFindMany = vi.fn();
const workoutFindFirst = vi.fn();
const workoutCreate = vi.fn();
const workoutUpdate = vi.fn();
const workoutDeleteMany = vi.fn();
const workoutExerciseDeleteMany = vi.fn();
const workoutTagAssignmentDeleteMany = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: {
    workout: {
      findMany: (...args: unknown[]) => workoutFindMany(...args),
      findFirst: (...args: unknown[]) => workoutFindFirst(...args),
      create: (...args: unknown[]) => workoutCreate(...args),
      update: (...args: unknown[]) => workoutUpdate(...args),
      deleteMany: (...args: unknown[]) => workoutDeleteMany(...args),
    },
    workoutExercise: {
      deleteMany: (...args: unknown[]) => workoutExerciseDeleteMany(...args),
    },
    workoutTagAssignment: {
      deleteMany: (...args: unknown[]) => workoutTagAssignmentDeleteMany(...args),
    },
  },
}));

const createCaller = createCallerFactory(appRouter);

const createContext = () => ({
  session: { user: { id: "user-1" }, expires: new Date().toISOString() } as Session,
  userId: "user-1",
});

type WorkoutWithRelations = Prisma.WorkoutGetPayload<{
  include: {
    exercises: {
      include: {
        exercise: true;
      };
    };
    tags: {
      include: { tag: true };
    };
  };
}>;

const workoutFixture: WorkoutWithRelations = {
  id: "w1",
  date: new Date("2024-11-01T12:00:00.000Z"),
  duration: 45,
  notes: null,
  createdAt: new Date("2024-11-01T12:00:00.000Z"),
  updatedAt: new Date("2024-11-01T12:30:00.000Z"),
  userId: "user-1",
  exercises: [
    {
      id: "we1",
      createdAt: new Date("2024-11-01T12:00:00.000Z"),
      workoutId: "w1",
      templateId: null,
      exerciseId: "ex1",
      sets: 3,
      unit: "REPS",
      reps: "10",
      weight: null,
      restTime: 60,
      notes: null,
      group: null,
      order: 1,
      exercise: {
        id: "ex1",
        name: "Swing",
        type: "EXERCISE",
        subExercises: "[]",
        description: null,
        createdAt: new Date("2024-10-01T12:00:00.000Z"),
        updatedAt: new Date("2024-10-02T12:00:00.000Z"),
      },
    },
  ],
  tags: [
    {
      workoutId: "w1",
      tagId: "tag-b",
      assignedAt: new Date("2024-11-01T12:00:00.000Z"),
      tag: {
        id: "tag-b",
        name: "Beta",
        slug: "beta",
        description: null,
        createdAt: new Date("2024-10-01T12:00:00.000Z"),
        updatedAt: new Date("2024-10-01T12:00:00.000Z"),
      },
    },
    {
      workoutId: "w1",
      tagId: "tag-a",
      assignedAt: new Date("2024-11-01T12:00:00.000Z"),
      tag: {
        id: "tag-a",
        name: "Alpha",
        slug: "alpha",
        description: null,
        createdAt: new Date("2024-10-01T12:00:00.000Z"),
        updatedAt: new Date("2024-10-01T12:00:00.000Z"),
      },
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("workoutRouter", () => {
  it("serializes workouts with defaults and sorted tags", async () => {
    workoutFindMany.mockResolvedValue([workoutFixture]);

    const caller = createCaller(createContext());
    const result = await caller.workout.getAll();

    expect(result).toHaveLength(1);
    expect(result[0]?.exercises[0]?.weight).toBe(0);
    expect(result[0]?.exercises[0]?.notes).toBe("");
    expect(result[0]?.exercises[0]?.group).toBe("");
    expect(result[0]?.tags.map((tag) => tag.name)).toEqual(["Alpha", "Beta"]);
  });

  it("returns null when workout is not found", async () => {
    workoutFindFirst.mockResolvedValue(null);

    const caller = createCaller(createContext());
    const result = await caller.workout.getById({ id: "missing" });

    expect(result).toBeNull();
  });

  it("serializes a workout by id", async () => {
    workoutFindFirst.mockResolvedValue(workoutFixture);

    const caller = createCaller(createContext());
    const result = await caller.workout.getById({ id: "w1" });

    expect(result?.exercises[0]?.weight).toBe(0);
    expect(result?.exercises[0]?.notes).toBe("");
    expect(result?.exercises[0]?.group).toBe("");
    expect(result?.tags.map((tag) => tag.name)).toEqual(["Alpha", "Beta"]);
  });

  it("throws when updating a missing workout", async () => {
    workoutFindFirst.mockResolvedValue(null);

    const caller = createCaller(createContext());

    await expect(
      caller.workout.update({
        id: "missing",
        notes: "Updated",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("updates workouts and refreshes exercises and tags", async () => {
    workoutFindFirst.mockResolvedValue({ id: "w1" });
    workoutUpdate.mockResolvedValue(workoutFixture);

    const caller = createCaller(createContext());

    await caller.workout.update({
      id: "w1",
      notes: "Updated",
      exercises: [
        {
          exerciseId: "ex1",
          sets: 4,
          unit: "REPS",
          reps: "12",
          weight: 24,
          restTime: 90,
          notes: "Tempo",
          group: "B",
          order: 1,
        },
      ],
      tagIds: ["tag-a"],
    });

    expect(workoutExerciseDeleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          workoutId: "w1",
          workout: { userId: "user-1" },
        },
      }),
    );

    expect(workoutTagAssignmentDeleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          workoutId: "w1",
          workout: { userId: "user-1" },
        },
      }),
    );

    expect(workoutUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "w1" },
        data: expect.objectContaining({
          notes: "Updated",
          exercises: {
            create: [
              expect.objectContaining({
                exerciseId: "ex1",
                sets: 4,
                unit: "REPS",
                reps: "12",
                weight: 24,
                restTime: 90,
                notes: "Tempo",
                group: "B",
                order: 1,
              }),
            ],
          },
          tags: {
            create: [{ tag: { connect: { id: "tag-a" } } }],
          },
        }),
      }),
    );
  });

  it("throws when deleting a missing workout", async () => {
    workoutDeleteMany.mockResolvedValue({ count: 0 });

    const caller = createCaller(createContext());

    await expect(
      caller.workout.delete({
        id: "missing",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("deletes workouts by id", async () => {
    workoutDeleteMany.mockResolvedValue({ count: 1 });

    const caller = createCaller(createContext());
    const result = await caller.workout.delete({ id: "w1" });

    expect(result).toEqual({ success: true });
  });

  it("creates workouts with tag assignments", async () => {
    workoutCreate.mockResolvedValue(workoutFixture);

    const caller = createCaller(createContext());

    await caller.workout.create({
      date: "2024-11-01",
      duration: 45,
      notes: "Session",
      exercises: [
        {
          exerciseId: "ex1",
          sets: 3,
          unit: "REPS",
          reps: "10",
          weight: 20,
          restTime: 60,
          notes: "",
          group: "A",
          order: 0,
        },
      ],
      tagIds: ["tag-a", "tag-b"],
    });

    expect(workoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          tags: {
            create: [{ tag: { connect: { id: "tag-a" } } }, { tag: { connect: { id: "tag-b" } } }],
          },
        }),
      }),
    );
  });
});
