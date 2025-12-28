"use client";

import { Combobox } from "@/components/ui/combobox";
import { api } from "@/trpc/react";

interface ComplexComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  excludeIds?: string[];
  id?: string;
  className?: string;
  onCreateNewComplex?: () => void;
  disabled?: boolean;
}

export function ComplexCombobox({
  value = "",
  onValueChange,
  placeholder = "Add complex exercise",
  excludeIds = [],
  id,
  className,
  onCreateNewComplex,
  disabled = false,
}: ComplexComboboxProps) {
  const { data: exercises } = api.exercise.getAll.useQuery();
  const availableComplexes =
    exercises?.filter(
      (exercise) =>
        exercise.type === "COMPLEX" && !excludeIds.includes(exercise.id),
    ) ?? [];

  const selectedComplex =
    value === ""
      ? null
      : (availableComplexes.find((exercise) => exercise.id === value) ?? null);

  return (
    <Combobox
      items={availableComplexes}
      value={selectedComplex}
      onValueChange={(nextValue) => {
        onValueChange(nextValue?.id ?? "");
      }}
      getItemKey={(exercise) => exercise.id}
      getItemLabel={(exercise) => exercise.name}
      placeholder={placeholder}
      id={id}
      className={className}
      disabled={disabled}
      emptyActionLabel="Create complex"
      onEmptyAction={onCreateNewComplex}
    />
  );
}
