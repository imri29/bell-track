"use client";

import { format, formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/server/api/root";
import { EXERCISE_TYPE_LABELS } from "@/types";

export type ExerciseCardData = RouterOutputs["exercise"]["getAll"][number];

interface ExerciseCardProps extends ComponentPropsWithoutRef<"article"> {
  exercise: ExerciseCardData;
  onDelete?: (exercise: ExerciseCardData) => void;
  isDeleting?: boolean;
  onEdit?: (exercise: ExerciseCardData) => void;
}

export function ExerciseCard({
  exercise,
  className,
  onDelete,
  isDeleting,
  onEdit,
  ...articleProps
}: ExerciseCardProps) {
  const breakdownPreview = exercise.subExercises?.slice(0, 3) ?? [];
  const movementsTotal = exercise.subExercises?.length ?? 0;

  const createdAt = new Date(exercise.createdAt);
  const updatedAt = new Date(exercise.updatedAt);
  const createdLabel = Number.isNaN(createdAt.getTime())
    ? "—"
    : format(createdAt, "MMM d");
  const updatedLabel = Number.isNaN(updatedAt.getTime())
    ? null
    : formatDistanceToNow(updatedAt, { addSuffix: true });

  const handleDelete = () => {
    if (onDelete) {
      onDelete(exercise);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(exercise);
    }
  };

  const typeLabel =
    EXERCISE_TYPE_LABELS[exercise.type as keyof typeof EXERCISE_TYPE_LABELS] ??
    exercise.type;

  return (
    <article
      {...articleProps}
      className={cn(
        "group flex h-full flex-col rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-border hover:shadow-md",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h3 className="text-lg font-semibold leading-tight tracking-tight">
            {exercise.name}
          </h3>
          {exercise.description ? (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {exercise.description}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
            {typeLabel}
          </span>
          {onEdit ? (
            <IconButton
              type="button"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={handleEdit}
              aria-label="Edit exercise"
            >
              <Pencil className="h-4 w-4" />
            </IconButton>
          ) : null}
          {onDelete ? (
            <IconButton
              type="button"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Delete exercise"
            >
              <Trash2 className="h-4 w-4" />
            </IconButton>
          ) : null}
          {!onEdit && !onDelete ? (
            <MoreHorizontal className="h-5 w-5 text-muted-foreground/70" />
          ) : null}
        </div>
      </header>

      {movementsTotal > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Breakdown
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {breakdownPreview.map((movement, index) => (
              <li
                key={`${movement.exerciseName}-${index}`}
                className="flex items-center gap-2"
              >
                <span className="font-semibold text-foreground">
                  {movement.reps}
                </span>
                <span className="truncate" title={movement.exerciseName}>
                  {movement.exerciseName}
                </span>
              </li>
            ))}
          </ul>
          {movementsTotal > breakdownPreview.length ? (
            <p className="text-xs text-muted-foreground">
              +{movementsTotal - breakdownPreview.length} more movements
            </p>
          ) : null}
        </div>
      ) : null}

      <footer className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
        <span>Created {createdLabel}</span>
        {updatedLabel ? <span>Updated {updatedLabel}</span> : null}
      </footer>
    </article>
  );
}
