"use client";

import { api } from "@/trpc/react";

export default function Home() {
  const hello = api.exercise.hello.useQuery({ text: "from tRPC" });
  const exercises = api.exercise.getAll.useQuery();

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Bell Track</h1>
        <p className="text-xl text-gray-600 mb-8">Kettlebell Workout Tracker</p>

        <div className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">tRPC Test</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Hello Query:</h3>
                {hello.data ? (
                  <p className="text-green-600">{hello.data.greeting}</p>
                ) : (
                  <p>Loading...</p>
                )}
              </div>

              <div>
                <h3 className="font-medium">Exercises:</h3>
                {exercises.data ? (
                  <ul className="list-disc list-inside space-y-1">
                    {exercises.data.map((exercise) => (
                      <li key={exercise.id}>
                        <strong>{exercise.name}</strong> -{" "}
                        {exercise.muscleGroups.join(", ")}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
