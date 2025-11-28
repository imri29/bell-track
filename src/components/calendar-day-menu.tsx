"use client";

import { format } from "date-fns";
import { ChevronDown, Edit, File, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ComplexNameTooltip } from "@/components/complex-name-tooltip";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { getTagPalette } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/server/api/root";

type WorkoutData = RouterOutputs["workout"]["getAll"][number];
type TemplateData = RouterOutputs["template"]["getAll"][number];

type CalendarDayMenuProps = {
  date: Date;
  workouts: WorkoutData[];
  templates: TemplateData[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWorkout: () => void;
  onAddFromTemplate: (templateId: string) => void;
  onEditWorkout?: (workout: WorkoutData) => void;
  onDeleteWorkout?: (workout: WorkoutData) => void;
  children: React.ReactNode;
};

// Helper component to render workout exercise summary
function WorkoutExerciseSummary({ workout }: { workout: WorkoutData }) {
  const MAX_EXERCISES_SHOWN = 4;
  const sortedExercises = [...workout.exercises].sort((a, b) => {
    if (a.group && b.group && a.group !== b.group) {
      return a.group.localeCompare(b.group);
    }
    return a.order - b.order;
  });

  const visibleExercises = sortedExercises.slice(0, MAX_EXERCISES_SHOWN);
  const remainingCount = sortedExercises.length - MAX_EXERCISES_SHOWN;

  return (
    <div className="space-y-1">
      {visibleExercises.map((exercise, index) => {
        let displayLabel = "";
        const showDivider =
          index > 0 &&
          exercise.group &&
          visibleExercises[index - 1]?.group !== exercise.group;

        if (exercise.group) {
          const groupIndex = visibleExercises
            .slice(0, index + 1)
            .filter((ex) => ex.group === exercise.group).length;
          displayLabel = `${exercise.group}${groupIndex}`;
        }

        return (
          <div key={exercise.id}>
            {showDivider && (
              <div className="my-1.5 border-t border-border/50" />
            )}
            <div className="text-xs text-muted-foreground">
              {displayLabel && (
                <span className="mr-1 font-medium text-foreground">
                  {displayLabel}:
                </span>
              )}
              <ComplexNameTooltip
                name={exercise.exercise.name}
                subExercises={exercise.exercise.subExercises}
                className="inline text-foreground font-medium"
              />
              {` • ${exercise.sets}×${exercise.reps}`}
              {exercise.weight ? ` • ${exercise.weight}kg` : ""}
            </div>
          </div>
        );
      })}
      {remainingCount > 0 && (
        <div className="pt-1 text-xs text-muted-foreground italic">
          and {remainingCount} more exercise{remainingCount > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

function WorkoutTagList({ tags }: { tags: WorkoutData["tags"] }) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const palette = getTagPalette(tag.slug);
        return (
          <span
            key={tag.id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium leading-tight",
              palette.tint,
            )}
          >
            <span
              aria-hidden="true"
              className={cn("h-1.5 w-1.5 shrink-0 rounded-full", palette.dot)}
            />
            {tag.name}
          </span>
        );
      })}
    </div>
  );
}

