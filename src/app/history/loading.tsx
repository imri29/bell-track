import { PageShell } from "@/components/page-shell";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <PageShell withGlow={false} mainClassName="items-center justify-center">
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 text-center">
        <Spinner size="lg" variant="muted" />
        <p className="text-sm text-muted-foreground">Loading workout history&hellip;</p>
      </div>
    </PageShell>
  );
}
