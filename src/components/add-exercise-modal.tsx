"use client";

import { useId, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

// Zod schema for form validation
const subExerciseSchema = z.object({
  exerciseName: z.string().min(1, "Exercise name required"),
  reps: z.number().min(1, "Reps must be at least 1"),
});

const exerciseFormSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  type: z.enum(["EXERCISE", "COMPLEX"]),
  description: z.string(),
  subExercises: z.array(subExerciseSchema).default([]),
});

interface AddExerciseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddExerciseModal({
  isOpen,
  onOpenChange,
}: AddExerciseModalProps) {
  const utils = api.useUtils();

  const { data: exercises } = api.exercise.getAll.useQuery();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "EXERCISE" as "EXERCISE" | "COMPLEX",
    description: "",
    selectedExercises: [] as string[], // Exercise IDs for complex
  });

  const [repSchemes, setRepSchemes] = useState<Record<string, number>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form IDs for accessibility
  const nameId = useId();
  const typeId = useId();
  const exerciseSelectId = useId();
  const descriptionId = useId();

  const createExercise = api.exercise.create.useMutation({
    onSuccess: () => {
      utils.exercise.getAll.invalidate();
      // Reset form and close modal
      setFormData({
        name: "",
        type: "EXERCISE" as "EXERCISE" | "COMPLEX",
        description: "",
        selectedExercises: [],
      });
      setRepSchemes({});
      setFormErrors({});
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Build subExercises for complex exercises
    const subExercises =
      formData.type === "COMPLEX"
        ? formData.selectedExercises.map((exerciseId) => {
            const exercise = exercises?.find((ex) => ex.id === exerciseId);
            return {
              exerciseName: exercise?.name || "",
              reps: repSchemes[exerciseId] || 0,
            };
          })
        : undefined;

    // Create submission data
    const submitData = {
      name: formData.name,
      type: formData.type,
      description: formData.description,
      subExercises,
    };

    // Validate with Zod
    const result = exerciseFormSchema.safeParse(submitData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      });
      setFormErrors(errors);
      return;
    }

    createExercise.mutate(result.data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Exercise</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={nameId} className="text-sm font-medium">
              Exercise Name
            </label>
            <Input
              id={nameId}
              placeholder="Enter exercise name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                // Clear error when user starts typing
                if (formErrors.name) {
                  setFormErrors({ ...formErrors, name: "" });
                }
              }}
              required
              className={formErrors.name ? "border-red-500" : ""}
            />
            {formErrors.name && (
              <p className="text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor={typeId} className="text-sm font-medium">
              Type
            </label>
            <Select
              value={formData.type}
              onValueChange={(value: "EXERCISE" | "COMPLEX") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select exercise type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="EXERCISE">Exercise</SelectItem>
                <SelectItem value="COMPLEX">Complex</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Complex Exercise Fields */}
          {formData.type === "COMPLEX" && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-sm">Complex Exercise Setup</h4>

              {/* Exercise Selection */}
              <div className="space-y-2">
                <label
                  htmlFor={exerciseSelectId}
                  className="text-sm font-medium"
                >
                  Select Exercises
                </label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !formData.selectedExercises.includes(value)) {
                      setFormData({
                        ...formData,
                        selectedExercises: [
                          ...formData.selectedExercises,
                          value,
                        ],
                      });
                    }
                  }}
                >
                  <SelectTrigger id={exerciseSelectId} className="bg-white">
                    <SelectValue placeholder="Add exercises to complex" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {exercises
                      ?.filter(
                        (ex) =>
                          ex.type === "EXERCISE" &&
                          !formData.selectedExercises.includes(ex.id),
                      )
                      .map((exercise) => (
                        <SelectItem key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Exercises with Rep Schemes */}
              {formData.selectedExercises.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    Exercise Sequence & Reps
                  </div>
                  <div className="space-y-2">
                    {formData.selectedExercises.map((exerciseId, index) => {
                      const exercise = exercises?.find(
                        (ex) => ex.id === exerciseId,
                      );
                      return (
                        <div
                          key={exerciseId}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm font-medium w-4">
                            {index + 1}.
                          </span>
                          <span className="flex-1 text-sm">
                            {exercise?.name}
                          </span>
                          <input
                            type="number"
                            placeholder="Reps"
                            min="1"
                            className="w-20 px-2 py-1 text-sm border rounded"
                            value={repSchemes[exerciseId] || ""}
                            onChange={(e) =>
                              setRepSchemes({
                                ...repSchemes,
                                [exerciseId]: parseInt(e.target.value, 10) || 0,
                              })
                            }
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                selectedExercises:
                                  formData.selectedExercises.filter(
                                    (id) => id !== exerciseId,
                                  ),
                              });
                              const newRepSchemes = { ...repSchemes };
                              delete newRepSchemes[exerciseId];
                              setRepSchemes(newRepSchemes);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor={descriptionId} className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id={descriptionId}
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
              onClick={() => onOpenChange(false)}
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
  );
}
