import { PrismaClient } from "@/generated/prisma";
import { workoutTags } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🏷️ Seeding workout tags (prod)...");
  for (const tag of workoutTags) {
    await prisma.workoutTag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
  }
  console.log("✅ Workout tags ready!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
