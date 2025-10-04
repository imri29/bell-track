import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center md:px-10">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="text-3xl font-semibold text-foreground">
          This page could not be found
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          We couldn't find the workout or page you were looking for. Double
          check the URL or return to your dashboard to continue tracking.
        </p>
      </div>
      <Button asChild className="gap-2">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </Button>
    </div>
  );
}
