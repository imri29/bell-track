"use client";

import { Button } from "@/components/ui/button";

interface ExerciseFormActionsProps {
  onCancel: () => void;
  isPending: boolean;
  submitText?: string;
  loadingText?: string;
}

export function ExerciseFormActions({
  onCancel,
  isPending,
  submitText = "Add Exercise",
  loadingText = "Adding...",
}: ExerciseFormActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isPending}>
        {isPending ? loadingText : submitText}
      </Button>
    </div>
  );
}
