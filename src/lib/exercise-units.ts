import {
  EXERCISE_UNIT_LABELS,
  EXERCISE_UNITS,
  type ExerciseUnit,
} from "@/types";

type UnitLike = ExerciseUnit | string | undefined | null;

type FormatOptions = {
  compact?: boolean;
};

export function getExerciseUnitLabel(unit: UnitLike) {
  return unit === EXERCISE_UNITS.TIME
    ? EXERCISE_UNIT_LABELS.TIME
    : EXERCISE_UNIT_LABELS.REPS;
}

export function getExerciseUnitPlaceholder(unit: UnitLike) {
  return unit === EXERCISE_UNITS.TIME ? "60 or 60,45,30" : "12 or 12,10,8";
}

export function formatExerciseUnitValue(
  value: string,
  unit: UnitLike,
  options?: FormatOptions,
) {
  if (!value) {
    return value;
  }

  if (unit === EXERCISE_UNITS.TIME) {
    return options?.compact ? `${value}s` : `${value} sec`;
  }

  return value;
}
