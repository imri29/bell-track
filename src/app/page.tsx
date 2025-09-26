import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="p-4 md:p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Welcome to Bell Track
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
            <p className="text-muted-foreground mb-4">
              Select a workout to get started
            </p>
            <Button asChild className={"gap-1"}>
              <Link href="/templates">Select Workout</Link>
            </Button>
          </div>
          <div className="p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Exercises</h3>
            <p className="text-muted-foreground mb-4">
              Manage your exercise library
            </p>
            <Button asChild className={"gap-1"}>
              <Link href="/exercises">View exercises</Link>
            </Button>
          </div>
          <div className="p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-2">History</h3>
            <p className="text-muted-foreground mb-4">View past workouts</p>
            <Button asChild className={"gap-1"}>
              <Link href="/history">View workout history</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
