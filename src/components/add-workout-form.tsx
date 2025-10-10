"use client";

import { useCallback, useMemo, useState } from "react";
import {
  WorkoutForm,
  type WorkoutFormSubmitData,
  type WorkoutFormValues,
} from "@/components/workout-form";
import { api } from "@/trpc/react";
import type { TemplateData } from "@/types";

interface AddWorkoutFormProps {
  templateData?: TemplateData;
  initialDate?: Date;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function AddWorkoutForm({
  templateData,
  initialDate,
  onCancel,
  onSuccess,
}: AddWorkoutFormProps) {
  const utils = api.useUtils();
  const [resetToken, setResetToken] = useState(0);

  const getInitialDate = useCallback(() => {
    const dateToUse = initialDate || new Date();
    return dateToUse.toLocaleDateString("en-CA");
  }, [initialDate]);

  const buildInitialValues = useCallback((): WorkoutFormValues => {
    const sortedExercises = (templateData?.exercises ?? [])
      .slice()
      .sort((a, b) => a.order - b.order);

    return {
      date: getInitialDate(),
      duration: undefined,
      notes: templateData ? `From template: ${templateData.name}` : "",
      exercises: sortedExercises.map((exercise, index) => ({
        exerciseId: exercise.exerciseId,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: typeof exercise.weight === "number" ? exercise.weight : 0,
        restTime:
          typeof exercise.restTime === "number" ? exercise.restTime : undefined,
        notes: exercise.notes ?? undefined,
        group: exercise.group ?? undefined,
        order: index,
      })),
      tagIds: templateData?.tagIds ?? [],
    };
  }, [getInitialDate, templateData]);

  const initialValues = useMemo(
    () => buildInitialValues(),
    [buildInitialValues],
  );

  const createWorkout = api.workout.create.useMutation({
    onSuccess: () => {
      utils.workout.getAll.invalidate();
      setResetToken((token) => token + 1);
      onSuccess?.();
    },
  });

  const handleSubmit = (data: WorkoutFormSubmitData) => {
    createWorkout.mutate(data);
  };

  return (
    <WorkoutForm
      key={resetToken}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitLabel={createWorkout.isPending ? "Creating..." : "Log workout"}
      isSubmitting={createWorkout.isPending}
    />
  );
}
