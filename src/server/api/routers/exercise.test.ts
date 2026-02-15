import type { Session } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Exercise } from "@/generated/prisma";
import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@/server/trpc";
import { EXERCISE_TYPES } from "@/types";

const exerciseFindMany = vi.fn();
const exerciseFindUnique = vi.fn();
const exerciseCreate = vi.fn();
const exerciseUpdate = vi.fn();
const exerciseDelete = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: {
    exercise: {
      findMany: (...args: unknown[]) => exerciseFindMany(...args),
      findUnique: (...args: unknown[]) => exerciseFindUnique(...args),
      create: (...args: unknown[]) => exerciseCreate(...args),
      update: (...args: unknown[]) => exerciseUpdate(...args),
      delete: (...args: unknown[]) => exerciseDelete(...args),
    },
  },
}));

const createCaller = createCallerFactory(appRouter);

const createContext = () => ({
  session: { user: { id: "user-1" }, expires: new Date().toISOString() } as Session,
  userId: "user-1",
});

const exerciseFixture = {
  id: "ex1",
  name: "Swing",
  type: EXERCISE_TYPES.EXERCISE,
  description: null,
  createdAt: new Date("2024-10-01T12:00:00.000Z"),
  updatedAt: new Date("2024-10-02T12:00:00.000Z"),
  subExercises: JSON.stringify([
    { exerciseName: "Clean", reps: 5 },
    { exerciseName: "Press", reps: 5 },
  ]),
  movementGroup: null,
  movementPlane: null,
  legBias: null,
} satisfies Exercise;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("exerciseRouter", () => {
  it("parses subExercises for list responses", async () => {
    exerciseFindMany.mockResolvedValue([exerciseFixture]);

    const caller = createCaller({ session: null, userId: undefined });
    const result = await caller.exercise.getAll();

    expect(result[0]?.subExercises).toEqual([
      { exerciseName: "Clean", reps: 5 },
      { exerciseName: "Press", reps: 5 },
    ]);
  });

  it("returns null when exercise is not found", async () => {
    exerciseFindUnique.mockResolvedValue(null);

    const caller = createCaller({ session: null, userId: undefined });
    const result = await caller.exercise.getById({ id: "missing" });

    expect(result).toBeNull();
  });

  it("returns null subExercises when none exist", async () => {
    exerciseFindUnique.mockResolvedValue({
      ...exerciseFixture,
      subExercises: null,
    });

    const caller = createCaller({ session: null, userId: undefined });
    const result = await caller.exercise.getById({ id: "ex1" });

    expect(result?.subExercises).toBeNull();
  });

  it("stringifies subExercises on create", async () => {
    exerciseCreate.mockResolvedValue(exerciseFixture);

    const caller = createCaller(createContext());

    await caller.exercise.create({
      name: "Complex",
      type: EXERCISE_TYPES.COMPLEX,
      subExercises: [{ exerciseName: "Swing", reps: 10 }],
      description: "Complex description",
    });

    expect(exerciseCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subExercises: JSON.stringify([{ exerciseName: "Swing", reps: 10 }]),
        }),
      }),
    );
  });

  it("stores null subExercises when omitted on create", async () => {
    exerciseCreate.mockResolvedValue(exerciseFixture);

    const caller = createCaller(createContext());

    await caller.exercise.create({
      name: "Simple",
      type: EXERCISE_TYPES.EXERCISE,
      description: "Simple description",
    });

    expect(exerciseCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subExercises: null,
        }),
      }),
    );
  });

  it("updates exercises without overwriting subExercises when omitted", async () => {
    exerciseUpdate.mockResolvedValue(exerciseFixture);

    const caller = createCaller(createContext());

    await caller.exercise.update({
      id: "ex1",
      name: "Updated",
      type: EXERCISE_TYPES.EXERCISE,
    });

    expect(exerciseUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subExercises: undefined,
        }),
      }),
    );
  });

  it("stringifies subExercises on update when provided", async () => {
    exerciseUpdate.mockResolvedValue(exerciseFixture);

    const caller = createCaller(createContext());

    await caller.exercise.update({
      id: "ex1",
      name: "Updated",
      type: EXERCISE_TYPES.COMPLEX,
      subExercises: [{ exerciseName: "Snatch", reps: 6 }],
    });

    expect(exerciseUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subExercises: JSON.stringify([{ exerciseName: "Snatch", reps: 6 }]),
        }),
      }),
    );
  });

  it("deletes exercises by id", async () => {
    exerciseDelete.mockResolvedValue(exerciseFixture);

    const caller = createCaller(createContext());

    await caller.exercise.delete({ id: "ex1" });

    expect(exerciseDelete).toHaveBeenCalledWith({ where: { id: "ex1" } });
  });
});
