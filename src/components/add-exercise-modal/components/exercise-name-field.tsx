"use client";

import { useId } from "react";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";

interface ExerciseNameFieldProps<TFieldValues extends FieldValues> {
  register: UseFormRegister<TFieldValues>;
  errorMessage?: string;
  placeholder?: string;
  namePath?: Path<TFieldValues>;
}

export function ExerciseNameField<TFieldValues extends FieldValues>({
  register,
  errorMessage,
  placeholder = "Enter exercise name",
  namePath,
}: ExerciseNameFieldProps<TFieldValues>) {
  const nameId = useId();
  const resolvedNamePath = namePath ?? ("name" as Path<TFieldValues>);

  return (
    <div className="space-y-2">
      <label htmlFor={nameId} className="text-sm font-medium">
        Exercise Name
      </label>
      <Input
        id={nameId}
        placeholder={placeholder}
        {...register(resolvedNamePath, {
          required: "Exercise name is required",
        })}
        className={errorMessage ? "border-red-500" : ""}
      />
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
    </div>
  );
}
