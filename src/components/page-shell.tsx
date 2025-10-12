import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  glowClassName?: string;
  withGlow?: boolean;
}

export function PageShell({
  children,
  className,
  mainClassName,
  glowClassName,
  withGlow = true,
}: PageShellProps) {
  return (
    <div className={cn("relative isolate w-full", className)}>
      {withGlow ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 blur-3xl",
            glowClassName,
          )}
        />
      ) : null}
      <main
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-12 md:px-10 md:pt-24",
          mainClassName,
        )}
      >
        {children}
      </main>
    </div>
  );
}
