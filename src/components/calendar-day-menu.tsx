"use client";

import { format } from "date-fns";
import { Edit, File, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-is-mobile";
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

  const addSection = (
    <div className="space-y-2">
      <Button
        onClick={handleAddWorkoutClick}
        variant="ghost"
        className="w-full justify-start gap-2 px-2"
      >
        <Plus className="h-4 w-4" />
        New Workout
      </Button>
      {hasTemplates ? (
        <div className="space-y-1">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="ghost"
              className="w-full justify-start gap-2 px-2"
              onClick={() => handleTemplateClick(template.id)}
            >
              <File className="h-4 w-4" />
              {template.name}
            </Button>
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );

  const workoutsSection = hasWorkouts ? (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Existing workouts
      </p>
      <div className="space-y-1">
        {workouts.map((workout, index) => (
          <div
            key={workout.id}
            className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-accent/10"
          >
            <span className="truncate text-sm">
              Workout {index + 1}
              {workout.notes && (
                <span className="ml-1 text-xs text-muted-foreground">
                  • {workout.notes.slice(0, 20)}
                  {workout.notes.length > 20 ? "..." : ""}
                </span>
              )}
            </span>
            <div className="ml-2 flex items-center gap-1">
              {onEditWorkout && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleEditClick(workout)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              )}
              {onDeleteWorkout && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteClick(workout)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={onOpenChange}
        repositionInputs={false}
      >
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="p-4">
          <DrawerHeader className="pb-2 text-left">
            <DrawerTitle className="text-base">{dateString}</DrawerTitle>
            <p className="text-sm text-muted-foreground">
              {hasWorkouts
                ? `${workouts.length} workout${workouts.length > 1 ? "s" : ""}`
                : hasTemplates
                  ? "No workouts"
                  : "Set up templates to reuse"}
            </p>
          </DrawerHeader>
          <div className="space-y-4 px-4 pb-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Add new
              </p>
              {addSection}
            </div>
            {workoutsSection}
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
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" sideOffset={4}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{dateString}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {hasWorkouts
                ? `${workouts.length} workout${workouts.length > 1 ? "s" : ""}`
                : "No workouts"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
            Add New
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onAddWorkout} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              <span>New Workout</span>
            </DropdownMenuItem>

            <div className="px-2 py-1">
              {hasTemplates ? (
                <div className="flex flex-col gap-1">
                  {templates.map((template) => (
                    <DropdownMenuItem
                      key={template.id}
                      onSelect={() => onAddFromTemplate(template.id)}
                      className="cursor-pointer"
                    >
                      <File className="mr-2 h-4 w-4" />
                      <span>{template.name}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start gap-2 px-2 text-sm"
                >
                  <Link href="/templates">
                    <File className="h-4 w-4" />
                    Manage templates
                  </Link>
                </Button>
              )}
            </div>
          </DropdownMenuGroup>
        </DropdownMenuGroup>

        {hasWorkouts && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                Existing Workouts
              </DropdownMenuLabel>
              {workouts.map((workout, index) => (
                <div key={workout.id} className="px-2 py-1">
                  <div className="flex items-center justify-between p-1 rounded hover:bg-accent/10 ">
                    <span className="text-sm truncate flex-1">
                      Workout {index + 1}
                      {workout.notes && (
                        <span className="text-xs text-muted-foreground ml-1">
                          • {workout.notes.slice(0, 20)}
                          {workout.notes.length > 20 ? "..." : ""}
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-1 ml-2">
                      {onEditWorkout && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onEditWorkout(workout)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {onDeleteWorkout && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => onDeleteWorkout(workout)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
