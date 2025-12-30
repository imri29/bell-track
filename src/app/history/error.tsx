"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function HistoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          We can't load your workout history
        </h2>
        <p className="text-sm text-muted-foreground">
          Something unexpected happened while fetching your workouts. You can try again or head back
          to the dashboard.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => reset()}>Retry</Button>
        <Button asChild variant="outline">
          <Link href="/">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
