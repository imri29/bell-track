import type { SearchParams } from "next/dist/server/request/search-params";
import { HistoryPageClient } from "./history-page-client";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const view = (await searchParams).view === "calendar" ? "calendar" : "list";

  return <HistoryPageClient initialView={view} />;
}
