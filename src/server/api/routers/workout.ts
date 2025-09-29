import { z } from "zod";
import { PrismaClient } from "@/generated/prisma";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import {
  idSchema,
  workoutExerciseInputSchema,
  workoutExerciseOutputSchema,
} from "../schemas";

const prisma = new PrismaClient();

// Full workout output schema used by both getAll and getById
const workoutOutputSchema = z.object({
  id: z.string(),
  date: z.date(),
  duration: z.number().nullish(),
  notes: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  exercises: z.array(workoutExerciseOutputSchema),
});

// Base workout schema for shared fields
const baseWorkoutSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  duration: z.number().optional(),
  notes: z.string().optional(),
  exercises: z.array(workoutExerciseInputSchema),
});

const createWorkoutSchema = baseWorkoutSchema;

const updateWorkoutSchema = baseWorkoutSchema.partial().extend({
  id: z.string(),
});

export const workoutRouter = createTRPCRouter({
  getAll: publicProcedure
    .output(z.array(workoutOutputSchema))
    .query(async () => {
      const workouts = await prisma.workout.findMany({
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

      return workouts.map((workout) => ({
        ...workout,
        exercises: workout.exercises.map((ex) => ({
          id: ex.id,
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight ?? 0,
          restTime: ex.restTime,
          notes: ex.notes ?? "",
          group: ex.group ?? "",
          order: ex.order,
          exercise: ex.exercise,
        })),
      }));
    }),

  getById: publicProcedure
    .input(idSchema)
    .output(workoutOutputSchema.nullable())
    .query(async ({ input }) => {
      const workout = await prisma.workout.findUnique({
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

      if (!workout) {
        return null;
      }

      return {
        ...workout,
        exercises: workout.exercises.map((ex) => ({
          id: ex.id,
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight ?? 0,
          restTime: ex.restTime,
          notes: ex.notes ?? "",
          group: ex.group ?? "",
          order: ex.order,
          exercise: ex.exercise,
        })),
      };
    }),

  create: publicProcedure.input(createWorkoutSchema).mutation(({ input }) => {
    const { exercises, ...workoutData } = input;

    return prisma.workout.create({
      data: {
        ...workoutData,
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
    .input(updateWorkoutSchema)
    .mutation(async ({ input }) => {
      const { id, exercises, ...workoutData } = input;

      // If exercises are provided, replace all workout exercises
      if (exercises) {
        await prisma.workoutExercise.deleteMany({
          where: { workoutId: id },
        });
      }

      return prisma.workout.update({
        where: { id },
        data: {
          ...workoutData,
          ...(exercises && {
            exercises: {
              create: exercises.map((exercise) => ({
                exerciseId: exercise.exerciseId,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
                restTime: exercise.restTime,
                notes: exercise.notes,
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

  delete: publicProcedure.input(idSchema).mutation(async ({ input }) => {
    await prisma.workout.delete({
      where: { id: input.id },
    });

    return { success: true };
  }),
});
