"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import Fuse from "fuse.js";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

type SearchableComboboxProps<T> = {
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

type ComboboxOption<T> = { kind: "item"; item: T } | { kind: "create"; label: string };
type SearchItem<T> = { item: T; label: string };

export function SearchableCombobox<T>({
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
}: SearchableComboboxProps<T>) {
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const portalProps = portalContainer ? { container: portalContainer } : {};
  const normalizedQuery = inputValue.trim().toLocaleLowerCase();
  const searchItems = React.useMemo<SearchItem<T>[]>(
    () => items.map((item) => ({ item, label: getItemLabel(item) })),
    [getItemLabel, items],
  );
  const fuse = React.useMemo(
    () =>
      new Fuse(searchItems, {
        keys: ["label"],
        threshold: 0.5,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [searchItems],
  );
  const filteredItems = React.useMemo(
    () =>
      normalizedQuery.length === 0
        ? items
        : fuse.search(normalizedQuery).map((result) => result.item.item),
    [fuse, items, normalizedQuery],
  );
  const canCreateNew = Boolean(
    emptyActionLabel && onEmptyAction && normalizedQuery.length > 0 && filteredItems.length === 0,
  );
  const options = React.useMemo<ComboboxOption<T>[]>(
    () => [
      ...filteredItems.map((item) => ({ kind: "item" as const, item })),
      ...(canCreateNew && emptyActionLabel
        ? [{ kind: "create" as const, label: emptyActionLabel }]
        : []),
    ],
    [canCreateNew, emptyActionLabel, filteredItems],
  );
  const selectedOption: ComboboxOption<T> | null =
    value === null ? null : { kind: "item", item: value };

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

    const container = node.closest('[data-slot="dialog-content"], [data-slot="drawer-content"]');
    setPortalContainer(container instanceof HTMLElement ? container : null);
  };

  return (
    <ComboboxPrimitive.Root<ComboboxOption<T>>
      items={options}
      filteredItems={options}
      filter={null}
      value={selectedOption}
      onValueChange={(nextOption) => {
        if (nextOption === null) {
          onValueChange(null);
          return;
        }

        if (nextOption.kind === "create") {
          onEmptyAction?.();
          return;
        }

        onValueChange(nextOption.item);
      }}
      onInputValueChange={setInputValue}
      itemToStringLabel={(option) =>
        option.kind === "item" ? getItemLabel(option.item) : option.label
      }
      isItemEqualToValue={(option, selected) => {
        if (option.kind === "create" && selected.kind === "create") {
          return option.label === selected.label;
        }

        if (option.kind === "item" && selected.kind === "item") {
          return getItemKey(option.item) === getItemKey(selected.item);
        }

        return false;
      }}
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
        <ComboboxPrimitive.Positioner className="z-[1200] outline-none" sideOffset={4}>
          <ComboboxPrimitive.Popup className="w-(--anchor-width) max-h-[min(18rem,var(--available-height))] overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none">
            <ComboboxPrimitive.Empty className="p-1.5 text-sm text-muted-foreground empty:hidden">
              No results found
            </ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List className="p-1 empty:hidden">
              {(option) =>
                option.kind === "create" ? (
                  <ComboboxPrimitive.Item
                    key={`create-${option.label}`}
                    value={option}
                    className="flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-2 text-sm font-medium outline-none data-highlighted:bg-accent data-[highlighted]:text-accent-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{option.label}</span>
                  </ComboboxPrimitive.Item>
                ) : (
                  <ComboboxPrimitive.Item
                    key={getItemKey(option.item)}
                    value={option}
                    className="flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none data-highlighted:bg-accent data-[highlighted]:text-accent-foreground"
                  >
                    <span className="flex h-4 w-4 items-center justify-center text-primary">
                      <ComboboxPrimitive.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </ComboboxPrimitive.ItemIndicator>
                    </span>
                    <span>{getItemLabel(option.item)}</span>
                  </ComboboxPrimitive.Item>
                )
              }
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}
