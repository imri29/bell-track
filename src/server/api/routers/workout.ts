import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { idSchema, workoutExerciseInputSchema, workoutExerciseOutputSchema } from "../schemas";
import { draftFeedbackOutputSchema } from "../schemas";
import { analyzeWorkoutHistory } from "../../services/workout-history-analysis";
import { getWorkoutDraftFeedback } from "../../services/workout-draft-feedback";
import { getExerciseSuggestions } from "../../services/exercise-suggestions";

// Full workout output schema used by both getAll and getById
const workoutTagOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  assignedAt: z.date(),
});

const workoutOutputSchema = z.object({
  id: z.string(),
  date: z.date(),
  duration: z.number().nullish(),
  notes: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  exercises: z.array(workoutExerciseOutputSchema),
  tags: z.array(workoutTagOutputSchema),
});

// Base workout schema for shared fields
const baseWorkoutSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  duration: z.number().optional(),
  notes: z.string().optional(),
  exercises: z.array(workoutExerciseInputSchema),
});

const createWorkoutSchema = baseWorkoutSchema.extend({
  tagIds: z.array(z.string()).default([]),
});

const updateWorkoutSchema = baseWorkoutSchema.partial().extend({
  id: z.string(),
  tagIds: z.array(z.string()).optional(),
});

const validateDraftSchema = z.object({
  exerciseIds: z.array(z.string()),
  asOf: z.string().datetime().optional(),
});

const suggestionsOutputSchema = z.array(
  z.object({
    exerciseId: z.string(),
    name: z.string(),
    reason: z.string(),
  }),
);

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

