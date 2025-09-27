"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ExerciseModal } from "@/components/add-exercise-modal";
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
}

export function ExerciseSelect({
  value = "",
  onValueChange,
  placeholder = "Add individual exercise",
  excludeIds = [],
  id,
  className,
}: ExerciseSelectProps) {
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const utils = api.useUtils();
  const { data: exercises } = api.exercise.getAll.useQuery();

  const handleExerciseCreated = async () => {
    // Refetch exercises data so the new exercise appears in the dropdown
    await utils.exercise.getAll.invalidate();
  };

  const availableExercises =
    exercises?.filter(
      (ex) => ex.type === "EXERCISE" && !excludeIds.includes(ex.id),
    ) || [];

  return (
    <>
      <ExerciseModal.Simple
        isOpen={isExerciseModalOpen}
        onOpenChange={setIsExerciseModalOpen}
        onExerciseCreated={handleExerciseCreated}
      />
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExerciseModalOpen(true);
              }}
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
    </>
  );
}
