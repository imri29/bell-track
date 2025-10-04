"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import {
  AddExerciseModal,
  EditExerciseModal,
} from "@/components/add-exercise-modal";
import {
  ExerciseCard,
  type ExerciseCardData,
} from "@/components/exercises/exercise-card";
import { PageHero } from "@/components/page-hero";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [editingExercise, setEditingExercise] =
    useState<ExerciseCardData | null>(null);

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
  const trimmedQuery = searchQuery.trim();

  const filteredExercises = useMemo(() => {
    if (!exercises) {
      return [];
    }

    const query = trimmedQuery.toLowerCase();

    if (!query) {
      return exercises;
    }

    return exercises.filter((exercise) => {
      const nameMatch = exercise.name.toLowerCase().includes(query);
      const descriptionMatch = exercise.description
        ? exercise.description.toLowerCase().includes(query)
        : false;
      const typeMatch = exercise.type.toLowerCase().includes(query);
      const breakdownMatch =
        exercise.subExercises?.some((movement) =>
          movement.exerciseName.toLowerCase().includes(query),
        ) ?? false;

      return nameMatch || descriptionMatch || typeMatch || breakdownMatch;
    });
  }, [exercises, trimmedQuery]);

  const hasExercises = totalExercises > 0;
  const hasQuery = trimmedQuery.length > 0;

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
    <PageShell>
      <AddExerciseModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      <EditExerciseModal
        exercise={editingExercise}
        isOpen={editingExercise !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingExercise(null);
          }
        }}
      />

      <PageHero
        eyebrow="Bell Track"
        title="Exercise Library"
        description={heroSubtitle}
      >
        <div className="flex flex-wrap items-center gap-3">
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
      </PageHero>

      <section className="space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              All exercises
            </h2>
            <p className="text-sm text-muted-foreground">
              Browse your saved movements and complexes.
            </p>
          </div>
          {hasExercises ? (
            <div className="w-full md:max-w-xs">
              <Input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search exercises..."
                aria-label="Search exercises"
              />
            </div>
          ) : null}
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
        ) : !hasExercises ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
            <p className="text-lg font-semibold text-foreground">
              Start by adding your first exercise
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              Create movements or complexes once and reuse them in workouts and
              templates.
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add exercise
            </Button>
          </div>
        ) : hasQuery && filteredExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
            <p className="text-base font-semibold text-foreground">
              No exercises match your search
            </p>
            <p className="text-sm text-muted-foreground">
              Try a different name or clear the search to see everything.
            </p>
            <Button variant="ghost" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onDelete={handleDelete}
                isDeleting={pendingDeleteId === exercise.id}
                onEdit={setEditingExercise}
              />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
