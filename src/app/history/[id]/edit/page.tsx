"use client";

import { format, isValid, parseISO } from "date-fns";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { WorkoutForm } from "@/components/workout-form";
import type { WorkoutFormSubmitData, WorkoutFormValues } from "@/components/workout-form-types";
import { api } from "@/trpc/react";

export default function EditWorkoutPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const workoutId = params?.id;
  const utils = api.useUtils();

  const {
    data: workout,
    isPending,
    error,
  } = api.workout.getById.useQuery(
    { id: workoutId ?? "" },
    {
      enabled: Boolean(workoutId),
    },
  );

  const initialValues = useMemo<WorkoutFormValues | undefined>(() => {
    if (!workout) {
      return undefined;
    }

    const sortedExercises = workout.exercises
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((exercise, index) => ({
        exerciseId: exercise.exerciseId,
        sets: exercise.sets,
        unit: exercise.unit ?? "REPS",
        reps: exercise.reps,
        weight: typeof exercise.weight === "number" ? exercise.weight : 0,
        restTime: typeof exercise.restTime === "number" ? exercise.restTime : undefined,
        notes: exercise.notes ?? undefined,
        group: exercise.group ?? undefined,
        order: index,
        sectionTitle: exercise?.sectionTitle,
      }));

    const rawDate = workout.date as unknown as string | Date;
    const parsedDate = rawDate instanceof Date ? rawDate : parseISO(rawDate);
    const workoutDate = isValid(parsedDate) ? parsedDate : new Date(rawDate);

    return {
      date: format(workoutDate, "yyyy-MM-dd"),
      duration: workout.duration ?? undefined,
      notes: workout.notes ?? "",
      exercises: sortedExercises,
      tagIds: workout.tags.map((tag) => tag.id),
    };
  }, [workout]);

  const updateWorkout = api.workout.update.useMutation({
    onSuccess: () => {
      if (!workoutId) {
        return;
      }

      utils.workout.getAll.invalidate();
      utils.workout.getById.invalidate({ id: workoutId });
      router.push("/history?view=list");
      router.refresh();
    },
  });

  const handleSubmit = (data: WorkoutFormSubmitData) => {
    if (!workoutId) {
      return;
    }

    updateWorkout.mutate({
      id: workoutId,
      ...data,
    });
  };

  const handleCancel = () => {
    router.push("/history?view=list");
  };

  return (
    <PageShell withGlow={false} mainClassName="max-w-4xl gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold leading-tight text-foreground">Edit workout</h1>
          <p className="text-sm text-muted-foreground">Update details for this session.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/history?view=list">Back to history</Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
        {isPending ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-44">
            <Spinner size="sm" variant="muted" />
            Loading workout...
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">
            Failed to load workout. Please try again later.
          </p>
        ) : !workout || !initialValues ? (
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find that workout. Head back to history and pick a different session.
          </p>
        ) : (
          <WorkoutForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel={updateWorkout.isPending ? "Saving..." : "Save changes"}
            isSubmitting={updateWorkout.isPending}
          />
        )}
      </div>
    </PageShell>
  );
}
