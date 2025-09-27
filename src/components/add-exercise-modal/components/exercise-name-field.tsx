"use client";

import { useId } from "react";
import type { FieldError, FieldValues, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";

interface ExerciseNameFieldProps {
  register: UseFormRegister<FieldValues>;
  error?: FieldError;
  placeholder?: string;
}

export function ExerciseNameField({
  register,
  error,
  placeholder = "Enter exercise name",
}: ExerciseNameFieldProps) {
  const nameId = useId();

  return (
    <div className="space-y-2">
      <label htmlFor={nameId} className="text-sm font-medium">
        Exercise Name
      </label>
      <Input
        id={nameId}
        placeholder={placeholder}
        {...register("name", { required: "Exercise name is required" })}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
