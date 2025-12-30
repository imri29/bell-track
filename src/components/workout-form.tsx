"use client";

import { Replace, X } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { AddComplexExerciseModal, AddExerciseModal } from "@/components/add-exercise-modal";
import { ComplexCombobox } from "@/components/complex-combobox";
import { ComplexNameTooltip } from "@/components/complex-name-tooltip";
import { ExerciseCombobox } from "@/components/exercise-combobox";
import { ExerciseOrderControls } from "@/components/exercise-order-controls";
import { ExerciseUnitField } from "@/components/exercise-unit-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { buildExerciseFormDefaults } from "@/lib/exercise-form-defaults";
import { getExerciseUnitLabel, getExerciseUnitPlaceholder } from "@/lib/exercise-units";
import { preventEnterFromSelect } from "@/lib/form-handlers";
import { getTagPalette } from "@/lib/tag-colors";
import { cn, normalizeRestTime } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { ExerciseUnit } from "@/types";

export type WorkoutExerciseFormValues = {
  exerciseId: string;
  sets: number;
  unit: ExerciseUnit;
  reps: string;
  weight: number;
  restTime?: number;
  notes?: string;
  group?: string;
  order: number;
};

export type WorkoutFormValues = {
  date: string;
  duration?: number;
  notes?: string;
  exercises: WorkoutExerciseFormValues[];
  tagIds: string[];
};

export type WorkoutFormSubmitExercise = Omit<WorkoutExerciseFormValues, "order" | "restTime"> & {
  restTime?: number;
  order: number;
};

export type WorkoutFormSubmitData = {
  date: string;
  duration?: number;
  notes?: string;
  exercises: WorkoutFormSubmitExercise[];
  tagIds: string[];
};

interface WorkoutFormProps {
  initialValues: WorkoutFormValues;
  onSubmit: (values: WorkoutFormSubmitData) => void;
  onCancel?: () => void;
  cancelLabel?: string;
  submitLabel: string;
  isSubmitting?: boolean;
  enableReplaceExercise?: boolean;
}

