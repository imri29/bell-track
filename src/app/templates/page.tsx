"use client";

import { BadgePlus, Edit, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ComplexNameTooltip } from "@/components/complex-name-tooltip";
import { PageHero } from "@/components/page-hero";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip } from "@/components/ui/tooltip";
import { useConfirm } from "@/contexts/confirm-context";
import { getTagPalette } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/server/api/root";
import { api } from "@/trpc/react";

type TemplateWithExercises = RouterOutputs["template"]["getAll"][number];

function TemplateExercisesList({
  exercises,
}: {
  exercises: TemplateWithExercises["exercises"];
}) {
  const sortedExercises = [...exercises].sort((a, b) => {
    if (a.group && b.group && a.group !== b.group) {
      return a.group.localeCompare(b.group);
    }
    return a.order - b.order;
  });

  return (
    <div className="mt-3 space-y-1">
      {sortedExercises.map((exercise, index) => {
        let displayLabel = "";
        const showDivider =
          index > 0 &&
          exercise.group &&
          sortedExercises[index - 1]?.group !== exercise.group;

        if (exercise.group) {
          const groupIndex = sortedExercises
            .slice(0, index + 1)
            .filter((ex) => ex.group === exercise.group).length;
          displayLabel = `${exercise.group}${groupIndex}`;
        }

        return (
          <div key={exercise.id}>
            {showDivider && <div className="my-2 border-t border-border" />}
            <div className="text-sm text-muted-foreground">
              {displayLabel && (
                <span className="mr-1 font-medium text-foreground">
                  {displayLabel}:
                </span>
              )}
              <ComplexNameTooltip
                name={exercise.exercise.name}
                subExercises={exercise.exercise.subExercises}
                className="inline font-medium text-foreground"
              >
                <span className="inline font-medium text-foreground">
                  {exercise.exercise.type !== "COMPLEX" && exercise.reps
                    ? `${exercise.reps} ${exercise.exercise.name}`
                    : exercise.exercise.name}
                  {` • ${exercise.sets} sets`}
                  {exercise.weight && ` • ${exercise.weight}kg`}
                </span>
              </ComplexNameTooltip>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TemplatesPage() {
  const utils = api.useUtils();
  const { confirm } = useConfirm();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

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

  const {
    data: tags,
    isPending: tagsPending,
    error: tagsError,
  } = api.template.getTags.useQuery();

  const { mutate: deleteTemplate, isPending: isDeleting } =
    api.template.delete.useMutation({
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

  const handleUseTemplate = (template: TemplateWithExercises) => {
    const params = new URLSearchParams({ templateId: template.id });
    router.push(`/history/new?${params.toString()}`);
  };

  const hasTemplates = (templates?.length ?? 0) > 0;
  const hasQuery = trimmedQuery.length > 0;
  const hasActiveFilters = hasQuery || hasTagFilters;

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
      prev.includes(slug)
        ? prev.filter((existingSlug) => existingSlug !== slug)
        : [...prev, slug],
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTagSlugs([]);
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Bell Track"
        title="Templates"
        description={heroSubtitle}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-5 py-2 text-sm text-muted-foreground">
            <span className="text-2xl font-semibold text-foreground">
              {totalTemplatesDisplay}
            </span>
            <span className="font-medium">
              {totalTemplates === 1 ? "template" : "templates"}
            </span>
          </div>
          <Button asChild className="gap-1.5">
            <Link href="/templates/new">
              <Plus className="h-4 w-4" />
              Add Template
            </Link>
          </Button>
        </div>
      </PageHero>

      <div className="space-y-6">
        <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                Your templates
              </h2>
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
                  onChange={(event) =>
                    setSearchQuery(event.currentTarget.value)
                  }
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
                })
              ) : null}
            </div>
          )}

          <div className="space-y-4">
            {templatesPending ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
                <Spinner />
                <div>
                  <p className="text-base font-semibold text-foreground">
                    Loading your templates
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Stay with us for a moment.
                  </p>
                </div>
              </div>
            ) : templatesError ? (
              <p>Error loading templates</p>
            ) : hasTemplates ? (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="group rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {template.exercises.length} exercise
                          {template.exercises.length !== 1 ? "s" : ""}
                        </p>
                        {template.description && (
                          <p className="mt-2 text-sm">{template.description}</p>
                        )}
                        {(template.tags?.length ?? 0) > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {template.tags?.map((tag) => {
                              const palette = getTagPalette(tag.slug);
                              return (
                                <span
                                  key={tag.id}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium leading-tight",
                                    palette.tint,
                                  )}
                                >
                                  <span
                                    aria-hidden="true"
                                    className={cn(
                                      "h-2 w-2 shrink-0 rounded-full",
                                      palette.dot,
                                    )}
                                  />
                                  {tag.name}
                                </span>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex gap-2 opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100">
                        <Tooltip content="Log workout">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUseTemplate(template)}
                            className="gap-1.5"
                          >
                            <BadgePlus className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="gap-1.5"
                        >
                          <Link href={`/templates/${template.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          className="h-8 w-8 p-0"
                          variant="destructive"
                          onClick={() => handleDelete(template)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <TemplateExercisesList exercises={template.exercises} />
                  </div>
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
                No templates yet. Click "Add Template" to create your first
                workout template.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