function serializeWorkout(workout: WorkoutWithRelations) {
  return {
    ...workout,
    exercises: workout.exercises.map((ex) => ({
      id: ex.id,
      exerciseId: ex.exerciseId,
      sets: ex.sets,
      unit: ex.unit,
      reps: ex.reps,
      weight: ex.weight ?? 0,
      restTime: ex.restTime,
      notes: ex.notes ?? "",
      group: ex.group ?? "",
      order: ex.order,
      exercise: ex.exercise,
      sectionTitle: ex.sectionTitle,
    })),
    tags: workout.tags
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

export const workoutRouter = createTRPCRouter({
  getSuggestions: protectedProcedure
    .input(validateDraftSchema.extend({ limit: z.number().int().min(1).max(10).default(3) }))
    .output(suggestionsOutputSchema)
    .query(async ({ input, ctx }) => {
      const asOf = input.asOf ? new Date(input.asOf) : new Date();
      const [candidates, workouts] = await Promise.all([
        prisma.exercise.findMany({
          where: { type: "EXERCISE" },
          select: {
            id: true,
            name: true,
            type: true,
            movementGroup: true,
            movementPlane: true,
            legBias: true,
          },
        }),
        prisma.workout.findMany({
          where: { userId: ctx.userId, date: { lte: asOf } },
          orderBy: { date: "desc" },
          include: {
            exercises: {
              include: {
                exercise: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    movementGroup: true,
                    movementPlane: true,
                    legBias: true,
                  },
                },
              },
            },
          },
        }),
      ]);
      const draftIds = new Set(input.exerciseIds);
      const draft = candidates.filter((candidate) => draftIds.has(candidate.id));
      const history = analyzeWorkoutHistory(
        workouts.map((workout) => ({
          id: workout.id,
          date: workout.date,
          exercises: workout.exercises.map(({ exercise }) => exercise),
        })),
        asOf,
      );

      return getExerciseSuggestions(draft, candidates, history, input.limit);
    }),
  validateDraft: protectedProcedure
    .input(validateDraftSchema)
    .output(draftFeedbackOutputSchema)
    .query(async ({ input, ctx }) => {
      const asOf = input.asOf ? new Date(input.asOf) : new Date();
      const [draftExercises, workouts] = await Promise.all([
        prisma.exercise.findMany({
          where: { id: { in: input.exerciseIds } },
          select: {
            id: true,
            name: true,
            movementGroup: true,
            movementPlane: true,
            legBias: true,
          },
        }),
        prisma.workout.findMany({
          where: { userId: ctx.userId, date: { lte: asOf } },
          orderBy: { date: "desc" },
          include: {
            exercises: {
              include: {
                exercise: {
                  select: {
                    id: true,
                    name: true,
                    movementGroup: true,
                    movementPlane: true,
                    legBias: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      const draftById = new Map(draftExercises.map((exercise) => [exercise.id, exercise]));
      const draft = input.exerciseIds.flatMap((id) => {
        const exercise = draftById.get(id);
        return exercise ? [exercise] : [];
      });
      const history = analyzeWorkoutHistory(
        workouts.map((workout) => ({
          id: workout.id,
          date: workout.date,
          exercises: workout.exercises.map(({ exercise }) => exercise),
        })),
        asOf,
      );

      return getWorkoutDraftFeedback(draft, history);
    }),
  getAll: protectedProcedure.output(z.array(workoutOutputSchema)).query(async ({ ctx }) => {
    const workouts = await prisma.workout.findMany({
      where: {
        userId: ctx.userId,
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

    return workouts.map((workout) => serializeWorkout(workout));
  }),

  getById: protectedProcedure
    .input(idSchema)
    .output(workoutOutputSchema.nullable())
    .query(async ({ input, ctx }) => {
      const workout = await prisma.workout.findFirst({
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

      if (!workout) {
        return null;
      }

      return serializeWorkout(workout);
    }),

  create: protectedProcedure.input(createWorkoutSchema).mutation(({ input, ctx }) => {
    const { exercises, tagIds = [], ...workoutData } = input;

    return prisma.workout
      .create({
        data: {
          ...workoutData,
          userId: ctx.userId,
          exercises: {
            create: exercises.map((exercise) => ({
              exerciseId: exercise.exerciseId,
              sets: exercise.sets,
              unit: exercise.unit,
              reps: exercise.reps,
              weight: exercise.weight,
              restTime: exercise.restTime,
              notes: exercise.notes,
              group: exercise.group,
              order: exercise.order,
              sectionTitle: exercise.sectionTitle,
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
      })
      .then((workout) => serializeWorkout(workout));
  }),

  update: protectedProcedure.input(updateWorkoutSchema).mutation(async ({ input, ctx }) => {
    const { id, exercises, tagIds, ...workoutData } = input;

    const existing = await prisma.workout.findFirst({
      where: { id, userId: ctx.userId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workout not found",
      });
    }

    // If exercises are provided, replace all workout exercises
    if (exercises) {
      await prisma.workoutExercise.deleteMany({
        where: { workoutId: id, workout: { userId: ctx.userId } },
      });
    }

    if (tagIds) {
      await prisma.workoutTagAssignment.deleteMany({
        where: { workoutId: id, workout: { userId: ctx.userId } },
      });
    }

    return prisma.workout
      .update({
        where: { id },
        data: {
          ...workoutData,
          ...(exercises && {
            exercises: {
              create: exercises.map((exercise) => ({
                exerciseId: exercise.exerciseId,
                sets: exercise.sets,
                unit: exercise.unit,
                reps: exercise.reps,
                weight: exercise.weight,
                restTime: exercise.restTime,
                notes: exercise.notes,
                group: exercise.group,
                order: exercise.order,
                sectionTitle: exercise.sectionTitle,
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
      })
      .then((workout) => serializeWorkout(workout));
  }),

  delete: protectedProcedure.input(idSchema).mutation(async ({ input, ctx }) => {
    const result = await prisma.workout.deleteMany({
      where: { id: input.id, userId: ctx.userId },
    });

    if (result.count === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workout not found",
      });
    }

    return { success: true };
  }),
});
