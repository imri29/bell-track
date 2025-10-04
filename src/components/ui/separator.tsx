import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const ORIENTATIONS = {
  horizontal: "h-px w-full",
  vertical: "h-full w-px",
} satisfies Record<Required<SeparatorProps>["orientation"], string>;

export interface SeparatorProps extends ComponentPropsWithoutRef<"div"> {
  decorative?: boolean;
  orientation?: "horizontal" | "vertical";
  asChild?: boolean;
}

export function Separator({
  decorative = false,
  orientation = "horizontal",
  className,
  asChild,
  ...props
}: SeparatorProps) {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      role={decorative ? "presentation" : "separator"}
      aria-orientation={orientation}
      className={cn("bg-border", ORIENTATIONS[orientation], className)}
      {...props}
    />
  );
}
