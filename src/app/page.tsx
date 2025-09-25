"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

export default function Home() {
  const utils = api.useUtils();

  const {
    data: exercises,
    isPending: exercisesPending,
    error: exercisesError,
  } = api.exercise.getAll.useQuery();

  const [isOpen, setIsOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "EXERCISE" as "EXERCISE" | "COMPLEX",
    description: "",
  });

  const createExercise = api.exercise.create.useMutation({
    onSuccess: () => {
      utils.exercise.getAll.invalidate();
      // Reset form and close modal
      setFormData({
        name: "",
        type: "EXERCISE" as "EXERCISE" | "COMPLEX",
        description: "",
      });
      setIsOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createExercise.mutate({
      name: formData.name,
      type: formData.type,
      description: formData.description,
    });
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="fixed top-4 right-4">Add Exercise</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Exercise</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Exercise Name
                </label>
                <Input
                  id="name"
                  placeholder="Enter exercise name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "EXERCISE" | "COMPLEX") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exercise type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="EXERCISE">Exercise</SelectItem>
                    <SelectItem value="COMPLEX">Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Enter exercise description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createExercise.isPending}>
                  {createExercise.isPending ? "Adding..." : "Add Exercise"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

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
