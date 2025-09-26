import { z } from "zod";
import { PrismaClient } from "@/generated/prisma";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";

const prisma = new PrismaClient();

const workoutExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().min(1),
  reps: z.string(), // JSON array like "[12, 10, 8]"
  weight: z.number().min(0),
  restTime: z.number().optional(),
  notes: z.string().optional(),
  group: z.string().optional(), // Exercise group (A, B, C, etc.)
  order: z.number().min(0),
});

const transformDate = z.string().transform((str) => new Date(str));

const createWorkoutSchema = z.object({
  date: transformDate,
  duration: z.number().optional(),
  notes: z.string().optional(),
  exercises: z.array(workoutExerciseSchema),
});

const updateWorkoutSchema = z.object({
  id: z.string(),
  date: transformDate.optional(),
  duration: z.number().optional(),
  notes: z.string().optional(),
  exercises: z.array(workoutExerciseSchema).optional(),
});

export const workoutRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return prisma.workout.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
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

      return workout;
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

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.workout.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
