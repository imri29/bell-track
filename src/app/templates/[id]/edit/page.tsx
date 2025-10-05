"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useId, useMemo, useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { buildExerciseFormDefaults } from "@/lib/exercise-form-defaults";
import { getTagPalette } from "@/lib/tag-colors";
import { cn, normalizeRestTime } from "@/lib/utils";
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
  tagIds: string[];
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
  const {
    data: tags,
    isPending: tagsPending,
    error: tagsError,
  } = api.template.getTags.useQuery();
  const { data: template, isPending: templateLoading } =
    api.template.getById.useQuery({ id });

  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [isAddComplexModalOpen, setIsAddComplexModalOpen] = useState(false);

  const nameId = useId();
  const descriptionId = useId();
  const exerciseSelectId = useId();
  const complexSelectId = useId();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TemplateFormData>({
    defaultValues: {
      name: "",
      description: "",
      exercises: [],
      tagIds: [],
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
        exercises: template.exercises,
        tagIds: template.tags.map((tag) => tag.id),
      });
    }
  }, [template, reset]);

  const selectedTagIds = watch("tagIds");

  const toggleTagSelection = (tagId: string) => {
    setValue(
      "tagIds",
      selectedTagIds?.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...(selectedTagIds ?? []), tagId],
      { shouldDirty: true },
    );
  };

  const sortedTags = useMemo(() => {
    if (!tags) {
      return [];
    }
    return [...tags].sort((a, b) => a.name.localeCompare(b.name));
  }, [tags]);

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
      restTime: normalizeRestTime(exercise.restTime),
      order: index,
    }));

    updateTemplate.mutate({
      id,
      name: data.name,
      description: data.description || undefined,
      exercises,
      tagIds: data.tagIds,
    });
  };

  const addExercise = (exerciseId: string) => {
    const exercise = exercises?.find((ex) => ex.id === exerciseId);
    if (exercise && !fields.some((field) => field.exerciseId === exerciseId)) {
      append(buildExerciseFormDefaults(exercise, fields.length));
    }
  };

  if (templateLoading) {
    return (
      <PageShell withGlow={false} mainClassName="max-w-4xl">
        <p>Loading template...</p>
      </PageShell>
    );
  }

  if (!template) {
    return (
      <PageShell withGlow={false} mainClassName="max-w-4xl">
        <p>Template not found.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/templates">Back to templates</Link>
        </Button>
      </PageShell>
    );
  }

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
            Edit template
          </h1>
          <p className="text-sm text-muted-foreground">
            Update your workout template.
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Tags</h3>
              {selectedTagIds && selectedTagIds.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setValue("tagIds", [], { shouldDirty: true })}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Clear selection
                </button>
              ) : null}
            </div>
            {tagsError ? (
              <p className="text-sm text-destructive">
                Failed to load tags. You can update exercises now and add tags
                later.
              </p>
            ) : tagsPending ? (
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
                <Spinner size="sm" variant="muted" /> Loading tags...
              </div>
            ) : sortedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {sortedTags.map((tag) => {
                  const isSelected = selectedTagIds?.includes(tag.id) ?? false;
                  const palette = getTagPalette(tag.slug);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTagSelection(tag.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        isSelected
                          ? cn(
                              palette.tint,
                              "focus-visible:ring-offset-background",
                            )
                          : "border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40 focus-visible:ring-border",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-2 w-2 shrink-0 rounded-full",
                          palette.dot,
                          !isSelected && "opacity-60",
                        )}
                      />
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No tags available yet.
              </p>
            )}
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
                        <h4 className="text-lg font-medium">
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
                              setValueAs: (value) => {
                                if (
                                  value === "" ||
                                  value === null ||
                                  value === undefined
                                ) {
                                  return undefined;
                                }

                                const parsedValue = Number(value);
                                return Number.isNaN(parsedValue)
                                  ? undefined
                                  : parsedValue;
                              },
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
          <Button type="submit" disabled={updateTemplate.isPending}>
            {updateTemplate.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
