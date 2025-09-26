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
              Ready to start your workout?
            </p>
            <Link href="/workouts">
              <Button>Start Workout</Button>
            </Link>
          </div>
          <div className="p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Exercises</h3>
            <p className="text-muted-foreground">
              Manage your exercise library
            </p>
          </div>
          <div className="p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-2">History</h3>
            <p className="text-muted-foreground">View past workouts</p>
          </div>
        </div>
      </main>
    </div>
  );
}
