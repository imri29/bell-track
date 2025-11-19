"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "@/components/ui/icon-button";
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
        <IconButton
          type="button"
          variant="ghost"
          onClick={onMoveUp}
          disabled={disableUp}
          aria-label="Move exercise up"
          srText="Move up"
        >
          <ArrowUp className="h-4 w-4" />
        </IconButton>
      </Tooltip>
      <Tooltip content="Move down">
        <IconButton
          type="button"
          variant="ghost"
          onClick={onMoveDown}
          disabled={disableDown}
          aria-label="Move exercise down"
          srText="Move down"
        >
          <ArrowDown className="h-4 w-4" />
        </IconButton>
      </Tooltip>
      {children}
    </div>
  );
}
