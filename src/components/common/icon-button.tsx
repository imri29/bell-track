"use client";

import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BaseButtonProps = ComponentProps<typeof Button>;

export type IconButtonProps = Omit<BaseButtonProps, "children"> & {
  children: ReactNode;
  "aria-label": string;
  tone?: "default" | "destructive";
};

/**
 * IconButton wraps the base Button and enforces an aria-label so icon-only
 * controls remain accessible. It always applies the `icon` size variant
 * so spacing and padding stay consistent.
 */
export function IconButton({
  children,
  className,
  size = "icon",
  tone = "default",
  ...props
}: IconButtonProps) {
  return (
    <Button
      size={size}
      className={cn(
        tone === "destructive" &&
          "text-muted-foreground hover:bg-background/75 hover:text-foreground dark:text-muted-foreground dark:hover:bg-muted/30 dark:hover:text-destructive dark:focus-visible:text-destructive",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
