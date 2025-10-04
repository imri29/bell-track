"use client";

import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { ComplexNameTooltip } from "@/components/complex-name-tooltip";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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

function WorkoutExercisesList({
  exercises,
}: {
  exercises: WorkoutWithExercises["exercises"];
}) {
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
        const showDivider =
          index > 0 &&
          exercise.group &&
          sortedExercises[index - 1]?.group !== exercise.group;

        if (exercise.group) {
          const groupIndex = sortedExercises
            .slice(0, index + 1)
            .filter((ex) => ex.group === exercise.group).length;
          displayLabel = `${exercise.group}${groupIndex}`;
        }

        return (
          <div key={exercise.id}>
            {showDivider && <div className="border-t border-border my-2" />}
            <div className="text-sm text-muted-foreground">
              {displayLabel && (
                <span className="font-medium text-foreground mr-1">
                  {displayLabel}:
                </span>
              )}
              <ComplexNameTooltip
                name={exercise.exercise.name}
                subExercises={exercise.exercise.subExercises}
                className="inline text-foreground font-medium"
              />
              {` • ${exercise.sets} sets • ${exercise.weight}kg`}
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
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="p-4 bg-background rounded border group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">
                    {format(new Date(workout.date), "dd/MM/yyyy")}
                    {workout.duration && ` • ${workout.duration} min`}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {workout.exercises.length} exercise
                    {workout.exercises.length !== 1 ? "s" : ""}
                  </p>
                  {workout.notes && (
                    <p className="text-sm mt-2">{workout.notes}</p>
                  )}
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
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(workout)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <WorkoutExercisesList exercises={workout.exercises} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No workouts yet. Click "Add Workout" to create your first workout
          plan.
        </p>
      )}
    </div>
  );
}
