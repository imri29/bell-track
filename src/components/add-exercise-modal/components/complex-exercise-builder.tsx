"use client";

import { useId } from "react";
import type { Control, UseFormRegister } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { ExerciseCombobox } from "@/components/exercise-combobox";
import type { SubExercise } from "@/types";

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
  onCreateNewExercise?: () => void;
}

export function ComplexExerciseBuilder({
  control,
  register,
  exercises = [],
  onCreateNewExercise,
}: ComplexExerciseBuilderProps) {
  const exerciseSelectId = useId();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "subExercises",
  });

  const selectedExerciseIds = fields
    .map((field) => field.exerciseId)
    .filter((id): id is string => Boolean(id));

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium text-sm">Complex Exercise Setup</h4>

      {/* Exercise Selection */}
      <div className="space-y-2">
        <label htmlFor={exerciseSelectId} className="text-sm font-medium">
          Select Exercises
        </label>
        <ExerciseCombobox
          id={exerciseSelectId}
          className="bg-background"
          placeholder="Add exercises to complex"
          excludeIds={selectedExerciseIds}
          onCreateNewExercise={onCreateNewExercise}
          onValueChange={(value) => {
            if (!value) {
              return;
            }

            const exercise = exercises?.find((ex) => ex.id === value);
            if (!exercise) {
              return;
            }

            const isDuplicate = fields.some((field) => {
              if (field.exerciseId) {
                return field.exerciseId === value;
              }
              return field.exerciseName.toLowerCase() === exercise.name.toLowerCase();
            });

            if (isDuplicate) {
              return;
            }

            append({
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              reps: 1,
            });
          }}
        />
      </div>

      {/* Selected Exercises with Rep Schemes */}
      {fields.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Exercise Sequence & Reps</p>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 p-2 bg-muted rounded">
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
