"use client";

import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";

type BaseButtonProps = ComponentProps<typeof Button>;

export type IconButtonProps = Omit<BaseButtonProps, "children"> & {
  children: ReactNode;
  "aria-label": string;
  srText?: string;
};

/**
 * IconButton wraps the base Button and enforces an aria-label so icon-only
 * controls remain accessible. It always applies the `icon` size variant
 * so spacing and padding stay consistent.
 */
export function IconButton({
  srText,
  children,
  size = "icon",
  ...props
}: IconButtonProps) {
  return (
    <Button size={size} {...props}>
      {children}
      {srText ? <span className="sr-only">{srText}</span> : null}
    </Button>
  );
}
