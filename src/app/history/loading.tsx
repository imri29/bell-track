import { PageHero } from "@/components/page-hero";
import { PageShell } from "@/components/page-shell";

export default function Loading() {
  const skeletonItems = [1, 2, 3, 4] as const;

  return (
    <PageShell>
      <PageHero
        eyebrow="Bell Track"
        title="Workout history"
        description="Loading your recent workouts"
      />

      <section className="space-y-6">
        <div className="grid gap-4 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="h-8 w-40 rounded-md bg-muted/40 animate-pulse" />
              <div className="h-4 w-64 rounded-md bg-muted/30 animate-pulse" />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="h-10 w-36 rounded-md bg-muted/30 animate-pulse" />
              <div className="h-10 w-48 rounded-md bg-muted/30 animate-pulse" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {skeletonItems.map((item) => (
              <div
                key={item}
                className="h-32 rounded-2xl border border-border/60 bg-muted/20 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
