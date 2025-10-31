import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/trpc";

const templateExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().min(1),
  reps: z.string(), // JSON array like "[12, 10, 8]"
  weight: z.number().min(0).optional(),
  restTime: z.number().optional(),
  notes: z.string().optional(),
  group: z.string().optional(), // Exercise group (A, B, C, etc.)
  order: z.number().min(0),
});

// Output schema for template exercises to match workout input format
const templateExerciseOutputSchema = z.object({
  id: z.string().optional(),
  exerciseId: z.string(),
  sets: z.number(),
  reps: z.string(),
  weight: z
    .number()
    .nullable()
    .transform((val) => val ?? 16), // Default weight for forms
  restTime: z
    .number()
    .nullable()
    .transform((val) => val || undefined),
  notes: z
    .string()
    .nullable()
    .transform((val) => val ?? ""), // Default empty string for forms
  group: z
    .string()
    .nullable()
    .transform((val) => val ?? ""), // Default empty string for forms
  order: z.number(),
});

const templateTagOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  assignedAt: z.date(),
});

// Base template schema for shared fields
const baseTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  exercises: z.array(templateExerciseSchema),
  tagIds: z.array(z.string()).default([]),
});

const createTemplateSchema = baseTemplateSchema;

const updateTemplateSchema = baseTemplateSchema.partial().extend({
  id: z.string(),
});

// Template output schema
const templateOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  exercises: z.array(templateExerciseOutputSchema),
  tags: z.array(templateTagOutputSchema),
});

const templateFiltersSchema = z
  .object({
    search: z.string().optional(),
    tagSlugs: z.array(z.string()).optional(),
  })
  .optional();

function serializeTemplate(template: {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  exercises: Array<{
    id: string;
    exerciseId: string;
    sets: number;
    reps: string;
    weight: number | null;
    restTime: number | null;
    notes: string | null;
    group: string | null;
    order: number;
    exercise: {
      id: string;
      name: string;
      type: string;
      subExercises: string | null;
      description: string | null;
    };
  }>;
  tags: Array<{
    assignedAt: Date;
    tag: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
}) {
  return {
    ...template,
    exercises: template.exercises.map((exercise) => ({
      id: exercise.id,
      exerciseId: exercise.exerciseId,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      restTime: exercise.restTime,
      notes: exercise.notes,
      group: exercise.group,
      order: exercise.order,
      exercise: exercise.exercise,
    })),
    tags: template.tags
      .map(({ assignedAt, tag }) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
        assignedAt,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export const templateRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(templateFiltersSchema)
    .query(async ({ input, ctx }) => {
      const search = input?.search?.trim();
      const tagSlugs = input?.tagSlugs
        ?.map((slug) => slug.trim())
        .filter(Boolean);

      const templates = await prisma.workoutTemplate.findMany({
        where: {
          userId: ctx.userId,
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { description: { contains: search, mode: "insensitive" } },
                  {
                    exercises: {
                      some: {
                        exercise: {
                          name: { contains: search, mode: "insensitive" },
                        },
                      },
                    },
                  },
                ],
              }
            : {}),
          ...(tagSlugs && tagSlugs.length > 0
            ? {
                tags: {
                  some: {
                    tag: {
                      slug: { in: tagSlugs },
                    },
                  },
                },
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: [{ group: "asc" }, { order: "asc" }],
          },
          tags: {
            include: { tag: true },
          },
        },
      });

      return templates.map(serializeTemplate);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(templateOutputSchema.nullable())
    .query(async ({ input, ctx }) => {
      const template = await prisma.workoutTemplate.findFirst({
        where: { id: input.id, userId: ctx.userId },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: [{ group: "asc" }, { order: "asc" }],
          },
          tags: {
            include: { tag: true },
          },
        },
      });

      if (!template) {
        return null;
      }

      return serializeTemplate(template);
    }),

  create: protectedProcedure
    .input(createTemplateSchema)
    .mutation(async ({ input, ctx }) => {
      const { exercises, tagIds, ...templateData } = input;

      const template = await prisma.workoutTemplate.create({
        data: {
          ...templateData,
          userId: ctx.userId,
          exercises: {
            create: exercises.map((exercise) => ({
              exerciseId: exercise.exerciseId,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              restTime: exercise.restTime,
              notes: exercise.notes,
              group: exercise.group,
              order: exercise.order,
            })),
          },
          ...(tagIds.length > 0 && {
            tags: {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            },
          }),
        },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: [{ group: "asc" }, { order: "asc" }],
          },
          tags: {
            include: { tag: true },
          },
        },
      });

      return serializeTemplate(template);
    }),

  update: protectedProcedure
    .input(updateTemplateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, exercises, tagIds, ...templateData } = input;

      const existing = await prisma.workoutTemplate.findFirst({
        where: { id, userId: ctx.userId },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      // If exercises are provided, replace all template exercises
      if (exercises) {
        await prisma.workoutExercise.deleteMany({
          where: { templateId: id, template: { userId: ctx.userId } },
        });
      }

      if (tagIds) {
        await prisma.workoutTemplateTag.deleteMany({
          where: { templateId: id, template: { userId: ctx.userId } },
        });
      }

      const template = await prisma.workoutTemplate.update({
        where: { id },
        data: {
          ...templateData,
          ...(exercises && {
            exercises: {
              create: exercises.map((exercise) => ({
                exerciseId: exercise.exerciseId,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
                restTime: exercise.restTime,
                notes: exercise.notes,
                group: exercise.group,
                order: exercise.order,
              })),
            },
          }),
          ...(tagIds && {
            tags: {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            },
          }),
        },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: [{ group: "asc" }, { order: "asc" }],
          },
          tags: {
            include: { tag: true },
          },
        },
      });

      return serializeTemplate(template);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const result = await prisma.workoutTemplate.deleteMany({
        where: { id: input.id, userId: ctx.userId },
      });

      if (result.count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      return { success: true };
    }),

  getTags: publicProcedure.query(async () => {
    return prisma.workoutTag.findMany({
      orderBy: { name: "asc" },
    });
  }),
});
