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
  const isCompact = !showLabels;

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
              "inline-flex items-center rounded-md border border-input bg-muted/40 p-0.5 text-xs font-medium",
              isCompact && "text-[10px]",
              triggerClassName,
            )}
            aria-label={label}
          >
            <button
              id={unitId}
              type="button"
              disabled={disabled}
              aria-pressed={field.value === EXERCISE_UNITS.REPS}
              className={cn(
                "rounded-sm px-2 py-0.5 transition-colors",
                isCompact && "px-1.5",
                field.value === EXERCISE_UNITS.REPS
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
                disabled && "cursor-not-allowed opacity-50",
              )}
              onClick={() => field.onChange(EXERCISE_UNITS.REPS)}
            >
              {EXERCISE_UNIT_LABELS.REPS}
            </button>
            <button
              type="button"
              disabled={disabled}
              aria-pressed={field.value === EXERCISE_UNITS.TIME}
              className={cn(
                "rounded-sm px-2 py-0.5 transition-colors",
                isCompact && "px-1.5",
                field.value === EXERCISE_UNITS.TIME
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
                disabled && "cursor-not-allowed opacity-50",
              )}
              onClick={() => field.onChange(EXERCISE_UNITS.TIME)}
            >
              {EXERCISE_UNIT_LABELS.TIME}
            </button>
          </fieldset>
        </div>
      )}
    />
  );
}
