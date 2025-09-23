import { z } from "zod";
import { ExerciseType, PrismaClient } from "@/generated/prisma";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";

const prisma = new PrismaClient();

export const exerciseRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(() => {
    return prisma.exercise.findMany({ orderBy: { createdAt: "desc" } });
  }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return prisma.exercise.findUnique({ where: { id: input.id } });
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.enum(ExerciseType),
        subExercises: z.array(z.string()).optional(),
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
        subExercises: z.array(z.string()).optional(),
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
