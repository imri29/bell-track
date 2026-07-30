"use client";

import { SearchableCombobox } from "@/components/patterns/searchable-combobox";
import { api } from "@/trpc/react";

interface ExerciseComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  excludeIds?: string[];
  id?: string;
  className?: string;
  onCreateNewExercise?: () => void;
  disabled?: boolean;
}

export function ExerciseCombobox({
  value = "",
  onValueChange,
  placeholder = "Add individual exercise",
  excludeIds = [],
  id,
  className,
  onCreateNewExercise,
  disabled = false,
}: ExerciseComboboxProps) {
  const { data: exercises } = api.exercise.getAll.useQuery();
  const availableExercises =
    exercises?.filter(
      (exercise) => exercise.type === "EXERCISE" && !excludeIds.includes(exercise.id),
    ) ?? [];

  const selectedExercise =
    value === "" ? null : (availableExercises.find((exercise) => exercise.id === value) ?? null);

  return (
    <SearchableCombobox
      items={availableExercises}
      value={selectedExercise}
      onValueChange={(nextValue) => {
        onValueChange(nextValue?.id ?? "");
      }}
      getItemKey={(exercise) => exercise.id}
      getItemLabel={(exercise) => exercise.name}
      placeholder={placeholder}
      id={id}
      className={className}
      disabled={disabled}
      emptyActionLabel="Create exercise"
      onEmptyAction={onCreateNewExercise}
    />
  );
}
