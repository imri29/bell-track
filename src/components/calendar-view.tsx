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
import { Button } from "@/components/ui/button";

type CalendarViewProps = {
  onDateClick: (date: Date) => void;
  workoutDates: Date[];
};

export function CalendarView({ onDateClick, workoutDates }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick(date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="w-full">
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
                    relative min-h-20 p-3 border border-border rounded-md cursor-pointer
                    transition-all duration-200 hover:bg-accent/50 hover:scale-[1.02]
                    ${!isCurrentMonth ? "text-muted-foreground bg-muted/30" : "bg-background"}
                    ${isTodayDate ? "bg-accent text-accent-foreground font-semibold" : ""}
                    ${isSelected ? "bg-primary/10 border-primary border-2" : ""}
                  `}
                >
                  <div className="flex items-start justify-between h-full">
                    <span className="text-sm font-medium">
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
              Selected: {selectedDate.toLocaleDateString()}
            </p>
            <Button className="gap-2" onClick={() => onDateClick(selectedDate)}>
              <Plus className="h-4 w-4" />
              Add Workout for {selectedDate.toLocaleDateString()}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
