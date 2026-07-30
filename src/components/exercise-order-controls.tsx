"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "@/components/common/icon-button";
import { SimpleTooltip } from "@/components/patterns/simple-tooltip";

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
      <SimpleTooltip content="Move up">
        <IconButton
          type="button"
          variant="ghost"
          onClick={onMoveUp}
          disabled={disableUp}
          aria-label="Move exercise up"
        >
          <ArrowUp className="h-4 w-4" />
        </IconButton>
      </SimpleTooltip>
      <SimpleTooltip content="Move down">
        <IconButton
          type="button"
          variant="ghost"
          onClick={onMoveDown}
          disabled={disableDown}
          aria-label="Move exercise down"
        >
          <ArrowDown className="h-4 w-4" />
        </IconButton>
      </SimpleTooltip>
      {children}
    </div>
  );
}
