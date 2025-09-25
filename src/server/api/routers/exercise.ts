import { z } from "zod";
import { ExerciseType, PrismaClient } from "@/generated/prisma";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";

const prisma = new PrismaClient();

const subExerciseSchema = z.object({
  exerciseName: z.string(),
  reps: z.number().positive(),
});

type SubExercise = z.infer<typeof subExerciseSchema>;

export const exerciseRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const exercises = await prisma.exercise.findMany({
      orderBy: { createdAt: "desc" },
    });
    return exercises.map((exercise) => ({
      ...exercise,
      subExercises: exercise.subExercises
        ? (JSON.parse(exercise.subExercises) as SubExercise[])
        : null,
    }));
  }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const exercise = await prisma.exercise.findUnique({
        where: { id: input.id },
      });
      if (!exercise) return null;
      return {
        ...exercise,
        subExercises: exercise.subExercises
          ? (JSON.parse(exercise.subExercises) as SubExercise[])
          : null,
      };
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.enum(ExerciseType),
        subExercises: z.array(subExerciseSchema).optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
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
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(ExerciseType),
        subExercises: z.array(subExerciseSchema).optional(),
        description: z.string().optional(),
      }),
    )
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
