"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ExerciseClassificationValues = {
  movementGroup: "PUSH" | "PULL" | "CORE" | "LEGS" | null;
  movementPlane: "VERTICAL" | "HORIZONTAL" | null;
  legBias: "QUAD_DOMINANT" | "HAMSTRING_DOMINANT" | null;
};

interface ExerciseClassificationFieldsProps {
  value: ExerciseClassificationValues;
  onChange: <TKey extends keyof ExerciseClassificationValues>(
    key: TKey,
    nextValue: ExerciseClassificationValues[TKey],
  ) => void;
}

export function ExerciseClassificationFields({
  value,
  onChange,
}: ExerciseClassificationFieldsProps) {
  const selectField = (
    label: string,
    currentValue: string | null,
    options: Array<{ value: string; label: string }>,
    handleChange: (nextValue: string) => void,
  ) => (
    <div className="space-y-2 text-sm">
      <span className="font-medium">{label}</span>
      <Select
        value={currentValue ?? "UNCLASSIFIED"}
        onValueChange={(nextValue) => handleChange(nextValue === "UNCLASSIFIED" ? "" : nextValue)}
      >
        <SelectTrigger className="w-full" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="UNCLASSIFIED">Unclassified</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <fieldset className="space-y-3 rounded-lg border border-border/60 p-3">
      <legend className="px-1 text-sm font-medium">Movement classification</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {selectField(
          "Movement group",
          value.movementGroup,
          [
            { value: "PUSH", label: "Pushing" },
            { value: "PULL", label: "Pulling" },
            { value: "CORE", label: "Core" },
            { value: "LEGS", label: "Legs" },
          ],
          (nextValue) => {
            const group = (nextValue || null) as ExerciseClassificationValues["movementGroup"];
            onChange("movementGroup", group);
            if (group !== "PUSH" && group !== "PULL") onChange("movementPlane", null);
            if (group !== "LEGS") onChange("legBias", null);
          },
        )}
        {value.movementGroup === "PUSH" || value.movementGroup === "PULL"
          ? selectField(
              "Movement direction",
              value.movementPlane,
              [
                { value: "HORIZONTAL", label: "Horizontal" },
                { value: "VERTICAL", label: "Vertical" },
              ],
              (nextValue) =>
                onChange(
                  "movementPlane",
                  (nextValue || null) as ExerciseClassificationValues["movementPlane"],
                ),
            )
          : null}
        {value.movementGroup === "LEGS"
          ? selectField(
              "Leg emphasis",
              value.legBias,
              [
                { value: "QUAD_DOMINANT", label: "Quad dominant" },
                { value: "HAMSTRING_DOMINANT", label: "Hamstring dominant" },
              ],
              (nextValue) =>
                onChange("legBias", (nextValue || null) as ExerciseClassificationValues["legBias"]),
            )
          : null}
      </div>
      <p className="text-xs text-muted-foreground">
        Used to describe movement coverage in workout feedback and suggestions.
      </p>
    </fieldset>
  );
}