export function WorkoutForm({
  initialValues,
  onSubmit,
  onCancel,
  cancelLabel = "Cancel",
  submitLabel,
  isSubmitting = false,
  enableReplaceExercise = true,
}: WorkoutFormProps) {
  const { data: exercises } = api.exercise.getAll.useQuery();
  const { data: tags, isPending: tagsPending, error: tagsError } = api.template.getTags.useQuery();

  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [isAddComplexModalOpen, setIsAddComplexModalOpen] = useState(false);

  const dateId = useId();
  const durationId = useId();
  const notesId = useId();
  const exerciseSelectId = useId();
  const complexSelectId = useId();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<WorkoutFormValues>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const { fields, append, remove, update, move } = useFieldArray({
    control,
    name: "exercises",
  });

  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const selectedTagIds = watch("tagIds");
  const sortedTags = useMemo(() => {
    if (!tags) {
      return [];
    }
    return [...tags].sort((a, b) => a.name.localeCompare(b.name));
  }, [tags]);

  const toggleTagSelection = (tagId: string) => {
    const current = selectedTagIds ?? [];
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    setValue("tagIds", next, { shouldDirty: true });
  };

  const clearTagSelection = () => {
    setValue("tagIds", [], { shouldDirty: true });
  };

  const handleFormSubmit = (data: WorkoutFormValues) => {
    const exercisesPayload = data.exercises.map((exercise, index) => {
      const restTime = normalizeRestTime(exercise.restTime);

      return {
        exerciseId: exercise.exerciseId,
        sets: exercise.sets,
        unit: exercise.unit ?? "REPS",
        reps: exercise.reps,
        weight: exercise.weight,
        restTime,
        notes: exercise.notes,
        group: exercise.group,
        order: index,
      };
    });

    onSubmit({
      date: data.date,
      duration: data.duration || undefined,
      notes: data.notes || undefined,
      exercises: exercisesPayload,
      tagIds: data.tagIds,
    });
  };

  const addExercise = (exerciseId: string) => {
    const exercise = exercises?.find((ex) => ex.id === exerciseId);
    if (exercise && !fields.some((field) => field.exerciseId === exerciseId)) {
      append(buildExerciseFormDefaults(exercise, fields.length));
    }
  };

  const moveExerciseUp = (index: number) => {
    if (index === 0) {
      return;
    }

    move(index, index - 1);
  };

  const moveExerciseDown = (index: number) => {
    if (index >= fields.length - 1) {
      return;
    }

    move(index, index + 1);
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
    const canKeepReps = exercise.type !== "COMPLEX";

    const nextValues = {
      ...defaults,
      exerciseId: exercise.id,
      order: replaceIndex,
      sets: current?.sets ?? defaults.sets,
      unit: exercise.type === "COMPLEX" ? defaults.unit : (current?.unit ?? defaults.unit),
      weight: typeof current?.weight === "number" ? current.weight : defaults.weight,
      restTime: typeof current?.restTime === "number" ? current.restTime : defaults.restTime,
      notes: current?.notes ?? defaults.notes,
      group: current?.group ?? defaults.group,
      reps:
        exercise.type === "COMPLEX"
          ? defaults.reps
          : canKeepReps
            ? (current?.reps ?? defaults.reps)
            : defaults.reps,
    };

    update(replaceIndex, nextValues);
    setReplaceIndex(null);
  };

  const openReplaceDialog = (index: number) => {
    if (!enableReplaceExercise) {
      return;
    }
    setReplaceIndex(index);
  };

  const closeReplaceDialog = () => {
    setReplaceIndex(null);
  };

  const isReplaceDialogOpen = replaceIndex !== null;

  const replaceDialogExcludeIds =
    replaceIndex === null
      ? []
      : fields.filter((_, idx) => idx !== replaceIndex).map((field) => field.exerciseId);

  const replaceDialogCurrentExercise =
    replaceIndex === null
      ? undefined
      : exercises?.find((ex) => ex.id === fields[replaceIndex]?.exerciseId);

  const replaceDialogExerciseValue =
    replaceDialogCurrentExercise?.type === "EXERCISE" ? replaceDialogCurrentExercise.id : "";

  const replaceDialogComplexValue =
    replaceDialogCurrentExercise?.type === "COMPLEX" ? replaceDialogCurrentExercise.id : "";

  return (
    <>
      <AddExerciseModal isOpen={isAddExerciseModalOpen} onOpenChange={setIsAddExerciseModalOpen} />
      <AddComplexExerciseModal
        isOpen={isAddComplexModalOpen}
        onOpenChange={setIsAddComplexModalOpen}
      />

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        onKeyDown={preventEnterFromSelect}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor={dateId} className="text-sm font-medium">
              Workout Date
            </label>
            <Input
              id={dateId}
              type="date"
              disabled={isSubmitting}
              {...register("date", { required: "Date is required" })}
              className={`[&::-webkit-calendar-picker-indicator]:invert ${errors.date ? "border-red-500" : ""}`}
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor={durationId} className="text-sm font-medium">
              Duration (minutes)
            </label>
            <Input
              id={durationId}
              type="number"
              placeholder="Optional"
              min="1"
              disabled={isSubmitting}
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
            disabled={isSubmitting}
            {...register("notes")}
          />
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Tags</h4>
            {(selectedTagIds?.length ?? 0) > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearTagSelection}
                disabled={isSubmitting}
              >
                Clear
              </Button>
            )}
          </div>
          {tagsError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Couldn&apos;t load tags. Save your changes without them and retry later.
            </div>
          ) : tagsPending ? (
            <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <Spinner size="sm" variant="muted" /> Loading tags...
            </div>
          ) : sortedTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sortedTags.map((tag) => {
                const isSelected = selectedTagIds?.includes(tag.id) ?? false;
                const palette = getTagPalette(tag.slug);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTagSelection(tag.id)}
                    disabled={isSubmitting}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      isSelected
                        ? cn(palette.tint, "focus-visible:ring-offset-background")
                        : "border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40 focus-visible:ring-border",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        palette.dot,
                        !isSelected && "opacity-60",
                      )}
                    />
                    {tag.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tags available yet.</p>
          )}
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor={exerciseSelectId} className="text-sm font-medium">
                Select Exercise
              </label>
              <ExerciseCombobox
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
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={complexSelectId} className="text-sm font-medium">
                Select Complex
              </label>
              <ComplexCombobox
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
                disabled={isSubmitting}
              />
            </div>
          </div>

          {fields.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Workout Exercises</p>
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const exercise = exercises?.find((ex) => ex.id === field.exerciseId);
                  return (
                    <div key={field.id} className="p-3 bg-muted rounded border space-y-3">
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
                        <ExerciseOrderControls
                          onMoveUp={() => moveExerciseUp(index)}
                          onMoveDown={() => moveExerciseDown(index)}
                          disableUp={isSubmitting || index === 0}
                          disableDown={isSubmitting || index === fields.length - 1}
                        >
                          {enableReplaceExercise && (
                            <Tooltip content="Replace">
                              <IconButton
                                type="button"
                                variant="ghost"
                                onClick={() => openReplaceDialog(index)}
                                disabled={isSubmitting}
                                aria-label="Replace exercise"
                              >
                                <Replace className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <IconButton
                            type="button"
                            variant="ghost"
                            onClick={() => remove(index)}
                            disabled={isSubmitting}
                            className="dark:hover:text-destructive dark:focus-visible:text-destructive"
                            aria-label="Remove exercise"
                          >
                            <X className="h-4 w-4" />
                          </IconButton>
                        </ExerciseOrderControls>
                      </div>

                      <div className="grid items-end gap-3 grid-cols-1 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label htmlFor={`sets-${index}`} className="text-xs font-medium">
                            Sets
                          </label>
                          <Input
                            id={`sets-${index}`}
                            type="number"
                            min="0"
                            disabled={isSubmitting}
                            {...register(`exercises.${index}.sets`, {
                              valueAsNumber: true,
                              required: "Sets required",
                              min: { value: 0, message: "Min 0 sets" },
                            })}
                          />
                        </div>
                        {exercise?.type !== "COMPLEX" && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label htmlFor={`reps-${index}`} className="text-xs font-medium">
                                {getExerciseUnitLabel(watch(`exercises.${index}.unit`))}
                              </label>
                              <ExerciseUnitField
                                control={control}
                                name={`exercises.${index}.unit`}
                                disabled={isSubmitting}
                                label="Unit"
                                hideLabel
                                showLabels={false}
                                triggerClassName="text-xs"
                              />
                            </div>
                            <Input
                              id={`reps-${index}`}
                              placeholder={getExerciseUnitPlaceholder(
                                watch(`exercises.${index}.unit`),
                              )}
                              disabled={isSubmitting}
                              {...register(`exercises.${index}.reps`, {
                                required:
                                  watch(`exercises.${index}.unit`) === "TIME"
                                    ? "Time required"
                                    : "Reps required",
                              })}
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          <label htmlFor={`weight-${index}`} className="text-xs font-medium">
                            Weight (kg)
                          </label>
                          <Input
                            id={`weight-${index}`}
                            type="number"
                            min="0"
                            step="0.5"
                            disabled={isSubmitting}
                            {...register(`exercises.${index}.weight`, {
                              valueAsNumber: true,
                              required: "Weight required",
                              min: { value: 0, message: "Min 0kg" },
                            })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={`group-${index}`} className="text-xs font-medium">
                            Group
                          </label>
                          <Input
                            id={`group-${index}`}
                            placeholder="A, B, C..."
                            maxLength={1}
                            disabled={isSubmitting}
                            {...register(`exercises.${index}.group`)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={`rest-${index}`} className="text-xs font-medium">
                            Rest (sec)
                          </label>
                          <Input
                            id={`rest-${index}`}
                            type="number"
                            min="0"
                            placeholder="Optional"
                            disabled={isSubmitting}
                            {...register(`exercises.${index}.restTime`, {
                              setValueAs: (value) => {
                                if (value === "" || value === null || value === undefined) {
                                  return undefined;
                                }

                                const parsedValue = Number(value);
                                return Number.isNaN(parsedValue) ? undefined : parsedValue;
                              },
                            })}
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label htmlFor={`notes-${index}`} className="text-xs font-medium">
                            Notes
                          </label>
                          <Input
                            id={`notes-${index}`}
                            placeholder="Optional exercise notes"
                            disabled={isSubmitting}
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
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>

      {enableReplaceExercise &&
        (isMobile ? (
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
                  Existing sets, weight, and notes stay unless the new exercise doesn&apos;t use
                  them.
                </p>
                <div className="space-y-3">
                  <ExerciseCombobox
                    value={replaceDialogExerciseValue}
                    onValueChange={handleReplaceExerciseSelect}
                    excludeIds={replaceDialogExcludeIds}
                    placeholder="Choose exercise"
                    className="bg-background"
                    onCreateNewExercise={() => setIsAddExerciseModalOpen(true)}
                  />
                  <ComplexCombobox
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
                  Existing sets, weight, and notes stay unless the new exercise doesn&apos;t use
                  them.
                </p>
                <div className="space-y-3">
                  <ExerciseCombobox
                    value={replaceDialogExerciseValue}
                    onValueChange={handleReplaceExerciseSelect}
                    excludeIds={replaceDialogExcludeIds}
                    placeholder="Choose exercise"
                    className="bg-background"
                    onCreateNewExercise={() => setIsAddExerciseModalOpen(true)}
                  />
                  <ComplexCombobox
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
        ))}
    </>
  );
}
