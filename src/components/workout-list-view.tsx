"use client";

import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { ComplexNameTooltip } from "@/components/complex-name-tooltip";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Spinner } from "@/components/ui/spinner";
import { getTagPalette } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/server/api/root";

type WorkoutWithExercises = RouterOutputs["workout"]["getAll"][number];

type WorkoutListViewProps = {
  workouts: WorkoutWithExercises[] | undefined;
  workoutsPending: boolean;
  workoutsError: unknown;
  onEdit: (workout: WorkoutWithExercises) => void;
  onDelete: (workout: { id: string; date: string }) => void;
  isDeleting: boolean;
};

function WorkoutExercisesList({ exercises }: { exercises: WorkoutWithExercises["exercises"] }) {
  const sortedExercises = [...exercises].sort((a, b) => {
    if (a.group && b.group && a.group !== b.group) {
      return a.group.localeCompare(b.group);
    }
    return a.order - b.order;
  });

  return (
    <div className="mt-3 space-y-1">
      {sortedExercises.map((exercise, index) => {
        let displayLabel = "";
        const sectionTitle = exercise.sectionTitle?.trim();
        const previousSectionTitle = sortedExercises[index - 1]?.sectionTitle?.trim();
        const showSectionHeader = Boolean(sectionTitle) && sectionTitle !== previousSectionTitle;
        const showDivider =
          index > 0 && exercise.group && sortedExercises[index - 1]?.group !== exercise.group;

        if (exercise.group) {
          const groupIndex = sortedExercises
            .slice(0, index + 1)
            .filter((ex) => ex.group === exercise.group).length;
          displayLabel = `${exercise.group}${groupIndex}`;
        }

        return (
          <div key={exercise.id}>
            {showDivider && <div className="border-t border-border my-2" />}
            {showSectionHeader && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary/90">
                {sectionTitle}
              </p>
            )}
            <div className="text-sm text-muted-foreground">
              {displayLabel && (
                <span className="font-medium text-foreground mr-1">{displayLabel}:</span>
              )}
              <ComplexNameTooltip
                name={exercise.exercise.name}
                subExercises={exercise.exercise.subExercises}
                className="inline text-foreground font-medium"
              />
              {!!exercise.sets && ` • ${exercise.sets} sets • ${exercise.weight}kg`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WorkoutListView({
  workouts,
  workoutsPending,
  workoutsError,
  onEdit,
  onDelete,
  isDeleting,
}: WorkoutListViewProps) {
  return (
    <div className="space-y-4">
      {workoutsPending ? (
        <div className="flex justify-center py-15">
          <Spinner size="lg" />
        </div>
      ) : workoutsError ? (
        <p>Error loading workouts</p>
      ) : workouts && workouts.length > 0 ? (
        <div className="space-y-3">
          {workouts.map((workout) => {
            const workoutDateLabel = format(new Date(workout.date), "dd/MM/yyyy");

            return (
              <div key={workout.id} className="p-4 bg-background rounded border group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {workoutDateLabel}
                      {workout.duration && ` • ${workout.duration} min`}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {workout.exercises.length} exercise
                      {workout.exercises.length !== 1 ? "s" : ""}
                    </p>
                    {workout.notes && <p className="text-sm mt-2">{workout.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(workout)}
                      className="gap-1.5"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <IconButton
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(workout)}
                      disabled={isDeleting}
                      aria-label={`Delete workout from ${workoutDateLabel}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
                {(workout.tags?.length ?? 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {workout.tags.map((tag) => {
                      const palette = getTagPalette(tag.slug);
                      return (
                        <span
                          key={tag.id}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium leading-tight",
                            palette.tint,
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn("h-2 w-2 shrink-0 rounded-full", palette.dot)}
                          />
                          {tag.name}
                        </span>
                      );
                    })}
                  </div>
                )}
                <WorkoutExercisesList exercises={workout.exercises} />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No workouts yet. Click "Add Workout" to create your first workout plan.
        </p>
      )}
    </div>
  );
}
