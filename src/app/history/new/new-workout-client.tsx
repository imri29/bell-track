"use client";

import { isValid, parseISO } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { AddWorkoutForm } from "@/components/add-workout-form";

import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

import { api } from "@/trpc/react";
import type { TemplateData } from "@/types";

export function NewWorkoutClient({ date, templateId }: { date?: string; templateId?: string }) {
  const router = useRouter();

  const initialDate = useMemo(() => {
    if (!date) {
      return undefined;
    }

    try {
      const parsed = parseISO(date);
      return isValid(parsed) ? parsed : undefined;
    } catch (_error) {
      return undefined;
    }
  }, [date]);

  const {
    data: templateResponse,
    isPending: templatePending,
    error: templateError,
  } = api.template.getById.useQuery(
    { id: templateId ?? "" },
    {
      enabled: Boolean(templateId),
    },
  );

  const templateData: TemplateData | undefined = useMemo(() => {
    if (!templateResponse) {
      return undefined;
    }

    return {
      id: templateResponse.id,
      name: templateResponse.name,
      exercises: templateResponse.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        sets: exercise.sets,
        unit: exercise.unit ?? "REPS",
        reps: exercise.reps,
        weight: typeof exercise.weight === "number" ? exercise.weight : undefined,
        restTime: typeof exercise.restTime === "number" ? exercise.restTime : undefined,
        notes: exercise.notes ? exercise.notes : undefined,
        group: exercise.group ? exercise.group : undefined,
        order: exercise.order,
      })),
      tagIds: templateResponse.tags.map((tag) => tag.id),
    };
  }, [templateResponse]);

  const handleNavigateToHistory = () => {
    router.push("/history?view=list");
    router.refresh();
  };

  const isLoadingTemplate = Boolean(templateId) && templatePending && !templateResponse;

  return (
    <PageShell withGlow={false} mainClassName="max-w-4xl gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold leading-tight text-foreground">Log workout</h1>
          <p className="text-sm text-muted-foreground">Record a new training session.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/history?view=list">Back to history</Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
        {isLoadingTemplate ? (
          <p>Loading template...</p>
        ) : templateError ? (
          <p className="text-destructive">Failed to load template.</p>
        ) : templateId && !templateResponse ? (
          <p className="text-muted-foreground">
            Template not found. You can still log a workout from scratch.
          </p>
        ) : (
          <AddWorkoutForm
            templateData={templateData}
            initialDate={initialDate}
            onCancel={handleNavigateToHistory}
            onSuccess={handleNavigateToHistory}
          />
        )}
      </div>
    </PageShell>
  );
}
