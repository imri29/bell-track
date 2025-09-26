"use client";

import { useId } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import {
  EXERCISE_TYPE_LABELS,
  EXERCISE_TYPES,
  type ExerciseType,
  type SubExercise,
} from "@/types";

type ExerciseFormData = {
  name: string;
  type: ExerciseType;
  description: string;
  subExercises: SubExercise[];
};

interface AddExerciseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddExerciseModal({
  isOpen,
  onOpenChange,
}: AddExerciseModalProps) {
  const utils = api.useUtils();

  const { data: exercises } = api.exercise.getAll.useQuery();

  // Form IDs for accessibility
  const nameId = useId();
  const typeId = useId();
  const exerciseSelectId = useId();
  const descriptionId = useId();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<ExerciseFormData>({
    defaultValues: {
      name: "",
      type: EXERCISE_TYPES.EXERCISE,
      description: "",
      subExercises: [],
    },
  });

  const watchedType = watch("type");

  // useFieldArray for managing subExercises
  const { fields, append, remove } = useFieldArray({
    control,
    name: "subExercises",
  });

  const createExercise = api.exercise.create.useMutation({
    onSuccess: () => {
      utils.exercise.getAll.invalidate();
      // Reset form and close modal
      reset();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: ExerciseFormData) => {
    // Transform subExercises to match API format
    const subExercises =
      data.type === EXERCISE_TYPES.COMPLEX
        ? data.subExercises.map((subEx) => ({
            exerciseName: subEx.exerciseName,
            reps: subEx.reps,
          }))
        : undefined;

    // Submit data directly - no transformation needed
    createExercise.mutate({
      name: data.name,
      type: data.type,
      description: data.description,
      subExercises,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Exercise</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={nameId} className="text-sm font-medium">
              Exercise Name
            </label>
            <Input
              id={nameId}
              placeholder="Enter exercise name"
              {...register("name", { required: "Exercise name is required" })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor={typeId} className="text-sm font-medium">
              Type
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select exercise type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value={EXERCISE_TYPES.EXERCISE}>
                      {EXERCISE_TYPE_LABELS.EXERCISE}
                    </SelectItem>
                    <SelectItem value={EXERCISE_TYPES.COMPLEX}>
                      {EXERCISE_TYPE_LABELS.COMPLEX}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Complex Exercise Fields */}
          {watchedType === EXERCISE_TYPES.COMPLEX && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-sm">Complex Exercise Setup</h4>

              {/* Exercise Selection */}
              <div className="space-y-2">
                <label
                  htmlFor={exerciseSelectId}
                  className="text-sm font-medium"
                >
                  Select Exercises
                </label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value) {
                      const exercise = exercises?.find((ex) => ex.id === value);
                      if (
                        exercise &&
                        !fields.some((field) => field.exerciseId === value)
                      ) {
                        append({
                          exerciseId: exercise.id,
                          exerciseName: exercise.name,
                          reps: 1,
                        });
                      }
                    }
                  }}
                >
                  <SelectTrigger
                    id={exerciseSelectId}
                    className="bg-background"
                  >
                    <SelectValue placeholder="Add exercises to complex" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {exercises
                      ?.filter(
                        (ex) =>
                          ex.type === EXERCISE_TYPES.EXERCISE &&
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

              {/* Selected Exercises with Rep Schemes */}
              {fields.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Exercise Sequence & Reps
                  </p>
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-2 p-2 bg-muted rounded"
                      >
                        <span className="text-sm font-medium w-4">
                          {index + 1}.
                        </span>
                        <span className="flex-1 text-sm">
                          {field.exerciseName}
                        </span>
                        <input
                          type="number"
                          placeholder="Reps"
                          min="1"
                          className="w-20 px-2 py-1 text-sm border rounded"
                          {...register(`subExercises.${index}.reps`, {
                            valueAsNumber: true,
                            required: "Reps required",
                            min: { value: 1, message: "Min 1 rep" },
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor={descriptionId} className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id={descriptionId}
              placeholder="Enter exercise description"
              {...register("description")}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createExercise.isPending}>
              {createExercise.isPending ? "Adding..." : "Add Exercise"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
