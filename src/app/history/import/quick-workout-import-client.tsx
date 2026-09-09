"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

const DEFAULT_JSON = JSON.stringify(
  {
    name: "Day 1 — Strong & Steady Circuit",
    description:
      "Six rounds of swings and max push-ups, followed by a four-round shoulder-friendly circuit.",
    tags: ["Supersets"],
    exercises: [
      {
        name: "Swings",
        sets: 6,
        reps: "12",
        weight: 24,
        group: "A",
        sectionTitle: "Part 1",
        notes: "Build the weight if possible.",
      },
      {
        name: "Push ups",
        sets: 6,
        reps: "MAX",
        weight: 0,
        group: "A",
        notes: "Max dips or push-ups.",
      },
      {
        name: "Single Arm Row",
        sets: 4,
        reps: "5",
        weight: 24,
        group: "B",
        sectionTitle: "Part 2",
        notes: "5 per side; plank row alternative.",
      },
      {
        name: "Cossack Squat",
        sets: 4,
        reps: "3",
        weight: 8,
        group: "B",
        notes: "3 per side; shoulder-friendly windmill substitute.",
      },
      {
        name: "Suitcase carry",
        sets: 4,
        reps: "40",
        unit: "TIME",
        weight: 20,
        group: "B",
        notes: "40 seconds; alternate sides each round, 2 sets per side total.",
      },
    ],
  },
  null,
  2,
);

const importedExerciseSchema = z.object({
  name: z.string().trim().min(1),
  sets: z.number().int().min(0),
  reps: z.union([z.string(), z.number()]).transform(String),
  weight: z.number().min(0).optional(),
  unit: z.enum(["REPS", "TIME"]).optional(),
  restTime: z.number().int().min(0).nullable().optional(),
  notes: z.string().optional(),
  group: z.string().optional(),
  sectionTitle: z.string().max(60).optional(),
});

const importSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  exercises: z.array(importedExerciseSchema).min(1),
});

type ImportData = z.infer<typeof importSchema>;

export function QuickTemplateImportClient() {
  const router = useRouter();
  const [json, setJson] = useState(DEFAULT_JSON);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const { data: exercises } = api.exercise.getAll.useQuery();
  const { data: tags } = api.template.getTags.useQuery();
  const utils = api.useUtils();
  const createTemplate = api.template.create.useMutation({
    onSuccess: () => {
      utils.template.getAll.invalidate();
      setSuccess(true);
      setError(undefined);
      router.push("/templates");
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  const parsed = useMemo(() => {
    try {
      return importSchema.parse(JSON.parse(json));
    } catch {
      return undefined;
    }
  }, [json]);

  const handleImport = () => {
    setSuccess(false);
    try {
      const data: ImportData = importSchema.parse(JSON.parse(json));
      const exerciseByName = new Map(
        exercises?.map((exercise) => [exercise.name.toLowerCase(), exercise]),
      );
      const tagByName = new Map(
        tags?.flatMap((tag) => [
          [tag.name.toLowerCase(), tag],
          [tag.slug.toLowerCase(), tag],
        ]) ?? [],
      );
      const missingExercises = data.exercises
        .filter((exercise) => !exerciseByName.has(exercise.name.toLowerCase()))
        .map((exercise) => exercise.name);
      if (missingExercises.length > 0) {
        throw new Error(`Unknown exercise: ${missingExercises.join(", ")}`);
      }

      const unknownTags = (data.tags ?? []).filter((tag) => !tagByName.has(tag.toLowerCase()));
      if (unknownTags.length > 0) {
        throw new Error(`Unknown tag: ${unknownTags.join(", ")}`);
      }

      createTemplate.mutate({
        name: data.name,
        description: data.description,
        tagIds: (data.tags ?? []).map((tag) => {
          const resolvedTag = tagByName.get(tag.toLowerCase());
          if (!resolvedTag) {
            throw new Error(`Unknown tag: ${tag}`);
          }
          return resolvedTag.id;
        }),
        exercises: data.exercises.map((exercise, order) => {
          const resolvedExercise = exerciseByName.get(exercise.name.toLowerCase());
          if (!resolvedExercise) {
            throw new Error(`Unknown exercise: ${exercise.name}`);
          }
          return {
            exerciseId: resolvedExercise.id,
            sets: exercise.sets,
            unit: exercise.unit ?? "REPS",
            reps: exercise.reps,
            weight: exercise.weight,
            restTime: exercise.restTime ?? undefined,
            notes: exercise.notes,
            group: exercise.group,
            sectionTitle: exercise.sectionTitle,
            order,
          };
        }),
      });
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "Invalid template JSON");
    }
  };

  return (
    <PageShell withGlow={false} mainClassName="max-w-4xl gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold leading-tight text-foreground">Import template</h1>
          <p className="text-sm text-muted-foreground">
            Paste a structured workout template and save it in one step.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/templates">Back to templates</Link>
        </Button>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm space-y-5">
        <div className="space-y-2">
          <label htmlFor="template-json" className="text-sm font-medium">
            Template JSON
          </label>
          <Textarea
            id="template-json"
            value={json}
            onChange={(event) => setJson(event.target.value)}
            className="min-h-96 font-mono text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Each exercise needs <code>name</code>, <code>sets</code>, and <code>reps</code>. Use{" "}
          <code>unit: "TIME"</code> for timed work. Names must match your exercise library.
        </p>
        {parsed ? (
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
            Preview: {parsed.exercises.length} exercises in “{parsed.name}”.
          </div>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {success ? (
          <p className="text-sm text-emerald-600">Template imported successfully.</p>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="ghost">
            <Link href="/templates">Cancel</Link>
          </Button>
          <Button onClick={handleImport} disabled={createTemplate.isPending}>
            {createTemplate.isPending ? "Importing…" : "Import template"}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
