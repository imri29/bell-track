"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

interface ExerciseOrderControlsProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableUp?: boolean;
  disableDown?: boolean;
  children?: ReactNode;
}

export function ExerciseOrderControls({
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
  children,
}: ExerciseOrderControlsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Tooltip content="Move up">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMoveUp}
          disabled={disableUp}
        >
          <ArrowUp className="h-4 w-4" />
          <span className="sr-only">Move up</span>
        </Button>
      </Tooltip>
      <Tooltip content="Move down">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMoveDown}
          disabled={disableDown}
        >
          <ArrowDown className="h-4 w-4" />
          <span className="sr-only">Move down</span>
        </Button>
      </Tooltip>
      {children}
    </div>
  );
}