export function CalendarDayMenu({
  date,
  workouts,
  templates,
  isOpen,
  onOpenChange,
  onAddWorkout,
  onAddFromTemplate,
  onEditWorkout,
  onDeleteWorkout,
  children,
}: CalendarDayMenuProps) {
  const hasWorkouts = workouts.length > 0;
  const hasTemplates = templates.length > 0;
  const dateString = format(date, "dd/MM/yyyy");
  const isMobile = useIsMobile();
  const [showTemplates, setShowTemplates] = useState(false);

  const handleAddWorkoutClick = () => {
    onAddWorkout();
    onOpenChange(false);
  };

  const handleTemplateClick = (templateId: string) => {
    if (!templateId) return;
    onAddFromTemplate(templateId);
    onOpenChange(false);
  };

  const handleEditClick = (workout: WorkoutData) => {
    onEditWorkout?.(workout);
    onOpenChange(false);
  };

  const handleDeleteClick = (workout: WorkoutData) => {
    onDeleteWorkout?.(workout);
    onOpenChange(false);
  };

  // Template selection section
  const templateSection = (
    <div className="space-y-2">
      {hasTemplates ? (
        <>
          <Button
            onClick={handleAddWorkoutClick}
            variant="ghost"
            className="w-full justify-start gap-2 px-2"
          >
            <Plus className="h-4 w-4" />
            New Workout
          </Button>
          <div className="space-y-1">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant="ghost"
                className="w-full justify-start gap-2 px-2 text-xs"
                onClick={() => handleTemplateClick(template.id)}
              >
                <File className="h-3.5 w-3.5" />
                {template.name}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <>
          <Button
            onClick={handleAddWorkoutClick}
            variant="ghost"
            className="w-full justify-start gap-2 px-2"
          >
            <Plus className="h-4 w-4" />
            New Workout
          </Button>
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start gap-2 px-2"
          >
            <Link href="/templates" onClick={() => onOpenChange(false)}>
              <File className="h-4 w-4" />
              Manage templates
            </Link>
          </Button>
        </>
      )}
    </div>
  );

  // Workouts display section
  const workoutsSection = hasWorkouts ? (
    <div className="space-y-3">
      {workouts.map((workout, index) => (
        <div
          key={workout.id}
          className="rounded-md border border-border/60 bg-muted/20 p-3"
        >
          <div className="mb-2 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">Workout {index + 1}</h4>
                {workout.duration && (
                  <span className="text-xs text-muted-foreground">
                    {workout.duration} min
                  </span>
                )}
              </div>
              {workout.notes && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {workout.notes}
                </p>
              )}
            </div>
            <div className="ml-2 flex items-center gap-1">
              {onEditWorkout && (
                <IconButton
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleEditClick(workout)}
                  title="Edit workout"
                  aria-label="Edit workout"
                >
                  <Edit className="h-3.5 w-3.5" />
                </IconButton>
              )}
              {onDeleteWorkout && (
                <IconButton
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteClick(workout)}
                  title="Delete workout"
                  aria-label="Delete workout"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              )}
            </div>
          </div>
          <WorkoutExerciseSummary workout={workout} />
          <WorkoutTagList tags={workout.tags} />
        </div>
      ))}
    </div>
  ) : null;

  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={(open) => {
          onOpenChange(open);
          if (!open) {
            setShowTemplates(false);
          }
        }}
        repositionInputs={false}
      >
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="p-4">
          <DrawerHeader className="pb-2 text-left">
            <DrawerTitle className="text-base">{dateString}</DrawerTitle>
            <p className="text-sm text-muted-foreground">
              {hasWorkouts
                ? `${workouts.length} workout${workouts.length > 1 ? "s" : ""}`
                : "Select a template or create a new workout"}
            </p>
          </DrawerHeader>
          <div className="space-y-4 px-4 pb-4 overflow-y-auto">
            {hasWorkouts ? (
              <>
                {workoutsSection}
                <div className="pt-2 border-t">
                  {!showTemplates ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center gap-2"
                      onClick={() => setShowTemplates(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Add another workout
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Add another
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setShowTemplates(false)}
                        >
                          Hide
                        </Button>
                      </div>
                      {templateSection}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Get started
                </p>
                {templateSection}
              </div>
            )}
          </div>
          <DrawerFooter className="border-t">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setShowTemplates(false);
        }
      }}
    >
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn("w-72", hasWorkouts && "max-h-[600px] overflow-y-auto")}
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{dateString}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {hasWorkouts
                ? `${workouts.length} workout${workouts.length > 1 ? "s" : ""}`
                : "Select a template or create a new workout"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {hasWorkouts ? (
          <>
            <div className="px-2 py-2 space-y-3">{workoutsSection}</div>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              {!showTemplates ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center gap-2"
                  onClick={() => setShowTemplates(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add another workout
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      ADD ANOTHER
                    </p>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 -mr-2"
                      onClick={() => setShowTemplates(false)}
                      aria-label="Hide template options"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>
                  {templateSection}
                </div>
              )}
            </div>
          </>
        ) : (
          <DropdownMenuGroup>
            <div className="px-2 py-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                GET STARTED
              </p>
              {templateSection}
            </div>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
