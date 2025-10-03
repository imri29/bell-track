"use client";

import { useEffect, useId } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { ComplexNameTooltip } from "@/components/complex-name-tooltip";
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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { buildExerciseFormDefaults } from "@/lib/exercise-form-defaults";
import type { RouterOutputs } from "@/server/api/root";
import { api } from "@/trpc/react";

type WorkoutExerciseFormData = {
  id?: string; // Include existing exercise ID for updates
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

type EditWorkoutModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workout: RouterOutputs["workout"]["getAll"][number] | null;
  onConfirm?: () => void;
};

export function EditWorkoutModal({
  isOpen,
  onOpenChange,
  workout,
  onConfirm,
}: EditWorkoutModalProps) {
  const utils = api.useUtils();

  const { data: exercises } = api.exercise.getAll.useQuery();
  const isMobile = useIsMobile();

  // Form IDs for accessibility
  const dateId = useId();
  const durationId = useId();
  const notesId = useId();
  const exerciseSelectId = useId();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    defaultValues: {
      date: "",
      duration: undefined,
      notes: "",
      exercises: [],
    },
  });

  // useFieldArray for managing exercises
  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  });

  // Reset form when workout data loads
  useEffect(() => {
    if (workout) {
      reset({
        date: new Date(workout.date).toISOString().split("T")[0], // Convert to YYYY-MM-DD format
        duration: workout.duration || undefined,
        notes: workout.notes || "",
        exercises: workout.exercises.sort((a, b) => {
          if (a.group && b.group && a.group !== b.group) {
            return a.group.localeCompare(b.group);
          }
          return a.order - b.order;
        }),
      });
    }
  }, [workout, reset]);

  const updateWorkout = api.workout.update.useMutation({
    onSuccess: () => {
      utils.workout.getAll.invalidate();
      onOpenChange(false);
      reset();
      onConfirm?.();
    },
  });

  const onSubmit = (data: WorkoutFormData) => {
    if (!workout) return;

    // Transform exercises with proper order
    const exercises = data.exercises.map((exercise, index) => ({
      exerciseId: exercise.exerciseId,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      restTime: exercise.restTime,
      notes: exercise.notes,
      group: exercise.group,
      order: index,
    }));

    updateWorkout.mutate({
      id: workout.id,
      date: data.date,
      duration: data.duration || undefined,
      notes: data.notes || undefined,
      exercises,
    });
  };

  const addExercise = (exerciseId: string) => {
    const exercise = exercises?.find((ex) => ex.id === exerciseId);
    if (exercise && !fields.some((field) => field.exerciseId === exerciseId)) {
      append(buildExerciseFormDefaults(exercise, fields.length));
    }
  };

  if (!workout) return null;

  const formSections = (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor={dateId} className="text-sm font-medium">
            Date *
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
            min="1"
            placeholder="Optional"
            {...register("duration", {
              valueAsNumber: true,
              min: {
                value: 1,
                message: "Duration must be at least 1 minute",
              },
            })}
            className={errors.duration ? "border-red-500" : ""}
          />
          {errors.duration && (
            <p className="text-sm text-red-500">{errors.duration.message}</p>
          )}
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
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Add Exercise</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor={exerciseSelectId} className="text-sm font-medium">
              Select Exercise
            </label>
            <Select
              value=""
              onValueChange={(value) => {
                if (value) {
                  addExercise(value);
                }
              }}
            >
              <SelectTrigger id={exerciseSelectId}>
                <SelectValue placeholder="Add individual exercise" />
              </SelectTrigger>
              <SelectContent>
                {exercises
                  ?.filter(
                    (ex) =>
                      ex.type === "EXERCISE" &&
                      !fields.some((field) => field.exerciseId === ex.id),
                  )
                  .map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      <ComplexNameTooltip
                        name={exercise.name}
                        subExercises={exercise.subExercises}
                        className="block"
                      />
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor={exerciseSelectId} className="text-sm font-medium">
              Select Complex
            </label>
            <Select
              value=""
              onValueChange={(value) => {
                if (value) {
                  addExercise(value);
                }
              }}
            >
              <SelectTrigger id={exerciseSelectId}>
                <SelectValue placeholder="Add complex exercise" />
              </SelectTrigger>
              <SelectContent>
                {exercises
                  ?.filter(
                    (ex) =>
                      ex.type === "COMPLEX" &&
                      !fields.some((field) => field.exerciseId === ex.id),
                  )
                  .map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {fields.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Workout Exercises</h3>
            <div className="space-y-4">
              {fields.map((field, index) => {
                const exercise = exercises?.find(
                  (ex) => ex.id === field.exerciseId,
                );
                return (
                  <div key={field.id} className="space-y-4 rounded border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium">
                        {exercise ? (
                          <ComplexNameTooltip
                            name={exercise.name}
                            subExercises={exercise.subExercises}
                            className="inline-flex"
                          />
                        ) : (
                          "Exercise"
                        )}
                      </h4>
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

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <label
                          htmlFor={`sets-${index}`}
                          className="text-sm font-medium"
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
                        <div className="space-y-2">
                          <label
                            htmlFor={`reps-${index}`}
                            className="text-sm font-medium"
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
                      <div className="space-y-2">
                        <label
                          htmlFor={`group-${index}`}
                          className="text-sm font-medium"
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
                      <div className="space-y-2">
                        <label
                          htmlFor={`weight-${index}`}
                          className="text-sm font-medium"
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
                      <div className="space-y-2">
                        <label
                          htmlFor={`rest-${index}`}
                          className="text-sm font-medium"
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
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor={`notes-${index}`}
                        className="text-sm font-medium"
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
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );

  const actionButtons = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={updateWorkout.isPending}>
        {updateWorkout.isPending ? "Updating..." : "Update Workout"}
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={onOpenChange}
        repositionInputs={false}
      >
        <DrawerContent fullHeight className="p-0">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex h-full flex-col"
          >
            <DrawerHeader>
              <DrawerTitle>Edit Workout</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-6">
              {formSections}
            </div>
            <DrawerFooter className="border-t">
              <div className="flex w-full justify-end gap-2 mb-5">
                {actionButtons}
              </div>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Workout</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {formSections}
          <div className="flex justify-end space-x-4 border-t pt-6">
            {actionButtons}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
