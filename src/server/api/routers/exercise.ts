import { z } from "zod";
import type { Exercise as PrismaExercise } from "@/generated/prisma";
import { PrismaClient } from "@/generated/prisma";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { EXERCISE_TYPES } from "@/types";

const prisma = new PrismaClient();

const subExerciseSchema = z.object({
  exerciseName: z.string(),
  reps: z.number().positive(),
});

type SubExercise = z.infer<typeof subExerciseSchema>;

// Helper function to transform exercise with parsed subExercises
const transformExercise = (exercise: PrismaExercise) => ({
  ...exercise,
  subExercises: exercise.subExercises
    ? (JSON.parse(exercise.subExercises) as SubExercise[])
    : null,
});

// Exercise input schema for create/update
const exerciseInputSchema = z.object({
  name: z.string(),
  type: z.enum([EXERCISE_TYPES.EXERCISE, EXERCISE_TYPES.COMPLEX]),
  subExercises: z.array(subExerciseSchema).optional(),
  description: z.string().optional(),
});

// Exercise output schema with properly typed subExercises
const exerciseOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  subExercises: z.array(subExerciseSchema).nullable(),
});

export const exerciseRouter = createTRPCRouter({
  getAll: publicProcedure
    .output(z.array(exerciseOutputSchema))
    .query(async () => {
      const exercises = await prisma.exercise.findMany({
        orderBy: { createdAt: "desc" },
      });
      return exercises.map(transformExercise);
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(exerciseOutputSchema.nullable())
    .query(async ({ input }) => {
      const exercise = await prisma.exercise.findUnique({
        where: { id: input.id },
      });
      return exercise ? transformExercise(exercise) : null;
    }),
  create: publicProcedure.input(exerciseInputSchema).mutation(({ input }) => {
    return prisma.exercise.create({
      data: {
        ...input,
        subExercises: input.subExercises
          ? JSON.stringify(input.subExercises)
          : null,
      },
    });
  }),
  update: publicProcedure
    .input(exerciseInputSchema.extend({ id: z.string() }))
    .mutation(({ input }) => {
      const { id, ...exercise } = input;
      return prisma.exercise.update({
        where: { id },
        data: {
          ...exercise,
          subExercises: exercise.subExercises
            ? JSON.stringify(exercise.subExercises)
            : undefined,
        },
      });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      return prisma.exercise.delete({ where: { id: input.id } });
    }),
});
