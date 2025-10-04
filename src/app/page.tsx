import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export default async function Home() {
  await new Promise((resolve) => setTimeout(resolve, 10000));

  return (
    <PageShell>
      <PageHero
        eyebrow="Bell Track"
        title="Dashboard"
        description="Quick links to build, log, and review your training."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
          <p className="text-muted-foreground mb-4">
            Select a workout to get started.
          </p>
          <Button asChild className="gap-1">
            <Link href="/templates">Select Workout</Link>
          </Button>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Exercises</h3>
          <p className="text-muted-foreground mb-4">
            Manage your exercise library.
          </p>
          <Button asChild className="gap-1">
            <Link href="/exercises">View exercises</Link>
          </Button>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">History</h3>
          <p className="text-muted-foreground mb-4">View past workouts.</p>
          <Button asChild className="gap-1">
            <Link href="/history">View workout history</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
