import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ExerciseUnit } from "@/types";

type SummaryExercise = {
  id: string;
  sets: number;
  unit: ExerciseUnit;
  reps: string;
  weight: number | null;
  group?: string | null;
  order: number;
  sectionTitle?: string | null;
  exercise: {
    name: string;
    type: string;
    subExercises: string | null;
  };
};

type RenderContext = {
  exercise: SummaryExercise;
  displayLabel: string;
};

type SectionedExerciseListProps = {
  exercises: SummaryExercise[];
  renderItem: (context: RenderContext) => ReactNode;
  maxItems?: number;
  className?: string;
  dividerClassName?: string;
  sectionTitleClassName?: string;
  remainingCountClassName?: string;
  getRemainingText?: (remainingCount: number) => string;
};

export function SectionedExerciseList({
  exercises,
  renderItem,
  maxItems,
  className,
  dividerClassName,
  sectionTitleClassName,
  remainingCountClassName,
  getRemainingText,
}: SectionedExerciseListProps) {
  const sortedExercises = [...exercises].sort((a, b) => {
    if (a.group && b.group && a.group !== b.group) {
      return a.group.localeCompare(b.group);
    }

    return a.order - b.order;
  });

  const visibleExercises =
    typeof maxItems === "number" ? sortedExercises.slice(0, maxItems) : sortedExercises;
  const remainingCount = sortedExercises.length - visibleExercises.length;

  return (
    <div className={cn("space-y-1", className)}>
      {visibleExercises.map((exercise, index) => {
        let displayLabel = "";
        const sectionTitle = exercise.sectionTitle?.trim();
        const previousSectionTitle = visibleExercises[index - 1]?.sectionTitle?.trim();
        const showSectionHeader = Boolean(sectionTitle) && sectionTitle !== previousSectionTitle;
        const showDivider =
          index > 0 && exercise.group && visibleExercises[index - 1]?.group !== exercise.group;

        if (exercise.group) {
          const groupIndex = visibleExercises
            .slice(0, index + 1)
            .filter((ex) => ex.group === exercise.group).length;
          displayLabel = `${exercise.group}${groupIndex}`;
        }

        return (
          <div key={exercise.id}>
            {showDivider && <div className={cn("my-2 border-t border-border", dividerClassName)} />}
            {showSectionHeader && (
              <p
                className={cn(
                  "mb-1 text-xs font-semibold uppercase tracking-wide text-primary/90",
                  sectionTitleClassName,
                )}
              >
                {sectionTitle}
              </p>
            )}
            {renderItem({ exercise, displayLabel })}
          </div>
        );
      })}
      {remainingCount > 0 && (
        <div className={cn("pt-1 text-xs text-muted-foreground italic", remainingCountClassName)}>
          {getRemainingText
            ? getRemainingText(remainingCount)
            : `and ${remainingCount} more exercise${remainingCount > 1 ? "s" : ""}`}
        </div>
      )}
    </div>
  );
}
