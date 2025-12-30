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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDayMenu } from "@/components/calendar-day-menu";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import type { RouterOutputs } from "@/server/api/root";
import { api } from "@/trpc/react";

type WorkoutData = RouterOutputs["workout"]["getAll"][number];

type CalendarViewProps = {
  workouts: WorkoutData[];
  onEditWorkout?: (workout: WorkoutData) => void;
  onDeleteWorkout?: (workout: WorkoutData) => void;
};

export function CalendarView({ workouts, onEditWorkout, onDeleteWorkout }: CalendarViewProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [openMenuDate, setOpenMenuDate] = useState<Date | null>(null);

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

  const getWorkoutsForDate = (date: Date) => {
    return workouts.filter((workout) => isSameDay(new Date(workout.date), date));
  };

  const hasWorkout = (date: Date) => {
    return getWorkoutsForDate(date).length > 0;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setOpenMenuDate(date);
  };

  const handleMenuClose = () => {
    setOpenMenuDate(null);
  };

  const handleAddWorkout = () => {
    if (!selectedDate) {
      return;
    }

    const params = new URLSearchParams({
      date: format(selectedDate, "yyyy-MM-dd"),
    });

    router.push(`/history/new?${params.toString()}`);
    setOpenMenuDate(null);
  };

  const handleTemplateSelect = (templateId: string) => {
    if (!selectedDate || !templateId) {
      return;
    }

    const params = new URLSearchParams({
      date: format(selectedDate, "yyyy-MM-dd"),
      templateId,
    });

    router.push(`/history/new?${params.toString()}`);
    setOpenMenuDate(null);
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
      <div className="p-0 sm:p-6 bg-muted rounded-lg">
        <div className="bg-background rounded-lg p-3 sm:p-4">
          {/* Header with navigation */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-1 sm:gap-2 sm:justify-start">
              <IconButton
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                aria-label="Go to previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </IconButton>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={goToToday}
              >
                Today
              </Button>
              <IconButton
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                aria-label="Go to next month"
              >
                <ChevronRight className="h-4 w-4" />
              </IconButton>
            </div>
            <h2 className="text-lg font-semibold text-center sm:text-right">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px sm:gap-1 md:gap-2">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-muted-foreground"
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
              const dayWorkouts = getWorkoutsForDate(date);
              const isMenuOpen = openMenuDate && isSameDay(openMenuDate, date);

              return (
                <CalendarDayMenu
                  key={date.toISOString()}
                  date={date}
                  workouts={dayWorkouts}
                  templates={templates || []}
                  isOpen={isMenuOpen || false}
                  onOpenChange={(open) => {
                    if (open) {
                      handleDateClick(date);
                    } else {
                      handleMenuClose();
                    }
                  }}
                  onAddWorkout={handleAddWorkout}
                  onAddFromTemplate={handleTemplateSelect}
                  onEditWorkout={onEditWorkout}
                  onDeleteWorkout={onDeleteWorkout}
                >
                  <button
                    type="button"
                    className={`
                      relative w-full aspect-square md:aspect-auto md:min-h-[72px] p-2 sm:p-3 border rounded-md cursor-pointer
                      transition-all duration-200 hover:scale-[1.02]
                      ${
                        !isCurrentMonth
                          ? "text-muted-foreground/30 bg-muted/20 border-muted-foreground/10 hover:bg-accent/10"
                          : "hover:bg-accent/50 bg-background border-border"
                      }
                      ${isTodayDate && isCurrentMonth ? "text-primary" : ""}
                      ${isSelected && isCurrentMonth ? "bg-primary/10 border-primary border-2" : ""}
                      ${isSelected && !isCurrentMonth ? "bg-muted/80 border-muted-foreground/50 border-2" : ""}
                    `}
                  >
                    <div className="flex h-full flex-col">
                      <div className="flex items-start justify-between">
                        <span
                          className={`text-sm sm:text-base ${isTodayDate && isCurrentMonth ? "font-extrabold" : "font-medium"}`}
                        >
                          {format(date, "d")}
                        </span>
                      </div>

                      {hasWorkoutOnDate && (
                        <div className="flex flex-1 mt-1.5 justify-center">
                          <div className="flex flex-wrap justify-center gap-0.5">
                            {dayWorkouts.map((workout) => (
                              <span
                                key={workout.id}
                                className="text-[10px] md:text-base leading-none"
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {!hasWorkoutOnDate && isSelected && (
                      <span className="sr-only">Selected date</span>
                    )}
                  </button>
                </CalendarDayMenu>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
