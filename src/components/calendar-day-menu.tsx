"use client";

import { format } from "date-fns";
import { Edit, File, Plus, Trash2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const dateString = format(date, "dd/MM/yyyy");

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

            {templates.length > 0 && (
              <div className="px-2 py-1">
                <Select onValueChange={onAddFromTemplate}>
                  <SelectTrigger className="h-8 text-sm">
                    <div className="flex items-center">
                      <File className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="From Template" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
