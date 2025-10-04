import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex h-full min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center md:px-10">
      <Spinner size="lg" />
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground">
          Preparing Bell Track...
        </p>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Hang tight while we load your dashboard.
        </p>
      </div>
    </div>
  );
}
