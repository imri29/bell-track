import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TemplateExercisesPanelProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

type TemplateExercisesListProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

type TemplateExerciseCardProps = {
  children: ReactNode;
  className?: string;
};

export function TemplateExercisesPanel({
  title,
  children,
  className,
}: TemplateExercisesPanelProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border/50 bg-card/70 pt-2 shadow-sm sm:p-7",
        className,
      )}
    >
      <div className="space-y-6 px-2 py-3 sm:px-0 sm:py-0">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function TemplateExercisesList({
  title = "Template Exercises",
  children,
  className,
}: TemplateExercisesListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function TemplateExerciseCard({ children, className }: TemplateExerciseCardProps) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
