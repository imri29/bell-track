"use client";

import { Plus } from "lucide-react";
import { ComplexNameTooltip } from "@/components/complex-name-tooltip";
import { IconButton } from "@/components/ui/icon-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";

interface ComplexSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  excludeIds?: string[];
  id?: string;
  className?: string;
  onCreateNewComplex?: () => void;
  disabled?: boolean;
}

export function ComplexSelect({
  value = "",
  onValueChange,
  placeholder = "Add complex exercise",
  excludeIds = [],
  id,
  className,
  onCreateNewComplex,
  disabled = false,
}: ComplexSelectProps) {
  const { data: exercises } = api.exercise.getAll.useQuery();

  const availableComplexes =
    exercises?.filter(
      (ex) => ex.type === "COMPLEX" && !excludeIds.includes(ex.id),
    ) || [];

  return (
    <div className="flex gap-1 items-center">
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id} className={className} disabled={disabled}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-background">
          {availableComplexes.map((exercise) => (
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
      <IconButton
        variant="outline"
        onClick={onCreateNewComplex}
        type="button"
        disabled={disabled}
        aria-label="Create new complex exercise"
      >
        <Plus />
      </IconButton>
    </div>
  );
}
