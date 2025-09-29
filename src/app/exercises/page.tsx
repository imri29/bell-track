"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AddExerciseModal } from "@/components/add-exercise-modal";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/contexts/confirm-context";
import { api } from "@/trpc/react";

export default function ExercisesPage() {
  const utils = api.useUtils();
  const { confirm } = useConfirm();

  const {
    data: exercises,
    isPending: exercisesPending,
    error: exercisesError,
  } = api.exercise.getAll.useQuery();

  const { mutate: deleteExercise, isPending: isDeleting } =
    api.exercise.delete.useMutation({
      onSuccess: () => {
        utils.exercise.getAll.invalidate();
      },
    });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async ({ name, id }: { name: string; id: string }) => {
    const confirmed = await confirm({
      title: "Delete Exercise",
      description: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      deleteExercise({ id });
    }
  };

  return (
    <div className="p-4 md:p-8 w-full">
      <main className="max-w-4xl mx-auto">
        <AddExerciseModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Bell Track</h1>
            <p className="text-xl text-muted-foreground">
              Kettlebell Workout Tracker
            </p>
          </div>
          <Button className="gap-1.5" onClick={() => setIsModalOpen(true)}>
            <Plus />
            Add Exercise
          </Button>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-muted rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Kettlebell exercises list
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Exercises:</h3>
                {exercisesPending ? (
                  <p>Loading...</p>
                ) : exercisesError ? (
                  <p>error getting exercises</p>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {exercises.map((exercise) => (
                      <li key={exercise.id} className={"flex flex-col group"}>
                        <div className={"flex gap-2"}>
                          <strong>{exercise.name}</strong>
                          <Button
                            className={
                              "opacity-0 group-hover:opacity-100 transition-opacity duration-500 h-6 w-6 p-0 hover:bg-red-50 hover:text-red-700"
                            }
                            variant={"ghost"}
                            onClick={() => handleDelete(exercise)}
                            disabled={isDeleting}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                        {!!exercise.subExercises?.length && (
                          <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                            {exercise.subExercises.map((subExercise, index) => (
                              <li
                                key={`${exercise.id}-${index}`}
                                className="text-muted-foreground"
                              >
                                <strong>{subExercise.reps}</strong>{" "}
                                {subExercise.exerciseName}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
