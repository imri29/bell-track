"use client";

import { useId } from "react";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

interface ExerciseDescriptionFieldProps<TFieldValues extends FieldValues> {
  register: UseFormRegister<TFieldValues>;
  placeholder?: string;
  descriptionPath?: Path<TFieldValues>;
}

export function ExerciseDescriptionField<TFieldValues extends FieldValues>({
  register,
  placeholder = "Enter exercise description",
  descriptionPath,
}: ExerciseDescriptionFieldProps<TFieldValues>) {
  const descriptionId = useId();
  const resolvedDescriptionPath =
    descriptionPath ?? ("description" as Path<TFieldValues>);

  return (
    <div className="space-y-2">
      <label htmlFor={descriptionId} className="text-sm font-medium">
        Description
      </label>
      <Textarea
        id={descriptionId}
        placeholder={placeholder}
        {...register(resolvedDescriptionPath)}
      />
    </div>
  );
}
