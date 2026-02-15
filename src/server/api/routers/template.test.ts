import type { Session } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@/generated/prisma";
import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@/server/trpc";
import { EXERCISE_UNITS } from "@/types";

const templateFindMany = vi.fn();
const templateFindFirst = vi.fn();
const templateCreate = vi.fn();
const templateUpdate = vi.fn();
const templateDeleteMany = vi.fn();
const workoutExerciseDeleteMany = vi.fn();
const workoutTemplateTagDeleteMany = vi.fn();
const workoutTagFindMany = vi.fn();

vi.mock("@/server/db", () => ({
  prisma: {
    workoutTemplate: {
      findMany: (...args: unknown[]) => templateFindMany(...args),
      findFirst: (...args: unknown[]) => templateFindFirst(...args),
      create: (...args: unknown[]) => templateCreate(...args),
      update: (...args: unknown[]) => templateUpdate(...args),
      deleteMany: (...args: unknown[]) => templateDeleteMany(...args),
    },
    workoutExercise: {
      deleteMany: (...args: unknown[]) => workoutExerciseDeleteMany(...args),
    },
    workoutTemplateTag: {
      deleteMany: (...args: unknown[]) => workoutTemplateTagDeleteMany(...args),
    },
    workoutTag: {
      findMany: (...args: unknown[]) => workoutTagFindMany(...args),
    },
  },
}));

const createCaller = createCallerFactory(appRouter);

const createContext = () => ({
  session: { user: { id: "user-1" }, expires: new Date().toISOString() } as Session,
  userId: "user-1",
});

