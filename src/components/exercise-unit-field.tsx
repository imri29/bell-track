import { useId } from "react";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { EXERCISE_UNIT_LABELS, EXERCISE_UNITS } from "@/types";

interface ExerciseUnitFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  disabled?: boolean;
  label?: string;
  labelClassName?: string;
  triggerClassName?: string;
  hideLabel?: boolean;
  showLabels?: boolean;
  containerClassName?: string;
}

export function ExerciseUnitField<TFieldValues extends FieldValues>({
  control,
  name,
  disabled,
  label = "Track by",
  labelClassName,
  triggerClassName,
  hideLabel = false,
  showLabels = true,
  containerClassName,
}: ExerciseUnitFieldProps<TFieldValues>) {
  const unitId = useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={cn("space-y-2", containerClassName)}>
          {!hideLabel && (
            <label
              htmlFor={unitId}
              className={cn("text-sm font-medium", labelClassName)}
            >
              {label}
            </label>
          )}
          <fieldset
            className={cn(
              "inline-flex items-center gap-2 text-xs font-medium",
              triggerClassName,
            )}
            aria-label={label}
          >
            {showLabels && (
              <span
                className={cn(
                  "transition-colors",
                  field.value === EXERCISE_UNITS.REPS
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {EXERCISE_UNIT_LABELS.REPS}
              </span>
            )}
            <button
              id={unitId}
              type="button"
              role="switch"
              aria-checked={field.value === EXERCISE_UNITS.TIME}
              aria-label={label}
              disabled={disabled}
              onClick={() =>
                field.onChange(
                  field.value === EXERCISE_UNITS.TIME
                    ? EXERCISE_UNITS.REPS
                    : EXERCISE_UNITS.TIME,
                )
              }
              className={cn(
                "relative inline-flex h-4 w-7 items-center rounded-full border border-border bg-muted transition-opacity",
                disabled && "opacity-50",
              )}
            >
              <span
                className={cn(
                  "inline-block h-3 w-3 rounded-full bg-foreground transition-transform",
                  field.value === EXERCISE_UNITS.TIME
                    ? "translate-x-3.5"
                    : "translate-x-0.5",
                )}
              />
            </button>
            {showLabels && (
              <span
                className={cn(
                  "transition-colors",
                  field.value === EXERCISE_UNITS.TIME
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {EXERCISE_UNIT_LABELS.TIME}
              </span>
            )}
          </fieldset>
        </div>
      )}
    />
  );
}
