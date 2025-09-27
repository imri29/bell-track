"use client";

import { useId } from "react";
import { Textarea } from "@/components/ui/textarea";
import type { UseFormRegister, FieldValues } from "react-hook-form";

interface ExerciseDescriptionFieldProps {
  register: UseFormRegister<FieldValues>;
  placeholder?: string;
}

export function ExerciseDescriptionField({
  register,
  placeholder = "Enter exercise description"
}: ExerciseDescriptionFieldProps) {
  const descriptionId = useId();

  return (
    <div className="space-y-2">
      <label htmlFor={descriptionId} className="text-sm font-medium">
        Description
      </label>
      <Textarea
        id={descriptionId}
        placeholder={placeholder}
        {...register("description")}
      />
    </div>
  );
}