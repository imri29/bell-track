import { useId } from "react";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Switch } from "@/components/ui/switch";
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
            <Switch
              id={unitId}
              aria-label={label}
              disabled={disabled}
              checked={field.value === EXERCISE_UNITS.TIME}
              onCheckedChange={(checked) =>
                field.onChange(
                  checked ? EXERCISE_UNITS.TIME : EXERCISE_UNITS.REPS,
                )
              }
            />
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
