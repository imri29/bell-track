"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useId } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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

export default function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const utils = api.useUtils();
  const { id } = use(params);
  const { data: exercises } = api.exercise.getAll.useQuery();
  const { data: template, isPending: templateLoading } =
    api.template.getById.useQuery({ id });

  const nameId = useId();
  const descriptionId = useId();
  const exerciseSelectId = useId();

  const {
    register,
    handleSubmit,
    control,
    reset,
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

  // Reset form when template data loads
  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        description: template.description || "",
        exercises: template.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight || undefined,
          restTime: ex.restTime || undefined,
          notes: ex.notes || "",
          group: ex.group || "",
          order: ex.order,
        })),
      });
    }
  }, [template, reset]);

  const updateTemplate = api.template.update.useMutation({
    onSuccess: () => {
      utils.template.getAll.invalidate();
      utils.template.getById.invalidate({ id });
      router.push("/templates");
    },
  });

  const onSubmit = (data: TemplateFormData) => {
    // Transform exercises with proper order
    const exercises = data.exercises.map((exercise, index) => ({
      ...exercise,
      order: index,
    }));

    updateTemplate.mutate({
      id,
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

  if (templateLoading) {
    return (
      <div className="p-4 md:p-8 w-full">
        <main className="max-w-4xl mx-auto">
          <p>Loading template...</p>
        </main>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-4 md:p-8 w-full">
        <main className="max-w-4xl mx-auto">
          <p>Template not found</p>
          <Button asChild className="mt-4">
            <Link href="/templates">Back to Templates</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <main className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Edit Template</h1>
            <p className="text-xl text-muted-foreground">
              Update your workout template
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/templates">Cancel</Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="p-6 bg-muted rounded-lg space-y-6">
            <h2 className="text-2xl font-semibold">Template Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor={nameId} className="text-sm font-medium">
                  Template Name *
                </label>
                <Input
                  id={nameId}
                  placeholder="e.g., Upper Body Push, Leg Day"
                  {...register("name", {
                    required: "Template name is required",
                  })}
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
            </div>
          </div>

          <div className="p-6 bg-muted rounded-lg space-y-6">
            <h2 className="text-2xl font-semibold">Add Exercises</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor={exerciseSelectId}
                  className="text-sm font-medium"
                >
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
                  <SelectTrigger
                    id={exerciseSelectId}
                    className="bg-background"
                  >
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
                <label
                  htmlFor={exerciseSelectId}
                  className="text-sm font-medium"
                >
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
                  <SelectTrigger
                    id={exerciseSelectId}
                    className="bg-background"
                  >
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Template Exercises</h3>
                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const exercise = exercises?.find(
                      (ex) => ex.id === field.exerciseId,
                    );
                    return (
                      <div
                        key={field.id}
                        className="p-4 bg-background rounded border space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-lg">
                            {exercise?.name}
                          </h4>
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

                        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                          <div className="space-y-2">
                            <label
                              htmlFor={`sets-${index}`}
                              className="text-sm font-medium"
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
                            <div className="space-y-2">
                              <label
                                htmlFor={`reps-${index}`}
                                className="text-sm font-medium"
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
                          <div className="space-y-2">
                            <label
                              htmlFor={`group-${index}`}
                              className="text-sm font-medium"
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
                          <div className="space-y-2">
                            <label
                              htmlFor={`weight-${index}`}
                              className="text-sm font-medium"
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
                          <div className="space-y-2">
                            <label
                              htmlFor={`rest-${index}`}
                              className="text-sm font-medium"
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
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor={`notes-${index}`}
                            className="text-sm font-medium"
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
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button asChild type="button" variant="outline">
              <Link href="/templates">Cancel</Link>
            </Button>
            <Button type="submit" disabled={updateTemplate.isPending}>
              {updateTemplate.isPending ? "Updating..." : "Update Template"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
