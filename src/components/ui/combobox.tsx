"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

type ComboboxProps<T> = {
  items: T[];
  value: T | null;
  onValueChange: (value: T | null) => void;
  getItemKey: (item: T) => string;
  getItemLabel: (item: T) => string;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  action?: React.ReactNode;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
};

export function Combobox<T>({
  items,
  value,
  onValueChange,
  getItemKey,
  getItemLabel,
  placeholder,
  id,
  className,
  disabled = false,
  action,
  emptyActionLabel,
  onEmptyAction,
}: ComboboxProps<T>) {
  const [portalContainer, setPortalContainer] =
    React.useState<HTMLElement | null>(null);
  const portalProps = portalContainer ? { container: portalContainer } : {};

  // Base UI renders the popup in a Portal (defaults to <body>), but when this field
  // lives inside a Dialog/Drawer, the overlay can sit above the portal and swallow
  // pointer events. We use a callback ref to grab the actual input DOM node once it
  // mounts, find the closest dialog/drawer content container, and then pass that
  // element as the portal target. This keeps the popup within the modal stacking
  // context while still being portaled (avoids clipping/overflow issues).
  const setInputRef = (node: HTMLInputElement | null) => {
    if (!node) {
      return;
    }

    const container = node.closest(
      '[data-slot="dialog-content"], [data-slot="drawer-content"]',
    );
    setPortalContainer(container instanceof HTMLElement ? container : null);
  };

  return (
    <ComboboxPrimitive.Root
      items={items}
      value={value}
      onValueChange={onValueChange}
      itemToStringLabel={getItemLabel}
      isItemEqualToValue={(item, selected) =>
        getItemKey(item) === getItemKey(selected)
      }
      disabled={disabled}
    >
      <div className="flex items-center gap-1">
        <div className="relative w-full">
          <ComboboxPrimitive.Input
            id={id}
            placeholder={placeholder}
            ref={setInputRef}
            className={cn(
              "border-input placeholder:text-muted-foreground h-10 w-full rounded-md border bg-background px-3 pr-12 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
              className,
            )}
          />
          <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1 text-muted-foreground">
            <ComboboxPrimitive.Clear
              className="flex h-8 w-8 items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </ComboboxPrimitive.Clear>
            <ComboboxPrimitive.Trigger
              className="flex h-8 w-8 items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground"
              aria-label="Open list"
            >
              <ChevronsUpDown className="h-4 w-4" />
            </ComboboxPrimitive.Trigger>
          </div>
        </div>
        {action}
      </div>

      <ComboboxPrimitive.Portal {...portalProps}>
        <ComboboxPrimitive.Positioner
          className="z-[1200] outline-none"
          sideOffset={4}
        >
          <ComboboxPrimitive.Popup className="w-(--anchor-width) max-h-[min(18rem,var(--available-height))] overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none">
            <ComboboxPrimitive.Empty className="p-1.5 text-sm text-muted-foreground empty:hidden">
              {emptyActionLabel && onEmptyAction ? (
                <ComboboxPrimitive.Item
                  onClick={onEmptyAction}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <Plus className="h-4 w-4" />
                  {emptyActionLabel}
                </ComboboxPrimitive.Item>
              ) : null}
            </ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List className="p-1 empty:hidden">
              {(item) => (
                <ComboboxPrimitive.Item
                  key={getItemKey(item)}
                  value={item}
                  className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none data-highlighted:bg-accent data-[highlighted]:text-accent-foreground"
                >
                  <ComboboxPrimitive.ItemIndicator className="absolute left-1.5 flex h-4 w-4 items-center justify-center text-primary">
                    <Check className="h-4 w-4" />
                  </ComboboxPrimitive.ItemIndicator>
                  <span>{getItemLabel(item)}</span>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}
