import type { Prisma } from "@/generated/prisma";

export const workoutTags: Prisma.WorkoutTagCreateInput[] = [
  {
    name: "EMOM",
    slug: "emom",
    description: "Every minute on the minute sessions for focused pacing.",
  },
  {
    name: "AMRAP",
    slug: "amrap",
    description:
      "As many rounds as possible—perfect for short, intense blocks.",
  },
  {
    name: "Main lift + accessory",
    slug: "main-lift-accessory",
    description: "Anchor session around one lift then layer supportive work.",
  },
  {
    name: "Supersets",
    slug: "supersets",
    description: "Pair movements back-to-back to keep the heart rate up.",
  },
  {
    name: "Complex",
    slug: "complex",
    description: "Flow through linked movements without putting the bell down.",
  },
  {
    name: "Conditioning",
    slug: "conditioning",
    description: "Sweat-focused sessions when you want to move fast.",
  },
  {
    name: "Double Complex",
    slug: "double-complex",
    description: "Double kettlebell complex workout",
  },
];
