"use client";

import { Replace, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  AddComplexExerciseModal,
  AddExerciseModal,
} from "@/components/add-exercise-modal";
import { ComplexNameTooltip } from "@/components/complex-name-tooltip";
import { ComplexSelect } from "@/components/complex-select";
import { ExerciseSelect } from "@/components/exercise-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { buildExerciseFormDefaults } from "@/lib/exercise-form-defaults";
import { normalizeRestTime } from "@/lib/utils";
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

  const { data: exercises } = api.exercise.getAll.useQuery();

  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [isAddComplexModalOpen, setIsAddComplexModalOpen] = useState(false);

  const dateId = useId();
  const durationId = useId();
  const notesId = useId();
  const exerciseSelectId = useId();
  const complexSelectId = useId();

  const getInitialDate = useCallback(() => {
    const dateToUse = initialDate || new Date();
    return dateToUse.toLocaleDateString("en-CA");
  }, [initialDate]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    defaultValues: {
      date: getInitialDate(),
      duration: undefined,
      notes: templateData ? `From template: ${templateData.name}` : "",
      exercises: templateData?.exercises || [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "exercises",
  });

  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (templateData) {
      reset({
        date: getInitialDate(),
        duration: undefined,
        notes: `From template: ${templateData.name}`,
        exercises: templateData.exercises,
      });
    }
  }, [templateData, reset, getInitialDate]);

  useEffect(() => {
    if (!templateData && initialDate) {
      setValue("date", getInitialDate());
    }
  }, [initialDate, templateData, setValue, getInitialDate]);

  const createWorkout = api.workout.create.useMutation({
    onSuccess: () => {
      utils.workout.getAll.invalidate();
      reset({
        date: getInitialDate(),
        duration: undefined,
        notes: templateData ? `From template: ${templateData.name}` : "",
        exercises: templateData?.exercises || [],
      });
      onSuccess?.();
    },
  });

  const onSubmit = (data: WorkoutFormData) => {
    const exercisesPayload = data.exercises.map((exercise, index) => {
      const restTime = normalizeRestTime(exercise.restTime);

      return {
        ...exercise,
        restTime,
        reps: exercise.reps,
        order: index,
      };
    });

    createWorkout.mutate({
      date: data.date,
      duration: data.duration || undefined,
      notes: data.notes || undefined,
      exercises: exercisesPayload,
    });
  };

  const addExercise = (exerciseId: string) => {
    const exercise = exercises?.find((ex) => ex.id === exerciseId);
    if (exercise && !fields.some((field) => field.exerciseId === exerciseId)) {
      append(buildExerciseFormDefaults(exercise, fields.length));
    }
  };

  const handleReplaceExerciseSelect = (exerciseId: string) => {
    if (replaceIndex === null) {
      return;
    }

    const exercise = exercises?.find((ex) => ex.id === exerciseId);
    if (!exercise) {
      return;
    }

    const defaults = buildExerciseFormDefaults(exercise, replaceIndex);
    const currentExercises = getValues("exercises");
    const current = currentExercises?.[replaceIndex];

    const nextValues = {
      ...defaults,
      exerciseId: exercise.id,
      order: replaceIndex,
      sets: current?.sets ?? defaults.sets,
      weight:
        typeof current?.weight === "number" ? current.weight : defaults.weight,
      restTime:
        typeof current?.restTime === "number"
          ? current.restTime
          : defaults.restTime,
      notes: current?.notes ?? defaults.notes,
      group: current?.group ?? defaults.group,
      reps:
        exercise.type === "COMPLEX"
          ? defaults.reps
          : (current?.reps ?? defaults.reps),
    };

    update(replaceIndex, nextValues);
    setReplaceIndex(null);
  };

  const openReplaceDialog = (index: number) => {
    setReplaceIndex(index);
  };

  const closeReplaceDialog = () => {
    setReplaceIndex(null);
  };

  const isReplaceDialogOpen = replaceIndex !== null;

  const replaceDialogExcludeIds =
    replaceIndex === null
      ? []
      : fields
          .filter((_, idx) => idx !== replaceIndex)
          .map((field) => field.exerciseId);

  const replaceDialogCurrentExercise =
    replaceIndex === null
      ? undefined
      : exercises?.find((ex) => ex.id === fields[replaceIndex]?.exerciseId);

  const replaceDialogExerciseValue =
    replaceDialogCurrentExercise?.type === "EXERCISE"
      ? replaceDialogCurrentExercise.id
      : "";

  const replaceDialogComplexValue =
    replaceDialogCurrentExercise?.type === "COMPLEX"
      ? replaceDialogCurrentExercise.id
      : "";

  return (
    <>
      <AddExerciseModal
        isOpen={isAddExerciseModalOpen}
        onOpenChange={setIsAddExerciseModalOpen}
      />
      <AddComplexExerciseModal
        isOpen={isAddComplexModalOpen}
        onOpenChange={setIsAddComplexModalOpen}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor={dateId} className="text-sm font-medium">
              Workout Date
            </label>
            <Input
              id={dateId}
              type="date"
              {...register("date", { required: "Date is required" })}
              className={`[&::-webkit-calendar-picker-indicator]:invert ${errors.date ? "border-red-500" : ""}`}
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

        <div className="space-y-4 border-t pt-4">
          <h4 className="font-medium text-sm">Add Exercises</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor={exerciseSelectId} className="text-sm font-medium">
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
                onCreateNewExercise={() => setIsAddExerciseModalOpen(true)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={complexSelectId} className="text-sm font-medium">
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
                onCreateNewComplex={() => setIsAddComplexModalOpen(true)}
              />
            </div>
          </div>

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
                      <div className="flex justify-between items-center gap-2">
                        <h5 className="font-medium">
                          {exercise ? (
                            <ComplexNameTooltip
                              name={exercise.name}
                              subExercises={exercise.subExercises}
                              className="inline-flex"
                            />
                          ) : (
                            "Exercise"
                          )}
                        </h5>
                        <div className="flex items-center gap-1.5">
                          <Tooltip content="Replace">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => openReplaceDialog(index)}
                              className=""
                            >
                              <Replace className="h-4 w-4" />
                              <span className="sr-only">Replace</span>
                            </Button>
                          </Tooltip>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="dark:hover:text-destructive dark:focus-visible:text-destructive"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
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
                              setValueAs: (value) => {
                                if (
                                  value === "" ||
                                  value === null ||
                                  value === undefined
                                ) {
                                  return undefined;
                                }

                                const parsedValue = Number(value);
                                return Number.isNaN(parsedValue)
                                  ? undefined
                                  : parsedValue;
                              },
                            })}
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
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

        <div className="flex justify-end gap-2 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={createWorkout.isPending}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={createWorkout.isPending}>
            {createWorkout.isPending ? "Creating..." : "Log workout"}
          </Button>
        </div>
      </form>

      {isMobile ? (
        <Drawer
          open={isReplaceDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              closeReplaceDialog();
            }
          }}
          repositionInputs={false}
        >
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle>Replace exercise</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 space-y-4 overflow-y-auto">
              <p className="text-sm text-muted-foreground">
                Existing sets, weight, and notes stay unless the new exercise
                doesn&apos;t use them.
              </p>
              <div className="space-y-3">
                <ExerciseSelect
                  value={replaceDialogExerciseValue}
                  onValueChange={handleReplaceExerciseSelect}
                  excludeIds={replaceDialogExcludeIds}
                  placeholder="Choose exercise"
                  className="bg-background"
                  onCreateNewExercise={() => setIsAddExerciseModalOpen(true)}
                />
                <ComplexSelect
                  value={replaceDialogComplexValue}
                  onValueChange={handleReplaceExerciseSelect}
                  excludeIds={replaceDialogExcludeIds}
                  placeholder="Choose complex"
                  className="bg-background"
                  onCreateNewComplex={() => setIsAddComplexModalOpen(true)}
                />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={isReplaceDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              closeReplaceDialog();
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Replace exercise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Existing sets, weight, and notes stay unless the new exercise
                doesn&apos;t use them.
              </p>
              <div className="space-y-3">
                <ExerciseSelect
                  value={replaceDialogExerciseValue}
                  onValueChange={handleReplaceExerciseSelect}
                  excludeIds={replaceDialogExcludeIds}
                  placeholder="Choose exercise"
                  className="bg-background"
                  onCreateNewExercise={() => setIsAddExerciseModalOpen(true)}
                />
                <ComplexSelect
                  value={replaceDialogComplexValue}
                  onValueChange={handleReplaceExerciseSelect}
                  excludeIds={replaceDialogExcludeIds}
                  placeholder="Choose complex"
                  className="bg-background"
                  onCreateNewComplex={() => setIsAddComplexModalOpen(true)}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
