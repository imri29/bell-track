"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { AddComplexExerciseModal } from "@/components/add-exercise-modal";
import { ComplexNameTooltip } from "@/components/complex-name-tooltip";
import { Button } from "@/components/ui/button";
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
}

export function ComplexSelect({
  value = "",
  onValueChange,
  placeholder = "Add complex exercise",
  excludeIds = [],
  id,
  className,
}: ComplexSelectProps) {
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const { data: exercises } = api.exercise.getAll.useQuery();

  const handleExerciseCreated = () => {
    // The exercise list should refresh automatically from the mutation onSuccess
  };

  const availableComplexes =
    exercises?.filter(
      (ex) => ex.type === "COMPLEX" && !excludeIds.includes(ex.id),
    ) || [];

  return (
    <>
      <AddComplexExerciseModal
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
              variant="ghost"
              className="w-full justify-start h-8 px-2 py-1.5 text-sm"
              onClick={() => setIsExerciseModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Exercise
            </Button>
          </div>
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
    </>
  );
}
