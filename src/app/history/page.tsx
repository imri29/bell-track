"use client";

import { BookOpen, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AddWorkoutModal } from "@/components/add-workout-modal";
import { EditWorkoutModal } from "@/components/edit-workout-modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirm } from "@/contexts/confirm-context";
import { templateToFormData } from "@/lib/template-utils";
import type { RouterOutputs } from "@/server/api/root";
import { api } from "@/trpc/react";
import type { TemplateData } from "@/types";

type WorkoutWithExercises = RouterOutputs["workout"]["getAll"][number];

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
              {exercise.exercise.name} • {exercise.sets} sets •{" "}
              {exercise.weight}kg
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function WorkoutsPage() {
  const utils = api.useUtils();
  const { confirm } = useConfirm();

  const {
    data: workouts,
    isPending: workoutsPending,
    error: workoutsError,
  } = api.workout.getAll.useQuery();

  const { mutate: deleteWorkout, isPending: isDeleting } =
    api.workout.delete.useMutation({
      onSuccess: () => {
        utils.workout.getAll.invalidate();
      },
    });

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(
    null,
  );
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [editingWorkout, setEditingWorkout] =
    useState<WorkoutWithExercises | null>(null);

  // Derived state
  const isAddModalOpen = isCreatingWorkout || selectedTemplate !== null;

  const { data: templates } = api.template.getAll.useQuery();

  const handleEdit = (workout: WorkoutWithExercises) => {
    setEditingWorkout(workout);
  };

  const handleCloseEditModal = () => {
    setEditingWorkout(null);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find((t) => t.id === templateId);
    if (template) {
      const formData = templateToFormData(template);
      setSelectedTemplate(formData);
    }
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      setSelectedTemplate(null);
      setIsCreatingWorkout(false);
    }
  };

  const handleDelete = async (workout: { id: string; date: string }) => {
    const confirmed = await confirm({
      title: "Delete Workout",
      description: `Are you sure you want to delete the workout from ${new Date(workout.date).toLocaleDateString()}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      deleteWorkout({ id: workout.id });
    }
  };

  return (
    <div className="p-4 md:p-8 w-full">
      <main className="max-w-4xl mx-auto">
        <AddWorkoutModal
          isOpen={isAddModalOpen}
          onOpenChange={handleModalClose}
          templateData={selectedTemplate || undefined}
        />
        <EditWorkoutModal
          isOpen={editingWorkout !== null}
          onOpenChange={(open) => {
            if (!open) handleCloseEditModal();
          }}
          workout={editingWorkout}
        />

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Workout history</h1>
            <p className="text-xl text-muted-foreground">
              View and manage your workout history
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="gap-1.5" onClick={() => setIsCreatingWorkout(true)}>
              <Plus />
              Add Workout
            </Button>
            <Select value="" onValueChange={handleTemplateSelect}>
              <SelectTrigger className="w-auto gap-1.5 px-3 py-2 h-10 border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer">
                <BookOpen className="h-4 w-4" />
                <SelectValue placeholder="Add from Template" />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-muted rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Your Workouts</h2>
            <div className="space-y-4">
              {workoutsPending ? (
                <p>Loading workouts...</p>
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
                            {new Date(workout.date).toLocaleDateString()}
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
                            onClick={() => handleEdit(workout)}
                            className="gap-1.5"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(workout)}
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
                  No workouts yet. Click "Add Workout" to create your first
                  workout plan.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
