"use client";

import { Popover } from "@base-ui/react/popover";
import Fuse from "fuse.js";
import { ArrowLeftRight, Search, Undo2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { type ComplexSubExercise, parseComplexSubExercises } from "@/lib/complex-sub-exercises";
import { cn } from "@/lib/utils";

export type ComplexSubstitutionOption = {
  id: string;
  name: string;
  subExercises: ComplexSubExercise[] | string | null;
};

type ComplexSubstitutionPickerProps = {
  currentComplex: ComplexSubstitutionOption;
  originalComplexId: string;
  complexes: ComplexSubstitutionOption[];
  onSelect: (complexId: string) => void;
  onReset: () => void;
  isModified?: boolean;
};

const triggerClassName =
  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

function formatBreakdown(subExercises: ComplexSubstitutionOption["subExercises"]) {
  return parseComplexSubExercises(subExercises)
    .map((exercise) => `${exercise.reps} ${exercise.exerciseName}`)
    .join(" · ");
}

function PickerContent({
  currentComplex,
  originalComplexId,
  complexes,
  onSelect,
  onReset,
  isModified,
  onDone,
}: ComplexSubstitutionPickerProps & { onDone: () => void }) {
  const [query, setQuery] = useState("");
  const alternatives = useMemo(
    () => complexes.filter((complex) => complex.id !== currentComplex.id),
    [complexes, currentComplex.id],
  );
  const searchItems = useMemo(
    () =>
      alternatives.map((complex) => ({
        complex,
        breakdown: formatBreakdown(complex.subExercises),
      })),
    [alternatives],
  );
  const fuse = useMemo(
    () =>
      new Fuse(searchItems, {
        keys: ["complex.name", "breakdown"],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [searchItems],
  );
  const normalizedQuery = query.trim();
  const filteredItems = useMemo(
    () =>
      normalizedQuery ? fuse.search(normalizedQuery).map((result) => result.item) : searchItems,
    [fuse, normalizedQuery, searchItems],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-1 border-b border-border/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Substitute {currentComplex.name}</p>
            <p className="text-xs text-muted-foreground">
              This won&apos;t change the saved template.
            </p>
          </div>
          {isModified && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 gap-1.5"
              onClick={() => {
                onReset();
                onDone();
              }}
            >
              <Undo2 className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {formatBreakdown(currentComplex.subExercises)}
        </p>
      </div>

      <div className="p-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search other complexes..."
            aria-label="Search other complexes"
            className="pl-9"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2 pt-0">
        {filteredItems.length > 0 ? (
          <div className="space-y-1">
            {filteredItems.map(({ complex, breakdown }) => (
              <button
                key={complex.id}
                type="button"
                onClick={() => {
                  if (complex.id === originalComplexId) {
                    onReset();
                  } else {
                    onSelect(complex.id);
                  }
                  onDone();
                }}
                className="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <span className="block text-sm font-medium text-foreground">{complex.name}</span>
                <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                  {breakdown || "No breakdown available"}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            No other complexes found.
          </p>
        )}
      </div>
    </div>
  );
}

export function ComplexSubstitutionPicker(props: ComplexSubstitutionPickerProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const triggerLabel = `Find a substitute for ${props.currentComplex.name}`;
  const trigger = (
    <button
      type="button"
      className={cn(triggerClassName, props.isModified && "bg-primary/10 text-primary")}
      aria-label={triggerLabel}
    >
      <ArrowLeftRight className="h-3.5 w-3.5" />
    </button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{triggerLabel}</DrawerTitle>
          </DrawerHeader>
          <PickerContent {...props} onDone={() => setOpen(false)} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger render={trigger} />
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={8} className="z-[1200]">
          <Popover.Popup className="flex max-h-[min(28rem,var(--available-height))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg outline-none">
            <PickerContent {...props} onDone={() => setOpen(false)} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
