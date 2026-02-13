import Linkify from "linkify-react";
import type { ReactNode } from "react";
import { SectionedExerciseList } from "@/components/sectioned-exercise-list";
import { getTagPalette } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";

type SessionTag = {
  id: string;
  name: string;
  slug: string;
};

type SessionExercise = {
  id: string;
  sets: number;
  unit: "REPS" | "TIME";
  reps: string;
  weight: number | null;
  group?: string | null;
  order: number;
  sectionTitle?: string | null;
  exercise: {
    name: string;
    type: string;
    subExercises: string | null;
  };
};

function Root({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded border bg-background p-4", className)}>{children}</div>;
}

function Header({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-start justify-between", className)}>{children}</div>;
}

function Title({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("font-semibold", className)}>{children}</h3>;
}

function Subtitle({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mt-1 text-sm text-muted-foreground", className)}>{children}</p>;
}

function Actions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex gap-2", className)}>{children}</div>;
}

function Description({ children, className }: { children: ReactNode; className?: string }) {
  if (children === null || children === undefined || children === "") {
    return null;
  }

  if (typeof children !== "string") {
    return (
      <p className={cn("mt-2 whitespace-pre-wrap break-words text-sm", className)}>{children}</p>
    );
  }

  return (
    <p className={cn("mt-2 whitespace-pre-wrap break-words text-sm", className)}>
      <Linkify
        options={{
          defaultProtocol: "https",
          target: "_blank",
          rel: "noopener noreferrer",
          className: "underline underline-offset-2 break-all",
        }}
      >
        {children}
      </Linkify>
    </p>
  );
}

function Tags({
  tags,
  className,
  size = "md",
}: {
  tags: SessionTag[] | undefined;
  className?: string;
  size?: "md" | "sm";
}) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const chipClassName =
    size === "sm"
      ? "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium leading-tight"
      : "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium leading-tight";

  const dotClassName =
    size === "sm" ? "h-1.5 w-1.5 shrink-0 rounded-full" : "h-2 w-2 shrink-0 rounded-full";

  return (
    <div className={cn("mt-3 flex flex-wrap gap-2", className)}>
      {tags.map((tag) => {
        const palette = getTagPalette(tag.slug);
        return (
          <span key={tag.id} className={cn(chipClassName, palette.tint)}>
            <span aria-hidden="true" className={cn(dotClassName, palette.dot)} />
            {tag.name}
          </span>
        );
      })}
    </div>
  );
}

function ExerciseList({
  exercises,
  renderItem,
  maxItems,
  className,
  dividerClassName,
  sectionTitleClassName,
}: {
  exercises: SessionExercise[];
  renderItem: (context: { exercise: SessionExercise; displayLabel: string }) => ReactNode;
  maxItems?: number;
  className?: string;
  dividerClassName?: string;
  sectionTitleClassName?: string;
}) {
  return (
    <SectionedExerciseList
      exercises={exercises}
      renderItem={renderItem}
      maxItems={maxItems}
      className={className}
      dividerClassName={dividerClassName}
      sectionTitleClassName={sectionTitleClassName}
    />
  );
}

export const SessionCard = {
  Root,
  Header,
  Title,
  Subtitle,
  Description,
  Actions,
  Tags,
  ExerciseList,
};
