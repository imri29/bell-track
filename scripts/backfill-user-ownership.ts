import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

function getEmailFromArgs() {
  const emailFlagIndex = process.argv.findIndex((arg) =>
    ["--email", "-e"].includes(arg),
  );

  if (emailFlagIndex !== -1) {
    return process.argv[emailFlagIndex + 1];
  }

  return process.env.BACKFILL_EMAIL;
}

async function main() {
  const email = getEmailFromArgs();

  if (!email) {
    console.error(
      "Missing user email. Pass --email you@example.com or set BACKFILL_EMAIL.",
    );
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(
      `No user found for ${email}. Sign in first so the user record exists.`,
    );
    process.exit(1);
  }

  console.log(`Found user ${user.id} (${email}). Updating records...`);

  const workoutsWithNullUser = await prisma.$executeRaw`
    UPDATE "Workout"
    SET "userId" = ${user.id}
    WHERE "userId" IS NULL
  `;

  const workoutsWithEmptyUser = await prisma.$executeRaw`
    UPDATE "Workout"
    SET "userId" = ${user.id}
    WHERE "userId" = ''
  `;

  const templatesWithNullUser = await prisma.$executeRaw`
    UPDATE "WorkoutTemplate"
    SET "userId" = ${user.id}
    WHERE "userId" IS NULL
  `;

  const templatesWithEmptyUser = await prisma.$executeRaw`
    UPDATE "WorkoutTemplate"
    SET "userId" = ${user.id}
    WHERE "userId" = ''
  `;

  const totalWorkouts =
    Number(workoutsWithNullUser) + Number(workoutsWithEmptyUser);
  const totalTemplates =
    Number(templatesWithNullUser) + Number(templatesWithEmptyUser);

  console.log(`Assigned ${totalWorkouts} workouts.`);
  console.log(`Assigned ${totalTemplates} workout templates.`);
}

main()
  .then(() => console.log("Backfill complete."))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
