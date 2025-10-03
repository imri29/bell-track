"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  AddComplexExerciseModal,
  AddExerciseModal,
} from "@/components/add-exercise-modal";
import { ComplexNameTooltip } from "@/components/complex-name-tooltip";
import { ComplexSelect } from "@/components/complex-select";
import { ExerciseSelect } from "@/components/exercise-select";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildExerciseFormDefaults } from "@/lib/exercise-form-defaults";
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

export default function NewTemplatePage() {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: exercises } = api.exercise.getAll.useQuery();

  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [isAddComplexModalOpen, setIsAddComplexModalOpen] = useState(false);

  // Form IDs for accessibility
  const nameId = useId();
  const descriptionId = useId();
  const exerciseSelectId = useId();
  const complexSelectId = useId();

  const {
    register,
    handleSubmit,
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
      router.push("/templates");
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
      append(buildExerciseFormDefaults(exercise, fields.length));
    }
  };

  return (
    <PageShell withGlow={false} mainClassName="max-w-4xl gap-8">
      <AddExerciseModal
        isOpen={isAddExerciseModalOpen}
        onOpenChange={setIsAddExerciseModalOpen}
      />
      <AddComplexExerciseModal
        isOpen={isAddComplexModalOpen}
        onOpenChange={setIsAddComplexModalOpen}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold leading-tight text-foreground">
            Create new template
          </h1>
          <p className="text-sm text-muted-foreground">
            Build a reusable workout template.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/templates">Cancel</Link>
        </Button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            const target = event.target as HTMLElement;
            if (
              target.tagName !== "BUTTON" ||
              (target as HTMLButtonElement).type !== "submit"
            ) {
              event.preventDefault();
            }
          }
        }}
        className="space-y-8"
      >
        <div className="space-y-6 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
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

        <div className="space-y-6 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Add Exercises</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor={exerciseSelectId} className="text-sm font-medium">
                Select Exercise
              </label>
              <ExerciseSelect
                onValueChange={(value) => {
                  if (value) {
                    addExercise(value);
                  }
                }}
                excludeIds={fields.map((field) => field.exerciseId)}
                id={exerciseSelectId}
                className="bg-background"
                placeholder="Add individual exercise"
                onCreateNewExercise={() => setIsAddExerciseModalOpen(true)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={exerciseSelectId} className="text-sm font-medium">
                Select Complex
              </label>
              <ComplexSelect
                onValueChange={(value) => {
                  if (value) {
                    addExercise(value);
                  }
                }}
                excludeIds={fields.map((field) => field.exerciseId)}
                id={complexSelectId}
                className="bg-background"
                placeholder="Add complex exercise"
                onCreateNewComplex={() => setIsAddComplexModalOpen(true)}
              />
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
                      className="space-y-4 rounded-2xl border border-border/60 bg-background/80 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-lg">
                          {exercise ? (
                            <ComplexNameTooltip
                              name={exercise.name}
                              subExercises={exercise.subExercises}
                              className="inline-flex"
                            />
                          ) : (
                            "Exercise"
                          )}
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
        <div className="flex justify-end gap-4 border-t border-border/60 pt-6">
          <Button asChild type="button" variant="outline">
            <Link href="/templates">Cancel</Link>
          </Button>
          <Button type="submit" disabled={createTemplate.isPending}>
            {createTemplate.isPending ? "Creating..." : "Create Template"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
