"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";

interface ExerciseSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  excludeIds?: string[];
  id?: string;
  className?: string;
  onCreateNewExercise?: () => void;
  disabled?: boolean;
}

export function ExerciseSelect({
  value = "",
  onValueChange,
  placeholder = "Add individual exercise",
  excludeIds = [],
  id,
  className,
  onCreateNewExercise,
  disabled = false,
}: ExerciseSelectProps) {
  const { data: exercises } = api.exercise.getAll.useQuery();

  const availableExercises =
    exercises?.filter(
      (ex) => ex.type === "EXERCISE" && !excludeIds.includes(ex.id),
    ) || [];

  return (
    <div className="flex gap-1 items-center">
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id} className={className} disabled={disabled}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-background">
          {availableExercises.map((exercise) => (
            <SelectItem key={exercise.id} value={exercise.id}>
              {exercise.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="icon"
        variant="outline"
        type="button"
        onClick={onCreateNewExercise}
        disabled={disabled}
      >
        <Plus />
      </Button>
    </div>
  );
}
