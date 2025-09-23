import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";

export const exerciseRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(() => {
    // This will later fetch from database
    return [
      {
        id: 1,
        name: "Kettlebell Swing",
        muscleGroups: ["Glutes", "Hamstrings", "Core"],
      },
      { id: 2, name: "Turkish Get-up", muscleGroups: ["Full Body"] },
    ];
  }),
});
