"use client";

import { ClipboardCheck, FileJson, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IconButton } from "@/components/common/icon-button";
import { Spinner } from "@/components/common/spinner";
import { ComplexNameTooltip } from "@/components/complex-name-tooltip";
import { PageHero } from "@/components/page-hero";
import { PageShell } from "@/components/page-shell";
import {
  type ComplexSubstitutionOption,
  ComplexSubstitutionPicker,
} from "@/components/patterns/complex-substitution-picker";
import { SimpleTooltip } from "@/components/patterns/simple-tooltip";
import { SessionCard } from "@/components/session-card";
import {
  TemplateExerciseCard,
  TemplateExercisesPanel,
} from "@/components/template-exercise-blocks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/contexts/confirm-context";
import { formatExerciseUnitValue } from "@/lib/exercise-units";
import { getTagPalette } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/server/api/root";
import { api } from "@/trpc/react";

type TemplateWithExercises = RouterOutputs["template"]["getAll"][number];
type TemplateSubstitutions = Record<string, Record<string, string>>;

const TEMPLATE_SEARCH_PARAM = "search";
const TEMPLATE_TAG_PARAM = "tag";

type SearchParamsLike = {
  get: (name: string) => string | null;
  getAll: (name: string) => string[];
};

function parseTemplateFilters(searchParams: SearchParamsLike) {
  const search = searchParams.get(TEMPLATE_SEARCH_PARAM)?.trim() ?? "";
  const rawTagSlugs = searchParams
    .getAll(TEMPLATE_TAG_PARAM)
    .map((slug: string) => slug.trim())
    .filter((slug): slug is string => Boolean(slug));
  const tagSlugs = Array.from<string>(new Set(rawTagSlugs));

  return { search, tagSlugs };
}

function buildTemplateFiltersQueryString(search: string, tagSlugs: string[]) {
  const params = new URLSearchParams();
  const trimmedSearch = search.trim();

  if (trimmedSearch) {
    params.set(TEMPLATE_SEARCH_PARAM, trimmedSearch);
  }

  for (const tagSlug of tagSlugs) {
    params.append(TEMPLATE_TAG_PARAM, tagSlug);
  }

  return params.toString();
}

function areStringArraysEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function TemplateExerciseSummaryList({
  exercises,
  complexes,
  substitutions,
  onSubstitute,
  onResetSubstitution,
  onResetAll,
}: {
  exercises: TemplateWithExercises["exercises"];
  complexes: ComplexSubstitutionOption[];
  substitutions: Record<string, string>;
  onSubstitute: (templateExerciseId: string, complexId: string) => void;
  onResetSubstitution: (templateExerciseId: string) => void;
  onResetAll: () => void;
}) {
  const substitutionCount = Object.keys(substitutions).length;

  return (
    <>
      {substitutionCount > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {substitutionCount} {substitutionCount === 1 ? "substitution" : "substitutions"}
          </span>
          <button
            type="button"
            onClick={onResetAll}
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Reset
          </button>
        </div>
      )}
      <SessionCard.ExerciseList
        className={substitutionCount > 0 ? "mt-2" : "mt-3"}
        exercises={exercises}
        renderItem={({ exercise, displayLabel }) => {
          const substitutionId = substitutions[exercise.id];
          const substitutedComplex = substitutionId
            ? complexes.find((complex) => complex.id === substitutionId)
            : undefined;
          const displayExercise = substitutedComplex ?? exercise.exercise;
          const isComplex = exercise.exercise.type === "COMPLEX";

          return (
            <div className="min-w-0 break-words text-sm text-muted-foreground">
              {displayLabel && (
                <span className="mr-1 font-medium text-foreground">{displayLabel}:</span>
              )}
              <span className="inline-flex max-w-full items-center gap-1 align-middle">
                <ComplexNameTooltip
                  name={displayExercise.name}
                  subExercises={displayExercise.subExercises}
                  className="inline min-w-0 font-medium text-foreground"
                >
                  <span className="inline break-words font-medium text-foreground">
                    {!isComplex && exercise.reps
                      ? `${formatExerciseUnitValue(exercise.reps, exercise.unit)} ${displayExercise.name}`
                      : displayExercise.name}
                    {!!exercise.sets && ` • ${exercise.sets} sets`}
                    {!!exercise.weight && ` • ${exercise.weight}kg`}
                  </span>
                </ComplexNameTooltip>
                {isComplex && (
                  <ComplexSubstitutionPicker
                    currentComplex={{
                      id: displayExercise.id,
                      name: displayExercise.name,
                      subExercises: displayExercise.subExercises,
                    }}
                    originalComplexId={exercise.exercise.id}
                    complexes={complexes}
                    onSelect={(complexId) => onSubstitute(exercise.id, complexId)}
                    onReset={() => onResetSubstitution(exercise.id)}
                    isModified={Boolean(substitutionId)}
                  />
                )}
              </span>
            </div>
          );
        }}
      />
    </>
  );
}

