import { createTRPCRouter } from "@/server/trpc";
import { exerciseRouter } from "./routers/exercise";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  exercise: exerciseRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
