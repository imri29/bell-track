"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { AddWorkoutModal } from "@/components/add-workout-modal";
import { TemplateSelect } from "@/components/template-select";
import { Button } from "@/components/ui/button";
import { templateToFormData } from "@/lib/template-utils";
import { api } from "@/trpc/react";
import type { TemplateData } from "@/types";

type CalendarViewProps = {
  workoutDates: Date[];
};

export function CalendarView({ workoutDates }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);

  const { data: templates } = api.template.getAll.useQuery();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const hasWorkout = (date: Date) => {
    return workoutDates.some((workoutDate) => isSameDay(workoutDate, date));
  };

  // Derived state
  const isAddModalOpen = isCreatingWorkout || selectedTemplate !== null;

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddWorkout = () => {
    if (selectedDate) {
      setIsCreatingWorkout(true);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find((t) => t.id === templateId);
    if (template) {
      const formData = templateToFormData(template);
      setSelectedTemplate(formData);
    }
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      setSelectedTemplate(null);
      setIsCreatingWorkout(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  return (
    <div className="w-full">
      <AddWorkoutModal
        isOpen={isAddModalOpen}
        onOpenChange={handleModalClose}
        templateData={selectedTemplate || undefined}
        initialDate={selectedDate}
      />

      <div className="p-6 bg-muted rounded-lg">
        <div className="bg-background rounded-lg p-4">
          {/* Header with navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-lg font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div></div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((date) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isTodayDate = isToday(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const hasWorkoutOnDate = hasWorkout(date);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  className={`
                    relative min-h-20 p-3 border rounded-md cursor-pointer
                    transition-all duration-200  hover:scale-[1.02]
                    ${
                      !isCurrentMonth
                        ? "text-muted-foreground/30 bg-muted/20 border-muted-foreground/10 hover:bg-accent/10"
                        : "hover:bg-accent/50 bg-background border-border"
                    }
                    ${isTodayDate && isCurrentMonth ? "bg-accent text-red-700" : ""}
                    ${isSelected && isCurrentMonth ? "bg-primary/10 border-primary border-2" : ""}
                    ${isSelected && !isCurrentMonth ? "bg-muted/80 border-muted-foreground/50 border-2" : ""}
                  `}
                >
                  <div className="flex items-start justify-between h-full">
                    <span
                      className={`text-sm ${isTodayDate && isCurrentMonth ? "font-extrabold" : "font-medium"}`}
                    >
                      {format(date, "d")}
                    </span>
                    {hasWorkoutOnDate && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Selected: {format(selectedDate, "dd/MM/yyyy")}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button className="gap-2" onClick={handleAddWorkout}>
                <Plus className="h-4 w-4" />
                Add Workout
              </Button>
              <TemplateSelect
                onTemplateSelect={handleTemplateSelect}
                variant="button"
                className="gap-2"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
