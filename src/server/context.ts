import { auth } from "@/auth";

type CreateContextOptions = {
  req?: Request;
};

export async function createTRPCContext(_opts?: CreateContextOptions) {
  const session = await auth();

  return {
    session,
    userId: session?.user?.id,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
