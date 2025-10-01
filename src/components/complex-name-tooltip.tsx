"use client";

import type { ReactNode } from "react";
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ComplexSubExercise = {
  exerciseName: string;
  reps: number;
};

interface ComplexNameTooltipProps {
  name: string;
  subExercises: ComplexSubExercise[] | string | null | undefined;
  className?: string;
  children?: ReactNode;
}

export function ComplexNameTooltip({
  name,
  subExercises,
  className,
  children,
}: ComplexNameTooltipProps) {
  let parsedSubExercises: ComplexSubExercise[] = [];

  if (Array.isArray(subExercises)) {
    parsedSubExercises = subExercises;
  } else if (typeof subExercises === "string") {
    try {
      const maybeArray = JSON.parse(subExercises);
      if (Array.isArray(maybeArray)) {
        parsedSubExercises = maybeArray as ComplexSubExercise[];
      }
    } catch {
      parsedSubExercises = [];
    }
  }

  if (parsedSubExercises.length === 0) {
    return <span className={className}>{children ?? name}</span>;
  }

  return (
    <TooltipProvider delayDuration={150} skipDelayDuration={0}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <span className={cn("cursor-help", className)}>
            {children ?? name}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs space-y-2">
          <p className="text-sm font-medium leading-none">{name}</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {parsedSubExercises.map((item, index) => (
              <li
                key={`${item.exerciseName}-${index}`}
                className="flex items-center gap-2"
              >
                <span className="whitespace-nowrap font-medium text-foreground">
                  {item.reps}
                </span>
                <span className="truncate" title={item.exerciseName}>
                  {item.exerciseName}
                </span>
              </li>
            ))}
          </ul>
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}