export default function TemplatesPage() {
  const utils = api.useUtils();
  const { confirm } = useConfirm();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialFilters = parseTemplateFilters(searchParams);

  const [searchQuery, setSearchQuery] = useState(initialFilters.search);
  const [debouncedQuery, setDebouncedQuery] = useState(initialFilters.search);
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>(initialFilters.tagSlugs);
  const [substitutions, setSubstitutions] = useState<TemplateSubstitutions>({});
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  useEffect(() => {
    const nextFilters = parseTemplateFilters(searchParams);

    setSearchQuery((current) => (current === nextFilters.search ? current : nextFilters.search));
    setDebouncedQuery((current) => (current === nextFilters.search ? current : nextFilters.search));
    setSelectedTagSlugs((current) =>
      areStringArraysEqual(current, nextFilters.tagSlugs) ? current : nextFilters.tagSlugs,
    );
  }, [searchParams]);

  useEffect(() => {
    const nextQueryString = buildTemplateFiltersQueryString(debouncedQuery, selectedTagSlugs);
    const currentFilters = parseTemplateFilters(searchParams);
    const currentQueryString = buildTemplateFiltersQueryString(
      currentFilters.search,
      currentFilters.tagSlugs,
    );

    if (nextQueryString === currentQueryString) {
      return;
    }

    router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname);
  }, [debouncedQuery, pathname, router, searchParams, selectedTagSlugs]);

  const trimmedQuery = debouncedQuery.trim();
  const hasTagFilters = selectedTagSlugs.length > 0;
  const queryInput =
    trimmedQuery || hasTagFilters
      ? {
          ...(trimmedQuery ? { search: trimmedQuery } : {}),
          ...(hasTagFilters ? { tagSlugs: selectedTagSlugs } : {}),
        }
      : undefined;

  const {
    data: templates,
    isPending: templatesPending,
    error: templatesError,
  } = api.template.getAll.useQuery(queryInput);

  const { data: tags, isPending: tagsPending, error: tagsError } = api.template.getTags.useQuery();
  const { data: exercises } = api.exercise.getAll.useQuery();
  const complexes = useMemo(
    () => exercises?.filter((exercise) => exercise.type === "COMPLEX") ?? [],
    [exercises],
  );

  const { mutate: deleteTemplate, isPending: isDeleting } = api.template.delete.useMutation({
    onSuccess: () => {
      utils.template.getAll.invalidate();
    },
  });

  const handleDelete = async (template: { id: string; name: string }) => {
    const confirmed = await confirm({
      title: "Delete Template",
      description: `Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      deleteTemplate({ id: template.id });
    }
  };

  const previewTemplate = templates?.find((template) => template.id === previewTemplateId);
  const previewExerciseIds = useMemo(
    () =>
      previewTemplate?.exercises.map(
        (exercise) => substitutions[previewTemplate.id]?.[exercise.id] ?? exercise.exerciseId,
      ) ?? [],
    [previewTemplate, substitutions],
  );
  const { data: previewFeedback, isPending: previewFeedbackPending } =
    api.workout.validateDraft.useQuery(
      { exerciseIds: previewExerciseIds },
      { enabled: Boolean(previewTemplateId) && previewExerciseIds.length > 0 },
    );

  const handleUseTemplate = (template: TemplateWithExercises) => {
    setPreviewTemplateId(template.id);
  };

  const continueWithTemplate = () => {
    if (!previewTemplate) return;
    const params = new URLSearchParams({ templateId: previewTemplate.id });
    const templateSubstitutions = substitutions[previewTemplate.id] ?? {};

    for (const [templateExerciseId, complexId] of Object.entries(templateSubstitutions)) {
      params.append("swap", `${templateExerciseId}:${complexId}`);
    }

    setPreviewTemplateId(null);
    router.push(`/history/new?${params.toString()}`);
  };

  const handleSubstituteComplex = (
    templateId: string,
    templateExerciseId: string,
    complexId: string,
  ) => {
    setSubstitutions((current) => ({
      ...current,
      [templateId]: {
        ...current[templateId],
        [templateExerciseId]: complexId,
      },
    }));
  };

  const handleResetSubstitution = (templateId: string, templateExerciseId: string) => {
    setSubstitutions((current) => {
      const nextTemplateSubstitutions = { ...current[templateId] };
      delete nextTemplateSubstitutions[templateExerciseId];

      if (Object.keys(nextTemplateSubstitutions).length === 0) {
        const next = { ...current };
        delete next[templateId];
        return next;
      }

      return {
        ...current,
        [templateId]: nextTemplateSubstitutions,
      };
    });
  };

  const handleResetTemplateSubstitutions = (templateId: string) => {
    setSubstitutions((current) => {
      const next = { ...current };
      delete next[templateId];
      return next;
    });
  };

  const hasTemplates = (templates?.length ?? 0) > 0;
  const hasQuery = trimmedQuery.length > 0;
  const hasActiveFilters = hasQuery || hasTagFilters;
  const activeFilterQueryString = buildTemplateFiltersQueryString(debouncedQuery, selectedTagSlugs);

  const totalTemplates = templates?.length ?? 0;
  const totalTemplatesDisplay = templatesPending ? "—" : totalTemplates;
  const heroSubtitle = useMemo(() => {
    if (templatesPending) {
      return "Loading your workout library...";
    }
    if (!totalTemplates) {
      return "Build your workout library so logging is effortless.";
    }
    if (totalTemplates === 1) {
      return "You have 1 template ready to go.";
    }
    return `You have ${totalTemplates} templates ready to go.`;
  }, [templatesPending, totalTemplates]);

  const toggleTagSelection = (slug: string) => {
    setSelectedTagSlugs((prev) =>
      prev.includes(slug) ? prev.filter((existingSlug) => existingSlug !== slug) : [...prev, slug],
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTagSlugs([]);
  };

  return (
    <PageShell>
      <PageHero eyebrow="Bell Track" title="Templates" description={heroSubtitle}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-5 py-2 text-sm text-muted-foreground">
            <span className="text-2xl font-semibold text-foreground">{totalTemplatesDisplay}</span>
            <span className="font-medium">{totalTemplates === 1 ? "template" : "templates"}</span>
          </div>
          <Button asChild className="gap-1.5">
            <Link href="/templates/new">
              <Plus className="h-4 w-4" />
              Add Template
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/templates/import">
              <FileJson className="h-4 w-4" />
              Import template
            </Link>
          </Button>
        </div>
      </PageHero>

      <div className="space-y-6">
        <TemplateExercisesPanel title="Your templates">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Find the workout you need and log it in a few taps.
              </p>
            </div>
            <div className="w-full sm:max-w-xs">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.currentTarget.value)}
                  placeholder="Search templates..."
                  aria-label="Search templates"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {tagsError ? (
            <div className="mb-6 rounded-full border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive">
              Couldn’t load tags. Filters unavailable.
            </div>
          ) : (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {tagsPending ? (
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
                  <Spinner size="sm" variant="muted" />
                  Loading tags...
                </div>
              ) : tags && tags.length > 0 ? (
                tags.map((tag) => {
                  const isSelected = selectedTagSlugs.includes(tag.slug);
                  const palette = getTagPalette(tag.slug);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTagSelection(tag.slug)}
                      aria-pressed={isSelected}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        isSelected
                          ? cn(palette.tint, "focus-visible:ring-offset-background")
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
                })
              ) : null}
            </div>
          )}

          <div className="space-y-4">
            {templatesPending ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
                <Spinner />
                <div>
                  <p className="text-base font-semibold text-foreground">Loading your templates</p>
                  <p className="text-sm text-muted-foreground">Stay with us for a moment.</p>
                </div>
              </div>
            ) : templatesError ? (
              <p>Error loading templates</p>
            ) : hasTemplates ? (
              <div className="space-y-3">
                {templates.map((template) => (
                  <TemplateExerciseCard key={template.id} className="group">
                    <div className="grid gap-3">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <div className="flex flex-col">
                          <SessionCard.Title className="min-w-0 wrap-break-word">
                            {template.name}
                          </SessionCard.Title>
                          <SessionCard.Subtitle>
                            {template.exercises.length} exercise
                            {template.exercises.length !== 1 ? "s" : ""}
                          </SessionCard.Subtitle>
                        </div>
                        <SessionCard.Actions className="shrink-0 opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100">
                          <SimpleTooltip content="Log workout">
                            <IconButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleUseTemplate(template)}
                              className="gap-1.5"
                              aria-label={`Log ${template.name}`}
                            >
                              <ClipboardCheck className="h-4 w-4" />
                            </IconButton>
                          </SimpleTooltip>
                          <SimpleTooltip content="Edit template">
                            <IconButton
                              asChild
                              size="sm"
                              variant="outline"
                              aria-label={`Edit ${template.name}`}
                            >
                              <Link
                                href={
                                  activeFilterQueryString
                                    ? `/templates/${template.id}/edit?${activeFilterQueryString}`
                                    : `/templates/${template.id}/edit`
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </IconButton>
                          </SimpleTooltip>
                          <IconButton
                            className="h-8 w-8 p-0"
                            variant="destructive"
                            onClick={() => handleDelete(template)}
                            disabled={isDeleting}
                            aria-label={`Delete ${template.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </SessionCard.Actions>
                      </div>

                      <div className="min-w-0">
                        {template.description && (
                          <SessionCard.Description>{template.description}</SessionCard.Description>
                        )}
                        <SessionCard.Tags tags={template.tags} />
                      </div>
                    </div>
                    <TemplateExerciseSummaryList
                      exercises={template.exercises}
                      complexes={complexes}
                      substitutions={substitutions[template.id] ?? {}}
                      onSubstitute={(templateExerciseId, complexId) =>
                        handleSubstituteComplex(template.id, templateExerciseId, complexId)
                      }
                      onResetSubstitution={(templateExerciseId) =>
                        handleResetSubstitution(template.id, templateExerciseId)
                      }
                      onResetAll={() => handleResetTemplateSubstitutions(template.id)}
                    />
                  </TemplateExerciseCard>
                ))}
              </div>
            ) : hasActiveFilters ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
                <p className="text-base font-semibold text-foreground">
                  No templates match your filters
                </p>
                <p className="text-sm text-muted-foreground">
                  Try different filters or clear them to see your full library.
                </p>
                <Button variant="ghost" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No templates yet. Click "Add Template" to create your first workout template.
              </p>
            )}
          </div>
        </TemplateExercisesPanel>
      </div>

      <Dialog
        open={Boolean(previewTemplateId)}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplateId(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Before you train</DialogTitle>
            <DialogDescription>
              {previewTemplate?.name ?? "This template"} will be compared with your recent training.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2" aria-live="polite">
            {previewFeedbackPending ? (
              <p className="text-sm text-muted-foreground">Checking your recent training...</p>
            ) : previewFeedback?.warnings.length || previewFeedback?.hints.length ? (
              <>
                {previewFeedback.warnings.map((item) => (
                  <p key={item.code} className="text-sm text-amber-700 dark:text-amber-300">
                    {item.message}
                  </p>
                ))}
                {previewFeedback.hints.map((item) => (
                  <p key={item.code} className="text-sm text-muted-foreground">
                    {item.message}
                  </p>
                ))}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No balance reminders for this template.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPreviewTemplateId(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={continueWithTemplate} disabled={previewFeedbackPending}>
              Start workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
