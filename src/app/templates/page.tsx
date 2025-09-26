"use client";

import { Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AddTemplateModal } from "@/components/add-template-modal";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/contexts/confirm-context";
import { api } from "@/trpc/react";

export default function TemplatesPage() {
  const utils = api.useUtils();
  const { confirm } = useConfirm();

  const {
    data: templates,
    isPending: templatesPending,
    error: templatesError,
  } = api.template.getAll.useQuery();

  const { mutate: deleteTemplate, isPending: isDeleting } =
    api.template.delete.useMutation({
      onSuccess: () => {
        utils.template.getAll.invalidate();
      },
    });

  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleUseTemplate = (templateId: string) => {
    // TODO: Navigate to workout creation with pre-filled template data
    console.log("Use template:", templateId);
  };

  return (
    <div className="p-4 md:p-8 w-full">
      <main className="max-w-4xl mx-auto">
        <AddTemplateModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Templates</h1>
            <p className="text-xl text-muted-foreground">
              Create and manage reusable workout templates
            </p>
          </div>
          <Button className="gap-1.5" onClick={() => setIsModalOpen(true)}>
            <Plus />
            Add Template
          </Button>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-muted rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Your Templates</h2>
            <div className="space-y-4">
              {templatesPending ? (
                <p>Loading templates...</p>
              ) : templatesError ? (
                <p>Error loading templates</p>
              ) : templates && templates.length > 0 ? (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 bg-background rounded border group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.exercises.length} exercise
                            {template.exercises.length !== 1 ? "s" : ""}
                          </p>
                          {template.description && (
                            <p className="text-sm mt-2">
                              {template.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUseTemplate(template.id)}
                            className="gap-1.5"
                          >
                            <Play className="h-4 w-4" />
                            Use Template
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
                      <div className="mt-3 space-y-1">
                        {template.exercises
                          .sort((a, b) => {
                            if (a.group && b.group && a.group !== b.group) {
                              return a.group.localeCompare(b.group);
                            }
                            return a.order - b.order;
                          })
                          .map((exercise, index, sortedExercises) => {
                            let displayLabel = "";
                            const showDivider =
                              index > 0 &&
                              exercise.group &&
                              sortedExercises[index - 1].group !==
                                exercise.group;

                            if (exercise.group) {
                              const groupIndex = sortedExercises
                                .slice(0, index + 1)
                                .filter(
                                  (ex) => ex.group === exercise.group,
                                ).length;
                              displayLabel = `${exercise.group}${groupIndex}`;
                            }

                            return (
                              <div key={exercise.id}>
                                {showDivider && (
                                  <div className="border-t border-border my-2" />
                                )}
                                <div className="text-sm text-muted-foreground">
                                  {displayLabel && (
                                    <span className="font-medium text-foreground mr-1">
                                      {displayLabel}:
                                    </span>
                                  )}
                                  {exercise.exercise.name} • {exercise.sets}{" "}
                                  sets
                                  {exercise.weight && ` • ${exercise.weight}kg`}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
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
      </main>
    </div>
  );
}
