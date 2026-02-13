"use client";

import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { ComplexNameTooltip } from "@/components/complex-name-tooltip";
import { SessionCard } from "@/components/session-card";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
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

function WorkoutExercisesList({ exercises }: { exercises: WorkoutWithExercises["exercises"] }) {
  return (
    <SessionCard.ExerciseList
      className="mt-3"
      exercises={exercises}
      renderItem={({ exercise, displayLabel }) => (
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
      )}
    />
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
              <SessionCard.Root key={workout.id} className="group">
                <SessionCard.Header>
                  <div>
                    <SessionCard.Title>
                      {workoutDateLabel}
                      {workout.duration && ` • ${workout.duration} min`}
                    </SessionCard.Title>
                    <SessionCard.Subtitle>
                      {workout.exercises.length} exercise
                      {workout.exercises.length !== 1 ? "s" : ""}
                    </SessionCard.Subtitle>
                    {workout.notes && (
                      <SessionCard.Description>{workout.notes}</SessionCard.Description>
                    )}
                  </div>
                  <SessionCard.Actions>
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
                  </SessionCard.Actions>
                </SessionCard.Header>
                <SessionCard.Tags tags={workout.tags} />
                <WorkoutExercisesList exercises={workout.exercises} />
              </SessionCard.Root>
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
