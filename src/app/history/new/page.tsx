import { NewWorkoutClient } from "@/app/history/new/new-workout-client";
import { extractSearchParam } from "@/lib/utils";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const date = extractSearchParam(resolvedSearchParams.date);
  const templateId = extractSearchParam(resolvedSearchParams.templateId);

  return <NewWorkoutClient date={date} templateId={templateId} />;
}
