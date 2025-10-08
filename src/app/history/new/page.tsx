import { NewWorkoutClient } from "@/app/history/new/new-workout-client";
import { extractSearchParam } from "@/lib/utils";

export default async function NewWorkoutPage(props: PageProps<"/history/new">) {
  const searchParams = await props.searchParams;
  const date = extractSearchParam(searchParams.date);
  const templateId = extractSearchParam(searchParams.templateId);

  return <NewWorkoutClient date={date} templateId={templateId} />;
}
