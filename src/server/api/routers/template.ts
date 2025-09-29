import { z } from "zod";
import { PrismaClient } from "@/generated/prisma";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";

const prisma = new PrismaClient();

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

// Base template schema for shared fields
const baseTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  exercises: z.array(templateExerciseSchema),
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
});

export const templateRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return prisma.workoutTemplate.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: [{ group: "asc" }, { order: "asc" }],
        },
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(templateOutputSchema.nullable())
    .query(async ({ input }) => {
      const template = await prisma.workoutTemplate.findUnique({
        where: { id: input.id },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: [{ group: "asc" }, { order: "asc" }],
          },
        },
      });

      if (!template) {
        return null;
      }

      return {
        ...template,
        exercises: template.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight || 16,
          restTime: ex.restTime,
          notes: ex.notes || "",
          group: ex.group || "",
          order: ex.order,
        })),
      };
    }),

  create: publicProcedure
    .input(createTemplateSchema)
    .mutation(async ({ input }) => {
      const { exercises, ...templateData } = input;

      return prisma.workoutTemplate.create({
        data: {
          ...templateData,
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
        },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: [{ group: "asc" }, { order: "asc" }],
          },
        },
      });
    }),

  update: publicProcedure
    .input(updateTemplateSchema)
    .mutation(async ({ input }) => {
      const { id, exercises, ...templateData } = input;

      // If exercises are provided, replace all template exercises
      if (exercises) {
        await prisma.workoutExercise.deleteMany({
          where: { templateId: id },
        });
      }

      return prisma.workoutTemplate.update({
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
        },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
            orderBy: [{ group: "asc" }, { order: "asc" }],
          },
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.workoutTemplate.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
