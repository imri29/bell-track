"use client";

import { useState } from "react";
import { AddExerciseModal } from "@/components/add-exercise-modal";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export default function Home() {
  const {
    data: exercises,
    isPending: exercisesPending,
    error: exercisesError,
  } = api.exercise.getAll.useQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <Button
          className="fixed top-4 right-4"
          onClick={() => setIsModalOpen(true)}
        >
          Add Exercise
        </Button>

        <AddExerciseModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />

        <h1 className="text-4xl font-bold mb-8">Bell Track</h1>
        <p className="text-xl text-gray-600 mb-8">Kettlebell Workout Tracker</p>

        <div className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-lg">
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
                      <li key={exercise.id}>
                        <strong>{exercise.name}</strong>
                        {!!exercise.subExercises?.length && (
                          <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                            {exercise.subExercises.map((subExercise, index) => (
                              <li
                                key={`${exercise.id}-${index}`}
                                className="text-gray-600"
                              >
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
