"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { AddExerciseModal } from "@/components/add-exercise-modal";
import { ExerciseCard } from "@/components/exercises/exercise-card";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/contexts/confirm-context";
import { api } from "@/trpc/react";

const SKELETON_PLACEHOLDERS = [
  "warmup",
  "strength",
  "power",
  "complex",
  "finisher",
  "cooldown",
];

export default function ExercisesPage() {
  const utils = api.useUtils();
  const { confirm } = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const {
    data: exercises,
    isPending,
    error,
    refetch,
  } = api.exercise.getAll.useQuery();

  const { mutate: deleteExercise } = api.exercise.delete.useMutation({
    onMutate: ({ id }) => {
      setPendingDeleteId(id);
    },
    onSuccess: () => {
      void utils.exercise.getAll.invalidate();
    },
    onSettled: () => {
      setPendingDeleteId(null);
    },
  });

  const totalExercises = exercises?.length ?? 0;

  const heroSubtitle = useMemo(() => {
    if (!totalExercises) {
      return "Build your kettlebell library and keep favorite complexes at hand.";
    }
    if (totalExercises === 1) {
      return "You have 1 exercise ready to log.";
    }
    return `You have ${totalExercises} exercises ready to log.`;
  }, [totalExercises]);

  const handleDelete = async (exercise: { id: string; name: string }) => {
    const confirmed = await confirm({
      title: "Delete Exercise",
      description: `Delete "${exercise.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      deleteExercise({ id: exercise.id });
    }
  };

  return (
    <div className="relative isolate w-full">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 blur-3xl"
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-12 md:px-10">
        <AddExerciseModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />

        <section className="flex flex-col gap-8 rounded-3xl border border-border/60 bg-background/95 p-7 shadow-lg shadow-black/5 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Bell Track
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Exercise Library
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              {heroSubtitle}
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-5 py-2 text-sm text-muted-foreground">
              <span className="text-2xl font-semibold text-foreground">
                {totalExercises}
              </span>
              <span className="font-medium">
                {totalExercises === 1 ? "exercise" : "exercises"}
              </span>
            </div>
            <Button className="gap-1.5" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Exercise
            </Button>
          </div>
        </section>

        <section className="space-y-6">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                All exercises
              </h2>
              <p className="text-sm text-muted-foreground">
                Browse your saved movements and complexes.
              </p>
            </div>
          </header>

          {isPending ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {SKELETON_PLACEHOLDERS.map((placeholder) => (
                <div
                  key={placeholder}
                  className="h-[230px] rounded-xl border border-border/50 bg-muted/40 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-8 text-center">
              <p className="text-base font-medium text-destructive">
                We couldn't load your exercises.
              </p>
              <p className="text-sm text-muted-foreground">
                {error.message ?? "Please try again."}
              </p>
              <Button onClick={() => refetch()} variant="secondary">
                Retry
              </Button>
            </div>
          ) : !totalExercises ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
              <p className="text-lg font-semibold text-foreground">
                Start by adding your first exercise
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                Create movements or complexes once and reuse them in workouts
                and templates.
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add exercise
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {exercises?.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onDelete={handleDelete}
                  isDeleting={pendingDeleteId === exercise.id}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
