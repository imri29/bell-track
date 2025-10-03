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
}

export function ExerciseSelect({
  value = "",
  onValueChange,
  placeholder = "Add individual exercise",
  excludeIds = [],
  id,
  className,
  onCreateNewExercise,
}: ExerciseSelectProps) {
  const { data: exercises } = api.exercise.getAll.useQuery();

  const availableExercises =
    exercises?.filter(
      (ex) => ex.type === "EXERCISE" && !excludeIds.includes(ex.id),
    ) || [];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-background">
        <div className="p-1">
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-start h-8 px-2 py-1.5 text-sm"
            onClick={onCreateNewExercise}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Exercise
          </Button>
        </div>
        {availableExercises.map((exercise) => (
          <SelectItem key={exercise.id} value={exercise.id}>
            {exercise.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
