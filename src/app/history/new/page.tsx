"use client";

import { isValid, parseISO } from "date-fns";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { AddWorkoutForm } from "@/components/add-workout-form";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import type { TemplateData } from "@/types";

export default function NewWorkoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get("date");
  const templateId = searchParams.get("templateId");

  const initialDate = useMemo(() => {
    if (!dateParam) {
      return undefined;
    }

    try {
      const parsed = parseISO(dateParam);
      return isValid(parsed) ? parsed : undefined;
    } catch (_error) {
      return undefined;
    }
  }, [dateParam]);

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
        reps: exercise.reps,
        weight:
          typeof exercise.weight === "number" ? exercise.weight : undefined,
        restTime:
          typeof exercise.restTime === "number" ? exercise.restTime : undefined,
        notes: exercise.notes ? exercise.notes : undefined,
        group: exercise.group ? exercise.group : undefined,
        order: exercise.order,
      })),
    };
  }, [templateResponse]);

  const handleNavigateToHistory = () => {
    router.push("/history?view=list");
    router.refresh();
  };

  const isLoadingTemplate =
    Boolean(templateId) && templatePending && !templateResponse;

  return (
    <div className="p-4 md:p-8 w-full">
      <main className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Log workout</h1>
            <p className="text-xl text-muted-foreground">
              Record a new training session
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/history?view=list">Back to history</Link>
          </Button>
        </div>

        <div className="p-6 bg-muted rounded-lg">
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
      </main>
    </div>
  );
}
