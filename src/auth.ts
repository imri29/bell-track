import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/server/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  trustHost: true,
  providers: [Google],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async session({ session, user }) {
      if (!session.user) {
        return session;
      }

      if (user?.id) {
        session.user.id = user.id;
        return session;
      }

      if (session.user.id) {
        return session;
      }

      if (session.user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
        }
      }

      return session;
    },
  },
});
