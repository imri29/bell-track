"use client";

import { useId } from "react";
import type { Control, UseFormRegister } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXERCISE_TYPES, type SubExercise } from "@/types";

interface Exercise {
  id: string;
  name: string;
  type: string;
}

export type ComplexExerciseFormValues = {
  name: string;
  description: string;
  subExercises: SubExercise[];
};

interface ComplexExerciseBuilderProps {
  control: Control<ComplexExerciseFormValues>;
  register: UseFormRegister<ComplexExerciseFormValues>;
  exercises?: Exercise[];
}

export function ComplexExerciseBuilder({
  control,
  register,
  exercises = [],
}: ComplexExerciseBuilderProps) {
  const exerciseSelectId = useId();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "subExercises",
  });

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium text-sm">Complex Exercise Setup</h4>

      {/* Exercise Selection */}
      <div className="space-y-2">
        <label htmlFor={exerciseSelectId} className="text-sm font-medium">
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
          <SelectTrigger id={exerciseSelectId} className="bg-background">
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
          <p className="text-sm font-medium">Exercise Sequence & Reps</p>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-2 p-2 bg-muted rounded"
              >
                <span className="text-sm font-medium w-4">{index + 1}.</span>
                <span className="flex-1 text-sm">{field.exerciseName}</span>
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
  );
}
