import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  actionsClassName?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
  contentClassName,
  actionsClassName,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-8 rounded-3xl border border-border/60 bg-background/95 p-7 shadow-lg shadow-black/5 backdrop-blur-sm md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className={cn("space-y-3", contentClassName)}>
        {eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>
        {description ? (
          typeof description === "string" ? (
            <p className="max-w-xl text-base text-muted-foreground">{description}</p>
          ) : (
            <div className="max-w-xl text-base text-muted-foreground">{description}</div>
          )
        ) : null}
      </div>
      {children ? (
        <div
          className={cn(
            "flex flex-col items-start gap-4 sm:flex-row sm:items-center",
            actionsClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
