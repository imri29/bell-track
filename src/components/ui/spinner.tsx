"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader } from "lucide-react";
import type { SVGAttributes } from "react";
import { cn } from "@/lib/utils";

const spinnerVariants = cva("inline-flex animate-spin", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      default: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-8 w-8",
    },
    variant: {
      primary: "text-primary",
      muted: "text-muted-foreground",
      white: "text-white",
      subtle: "text-muted-foreground/70",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "primary",
  },
});

export interface SpinnerProps
  extends SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {}

export function Spinner({ className, size, variant, ...props }: SpinnerProps) {
  return (
    <Loader
      role="status"
      aria-label="Loading"
      aria-live="polite"
      className={cn(spinnerVariants({ size, variant, className }))}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    />
  );
}
