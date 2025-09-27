"use client";

import { useCallback, useEffect, useId } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { ComplexSelect } from "@/components/complex-select";
import { ExerciseSelect } from "@/components/exercise-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import type { TemplateData } from "@/types";

type WorkoutExerciseFormData = {
  exerciseId: string;
  sets: number;
  reps: string;
  weight: number;
  restTime?: number;
  notes?: string;
  group?: string;
  order: number;
};

type WorkoutFormData = {
  date: string;
  duration?: number;
  notes?: string;
  exercises: WorkoutExerciseFormData[];
};

interface AddWorkoutModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  templateData?: TemplateData;
  initialDate?: Date;
  onConfirm?: () => void;
}

export function AddWorkoutModal({
  isOpen,
  onOpenChange,
  templateData,
  initialDate,
  onConfirm,
}: AddWorkoutModalProps) {
  const utils = api.useUtils();

  const { data: exercises } = api.exercise.getAll.useQuery();

  // Form IDs for accessibility
  const dateId = useId();
  const durationId = useId();
  const notesId = useId();
  const exerciseSelectId = useId();
  const complexSelectId = useId();

  const getInitialDate = useCallback(() => {
    const dateToUse = initialDate || new Date();
    return dateToUse.toLocaleDateString("en-CA"); // YYYY-MM-DD format
  }, [initialDate]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    defaultValues: {
      date: getInitialDate(),
      duration: undefined,
      notes: templateData ? `From template: ${templateData.name}` : "",
      exercises: templateData?.exercises || [],
    },
  });

  // useFieldArray for managing exercises
  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  });

  // Reset form when templateData or initialDate changes
  useEffect(() => {
    if (templateData) {
      reset({
        date: getInitialDate(),
        duration: undefined,
        notes: `From template: ${templateData.name}`,
        exercises: templateData.exercises,
      });
    } else if (isOpen) {
      // Reset to empty form when opening without template
      reset({
        date: getInitialDate(),
        duration: undefined,
        notes: "",
        exercises: [],
      });
    }
  }, [templateData, isOpen, reset, getInitialDate]);

  const createWorkout = api.workout.create.useMutation({
    onSuccess: () => {
      utils.workout.getAll.invalidate();
      reset();
      onOpenChange(false);
      onConfirm?.();
    },
  });

  const onSubmit = (data: WorkoutFormData) => {
    // Transform reps from string to JSON array format expected by API
    const exercises = data.exercises.map((exercise, index) => ({
      ...exercise,
      reps: exercise.reps, // Keep as string for now, API expects JSON string
      order: index,
    }));

    createWorkout.mutate({
      date: data.date,
      duration: data.duration || undefined, // Convert null/empty to undefined
      notes: data.notes || undefined,
      exercises,
    });
  };

  const addExercise = (exerciseId: string) => {
    const exercise = exercises?.find((ex) => ex.id === exerciseId);
    if (exercise && !fields.some((field) => field.exerciseId === exerciseId)) {
      append({
        exerciseId: exercise.id,
        sets: exercise.type === "COMPLEX" ? 5 : 3, // Complexes default to 5 sets
        reps: exercise.type === "COMPLEX" ? "1" : "12", // Complexes = 1 round, exercises = 12 reps
        weight: 16, // Default kettlebell weight
        restTime: exercise.type === "COMPLEX" ? 90 : 60, // Complexes need more rest
        notes: "",
        group: "",
        order: fields.length,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Workout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor={dateId} className="text-sm font-medium">
                Workout Date
              </label>
              <Input
                id={dateId}
                type="date"
                {...register("date", { required: "Date is required" })}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor={durationId} className="text-sm font-medium">
                Duration (minutes)
              </label>
              <Input
                id={durationId}
                type="number"
                placeholder="Optional"
                {...register("duration", { valueAsNumber: true, min: 1 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={notesId} className="text-sm font-medium">
              Notes
            </label>
            <Textarea
              id={notesId}
              placeholder="Optional workout notes"
              {...register("notes")}
            />
          </div>

          {/* Exercise Selection */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-sm">Add Exercises</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor={exerciseSelectId}
                  className="text-sm font-medium"
                >
                  Select Exercise
                </label>
                <ExerciseSelect
                  onValueChange={(value) => {
                    if (value) {
                      addExercise(value);
                    }
                  }}
                  excludeIds={fields.map((field) => field.exerciseId)}
                  id={exerciseSelectId}
                  className="bg-background"
                  placeholder="Add individual exercise"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={complexSelectId}
                  className="text-sm font-medium"
                >
                  Select Complex
                </label>
                <ComplexSelect
                  onValueChange={(value) => {
                    if (value) {
                      addExercise(value);
                    }
                  }}
                  excludeIds={fields.map((field) => field.exerciseId)}
                  id={complexSelectId}
                  className="bg-background"
                  placeholder="Add complex exercise"
                />
              </div>
            </div>

            {/* Selected Exercises */}
            {fields.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Workout Exercises</p>
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const exercise = exercises?.find(
                      (ex) => ex.id === field.exerciseId,
                    );
                    return (
                      <div
                        key={field.id}
                        className="p-3 bg-muted rounded border space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium">{exercise?.name}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-red-500"
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid gap-3 grid-cols-2">
                          <div className="space-y-1">
                            <label
                              htmlFor={`sets-${index}`}
                              className="text-xs font-medium"
                            >
                              Sets
                            </label>
                            <Input
                              id={`sets-${index}`}
                              type="number"
                              min="1"
                              {...register(`exercises.${index}.sets`, {
                                valueAsNumber: true,
                                required: "Sets required",
                                min: { value: 1, message: "Min 1 set" },
                              })}
                            />
                          </div>
                          {exercise?.type !== "COMPLEX" && (
                            <div className="space-y-1">
                              <label
                                htmlFor={`reps-${index}`}
                                className="text-xs font-medium"
                              >
                                Reps
                              </label>
                              <Input
                                id={`reps-${index}`}
                                placeholder="12 or 12,10,8"
                                {...register(`exercises.${index}.reps`, {
                                  required: "Reps required",
                                })}
                              />
                            </div>
                          )}
                          <div className="space-y-1">
                            <label
                              htmlFor={`group-${index}`}
                              className="text-xs font-medium"
                            >
                              Group
                            </label>
                            <Input
                              id={`group-${index}`}
                              placeholder="A, B, C..."
                              maxLength={1}
                              {...register(`exercises.${index}.group`)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label
                              htmlFor={`weight-${index}`}
                              className="text-xs font-medium"
                            >
                              Weight (kg)
                            </label>
                            <Input
                              id={`weight-${index}`}
                              type="number"
                              min="0"
                              step="0.5"
                              {...register(`exercises.${index}.weight`, {
                                valueAsNumber: true,
                                required: "Weight required",
                                min: { value: 0, message: "Min 0kg" },
                              })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label
                              htmlFor={`rest-${index}`}
                              className="text-xs font-medium"
                            >
                              Rest (sec)
                            </label>
                            <Input
                              id={`rest-${index}`}
                              type="number"
                              min="0"
                              placeholder="Optional"
                              {...register(`exercises.${index}.restTime`, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label
                              htmlFor={`notes-${index}`}
                              className="text-xs font-medium"
                            >
                              Notes
                            </label>
                            <Input
                              id={`notes-${index}`}
                              placeholder="Optional exercise notes"
                              {...register(`exercises.${index}.notes`)}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createWorkout.isPending}>
              {createWorkout.isPending ? "Creating..." : "Log workout"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
