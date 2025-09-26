"use client";

import { useId } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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

type TemplateExerciseFormData = {
  exerciseId: string;
  sets: number;
  reps: string;
  weight?: number;
  restTime?: number;
  notes?: string;
  group?: string;
  order: number;
};

type TemplateFormData = {
  name: string;
  description?: string;
  exercises: TemplateExerciseFormData[];
};

interface AddTemplateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTemplateModal({
  isOpen,
  onOpenChange,
}: AddTemplateModalProps) {
  const utils = api.useUtils();

  const { data: exercises } = api.exercise.getAll.useQuery();

  // Form IDs for accessibility
  const nameId = useId();
  const descriptionId = useId();
  const exerciseSelectId = useId();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TemplateFormData>({
    defaultValues: {
      name: "",
      description: "",
      exercises: [],
    },
  });

  // useFieldArray for managing exercises
  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  });

  const createTemplate = api.template.create.useMutation({
    onSuccess: () => {
      utils.template.getAll.invalidate();
      reset();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: TemplateFormData) => {
    // Transform exercises with proper order
    const exercises = data.exercises.map((exercise, index) => ({
      ...exercise,
      order: index,
    }));

    createTemplate.mutate({
      name: data.name,
      description: data.description || undefined,
      exercises,
    });
  };

  const addExercise = (exerciseId: string) => {
    const exercise = exercises?.find((ex) => ex.id === exerciseId);
    if (exercise && !fields.some((field) => field.exerciseId === exerciseId)) {
      append({
        exerciseId: exercise.id,
        sets: exercise.type === "COMPLEX" ? 5 : 3, // Complexes default to 5 sets
        reps: exercise.type === "COMPLEX" ? "1" : "12", // Complexes = 1 round, exercises = 12 reps
        weight: 16, // Default kettlebell weight
        restTime: exercise.type === "COMPLEX" ? 90 : 60, // Complexes need more rest
        notes: "",
        group: "",
        order: fields.length,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={nameId} className="text-sm font-medium">
              Template Name
            </label>
            <Input
              id={nameId}
              placeholder="e.g., Upper Body Push, Leg Day"
              {...register("name", { required: "Template name is required" })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor={descriptionId} className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id={descriptionId}
              placeholder="Optional description of this template"
              {...register("description")}
            />
          </div>

          {/* Exercise Selection */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-sm">Add Exercises</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor={exerciseSelectId} className="text-sm font-medium">
                  Select Exercise
                </label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value) {
                      addExercise(value);
                    }
                  }}
                >
                  <SelectTrigger id={exerciseSelectId} className="bg-background">
                    <SelectValue placeholder="Add individual exercise" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {exercises
                      ?.filter(
                        (ex) =>
                          ex.type === "EXERCISE" &&
                          !fields.some((field) => field.exerciseId === ex.id),
                      )
                      .map((exercise) => (
                        <SelectItem key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Select Complex
                </label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value) {
                      addExercise(value);
                    }
                  }}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Add complex exercise" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {exercises
                      ?.filter(
                        (ex) =>
                          ex.type === "COMPLEX" &&
                          !fields.some((field) => field.exerciseId === ex.id),
                      )
                      .map((exercise) => (
                        <SelectItem key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selected Exercises */}
            {fields.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Template Exercises</p>
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const exercise = exercises?.find(
                      (ex) => ex.id === field.exerciseId,
                    );
                    return (
                      <div
                        key={field.id}
                        className="p-3 bg-muted rounded border space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium">{exercise?.name}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-red-500"
                          >
                            Remove
                          </Button>
                        </div>

                        <div className={`grid gap-3 ${exercise?.type === "COMPLEX" ? "grid-cols-2" : "grid-cols-3"}`}>
                          <div className="space-y-1">
                            <label
                              htmlFor={`sets-${index}`}
                              className="text-xs font-medium"
                            >
                              Sets
                            </label>
                            <Input
                              id={`sets-${index}`}
                              type="number"
                              min="1"
                              {...register(`exercises.${index}.sets`, {
                                valueAsNumber: true,
                                required: "Sets required",
                                min: { value: 1, message: "Min 1 set" },
                              })}
                            />
                          </div>
                          {exercise?.type !== "COMPLEX" && (
                            <div className="space-y-1">
                              <label
                                htmlFor={`reps-${index}`}
                                className="text-xs font-medium"
                              >
                                Reps
                              </label>
                              <Input
                                id={`reps-${index}`}
                                placeholder="12 or 12,10,8"
                                {...register(`exercises.${index}.reps`, {
                                  required: "Reps required",
                                })}
                              />
                            </div>
                          )}
                          <div className="space-y-1">
                            <label
                              htmlFor={`group-${index}`}
                              className="text-xs font-medium"
                            >
                              Group
                            </label>
                            <Input
                              id={`group-${index}`}
                              placeholder="A, B, C..."
                              maxLength={1}
                              {...register(`exercises.${index}.group`)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label
                              htmlFor={`weight-${index}`}
                              className="text-xs font-medium"
                            >
                              Weight (kg)
                            </label>
                            <Input
                              id={`weight-${index}`}
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="Optional default"
                              {...register(`exercises.${index}.weight`, {
                                valueAsNumber: true,
                                min: { value: 0, message: "Min 0kg" },
                              })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label
                              htmlFor={`rest-${index}`}
                              className="text-xs font-medium"
                            >
                              Rest (sec)
                            </label>
                            <Input
                              id={`rest-${index}`}
                              type="number"
                              min="0"
                              placeholder="Optional"
                              {...register(`exercises.${index}.restTime`, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label
                              htmlFor={`notes-${index}`}
                              className="text-xs font-medium"
                            >
                              Notes
                            </label>
                            <Input
                              id={`notes-${index}`}
                              placeholder="Optional exercise notes"
                              {...register(`exercises.${index}.notes`)}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTemplate.isPending}>
              {createTemplate.isPending ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}