import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@/server/trpc";

const createCaller = createCallerFactory(appRouter);

/**
 * Server-side helper that creates a caller instance to call tRPC procedures directly on the server.
 * This is useful for:
 * - Server components
 * - API routes
 * - Server actions
 */
export const api = createCaller({});