type TemplateWithRelations = Prisma.WorkoutTemplateGetPayload<{
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

const templateFixture: TemplateWithRelations = {
  id: "t1",
  userId: "user-1",
  name: "Full Body",
  description: null,
  createdAt: new Date("2024-10-01T12:00:00.000Z"),
  updatedAt: new Date("2024-10-02T12:00:00.000Z"),
  exercises: [
    {
      id: "te1",
      createdAt: new Date("2024-10-01T12:00:00.000Z"),
      workoutId: null,
      templateId: "t1",
      exerciseId: "ex1",
      sets: 3,
      unit: EXERCISE_UNITS.TIME,
      reps: "30",
      weight: null,
      restTime: null,
      notes: null,
      group: null,
      sectionTitle: null,
      order: 1,
      exercise: {
        id: "ex1",
        name: "Swing",
        type: "EXERCISE",
        subExercises: "[]",
        description: null,
        createdAt: new Date("2024-10-01T12:00:00.000Z"),
        updatedAt: new Date("2024-10-02T12:00:00.000Z"),
        movementGroup: null,
        movementPlane: null,
        legBias: null,
      },
    },
  ],
  tags: [
    {
      templateId: "t1",
      tagId: "tag-b",
      assignedAt: new Date("2024-10-03T12:00:00.000Z"),
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
      templateId: "t1",
      tagId: "tag-a",
      assignedAt: new Date("2024-10-03T12:00:00.000Z"),
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

describe("templateRouter", () => {
  it("applies search and tag filters when listing templates", async () => {
    templateFindMany.mockResolvedValue([templateFixture]);

    const caller = createCaller(createContext());

    await caller.template.getAll({ search: "  full ", tagSlugs: [" strength ", ""] });

    expect(templateFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.any(Array),
          tags: {
            some: {
              tag: {
                slug: { in: ["strength"] },
              },
            },
          },
        }),
      }),
    );
  });

  it("serializes tags in sorted order", async () => {
    templateFindMany.mockResolvedValue([templateFixture]);

    const caller = createCaller(createContext());
    const result = await caller.template.getAll();

    expect(result[0]?.tags.map((tag) => tag.name)).toEqual(["Alpha", "Beta"]);
  });

  it("applies output defaults for template exercises", async () => {
    templateFindFirst.mockResolvedValue(templateFixture);

    const caller = createCaller(createContext());
    const result = await caller.template.getById({ id: "t1" });

    expect(result?.exercises[0]?.weight).toBe(16);
    expect(result?.exercises[0]?.restTime).toBeUndefined();
    expect(result?.exercises[0]?.notes).toBe("");
    expect(result?.exercises[0]?.group).toBe("");
    expect(result?.exercises[0]?.sectionTitle).toBeUndefined();
  });

  it("returns null when template is not found", async () => {
    templateFindFirst.mockResolvedValue(null);

    const caller = createCaller(createContext());
    const result = await caller.template.getById({ id: "missing" });

    expect(result).toBeNull();
  });

  it("creates templates with exercises and tags", async () => {
    templateCreate.mockResolvedValue(templateFixture);

    const caller = createCaller(createContext());

    await caller.template.create({
      name: "Full Body",
      description: "Template description",
      exercises: [
        {
          exerciseId: "ex1",
          sets: 3,
          unit: EXERCISE_UNITS.REPS,
          reps: "[12,10,8]",
          weight: 20,
          restTime: 60,
          notes: "Keep form",
          group: "A",
          sectionTitle: "Main Lift",
          order: 0,
        },
      ],
      tagIds: ["tag-a", "tag-b"],
    });

    expect(templateCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          exercises: {
            create: [
              expect.objectContaining({
                exerciseId: "ex1",
                sets: 3,
                unit: EXERCISE_UNITS.REPS,
                reps: "[12,10,8]",
                weight: 20,
                restTime: 60,
                notes: "Keep form",
                group: "A",
                sectionTitle: "Main Lift",
                order: 0,
              }),
            ],
          },
          tags: {
            create: [{ tag: { connect: { id: "tag-a" } } }, { tag: { connect: { id: "tag-b" } } }],
          },
        }),
      }),
    );
  });

  it("throws when updating a missing template", async () => {
    templateFindFirst.mockResolvedValue(null);

    const caller = createCaller(createContext());

    await expect(
      caller.template.update({
        id: "missing",
        name: "Updated",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("updates templates and refreshes exercises and tags", async () => {
    templateFindFirst.mockResolvedValue({ id: "t1" });
    templateUpdate.mockResolvedValue(templateFixture);

    const caller = createCaller(createContext());

    await caller.template.update({
      id: "t1",
      name: "Updated",
      exercises: [
        {
          exerciseId: "ex1",
          sets: 4,
          unit: EXERCISE_UNITS.TIME,
          reps: "30",
          weight: 16,
          restTime: 45,
          notes: "Tempo",
          group: "B",
          sectionTitle: "Finisher",
          order: 1,
        },
      ],
      tagIds: ["tag-a"],
    });

    expect(workoutExerciseDeleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          templateId: "t1",
          template: { userId: "user-1" },
        },
      }),
    );

    expect(workoutTemplateTagDeleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          templateId: "t1",
          template: { userId: "user-1" },
        },
      }),
    );

    expect(templateUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "t1" },
        data: expect.objectContaining({
          name: "Updated",
          exercises: {
            create: [
              expect.objectContaining({
                exerciseId: "ex1",
                sets: 4,
                unit: EXERCISE_UNITS.TIME,
                reps: "30",
                weight: 16,
                restTime: 45,
                notes: "Tempo",
                group: "B",
                sectionTitle: "Finisher",
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

  it("throws when deleting a missing template", async () => {
    templateDeleteMany.mockResolvedValue({ count: 0 });

    const caller = createCaller(createContext());

    await expect(
      caller.template.delete({
        id: "missing",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("returns tags for public getTags", async () => {
    workoutTagFindMany.mockResolvedValue([
      { id: "tag-a", name: "Alpha", slug: "alpha" },
      { id: "tag-b", name: "Beta", slug: "beta" },
    ]);

    const caller = createCaller({ session: null, userId: undefined });

    const result = await caller.template.getTags();

    expect(result).toEqual([
      { id: "tag-a", name: "Alpha", slug: "alpha" },
      { id: "tag-b", name: "Beta", slug: "beta" },
    ]);
  });
});
