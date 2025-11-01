import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/context";
import { createCallerFactory } from "@/server/trpc";

const createCaller = createCallerFactory(appRouter);

export async function createServerCaller() {
  return createCaller(await createTRPCContext());
}
