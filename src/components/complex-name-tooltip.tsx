"use client";

import type { ReactNode } from "react";
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
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-is-mobile";
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

  const isMobile = useIsMobile();

  if (parsedSubExercises.length === 0) {
    if (isMobile) {
      return (
        <span className={cn("cursor-pointer", className)}>
          {children ?? name}
        </span>
      );
    }

    return <span className={className}>{children ?? name}</span>;
  }

  const exerciseList = (
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
  );

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <button
            type="button"
            className={cn("cursor-pointer text-left", className)}
          >
            {children ?? name}
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle>{name}</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-3 px-4 pb-6">
            <p className="text-xs text-muted-foreground">Breakdown</p>
            {exerciseList}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
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
          {exerciseList}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}
