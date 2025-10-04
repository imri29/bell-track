"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
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
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center md:px-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground">
          We ran into an issue while loading this page. You can try again or
          head back to the dashboard.
        </p>
        {error.digest ? (
          <code className="inline-flex rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            Error ID: {error.digest}
          </code>
        ) : null}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
