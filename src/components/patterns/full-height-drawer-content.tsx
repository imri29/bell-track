"use client";

import type { ComponentProps } from "react";
import { DrawerContent } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

type FullHeightDrawerContentProps = ComponentProps<typeof DrawerContent>;

export function FullHeightDrawerContent({ className, ...props }: FullHeightDrawerContentProps) {
  return (
    <DrawerContent
      className={cn(
        "data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:h-dvh data-[vaul-drawer-direction=bottom]:max-h-[100vh] data-[vaul-drawer-direction=bottom]:rounded-none",
        className,
      )}
      {...props}
    />
  );
}
