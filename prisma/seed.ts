import { ExerciseType, type Prisma, PrismaClient } from "@/generated/prisma";
import { workoutTags } from "./seed-data";

const prisma = new PrismaClient();

const exercises: Prisma.ExerciseCreateInput[] = [
  // Individual Exercises
  {
    name: "Ballistic Rows",
    type: ExerciseType.EXERCISE,
    description: "Explosive rowing movement",
    subExercises: null,
  },
  {
    name: "Clean & Press",
    type: ExerciseType.EXERCISE,
    description: "Clean followed immediately by press",
    subExercises: null,
  },
  {
    name: "Clean & Thruster",
    type: ExerciseType.EXERCISE,
    description: "Clean followed immediately by thruster",
    subExercises: null,
  },
  {
    name: "Cleans",
    type: ExerciseType.EXERCISE,
    description: "Explosive movement from floor to rack position",
    subExercises: null,
  },
  {
    name: "Dead Clean",
    type: ExerciseType.EXERCISE,
    description: "Clean from dead stop position",
    subExercises: null,
  },
  {
    name: "Deadlift High Pulls",
    type: ExerciseType.EXERCISE,
    description: "Deadlift with high pull finish",
    subExercises: null,
  },
  {
    name: "Single Arm Front Squats",
    type: ExerciseType.EXERCISE,
    description: "Front squat with kettlebell in rack position",
    subExercises: null,
  },
  {
    name: "Goblet Squats",
    type: ExerciseType.EXERCISE,
    description: "Squat holding kettlebell at chest",
    subExercises: null,
  },
  {
    name: "Gorilla Rows",
    type: ExerciseType.EXERCISE,
    description: "Bent-over rowing with alternating arms",
    subExercises: null,
  },
  {
    name: "Gunslingers",
    type: ExerciseType.EXERCISE,
    description: "Lateral swing movement",
    subExercises: null,
  },
  {
    name: "High Pulls",
    type: ExerciseType.EXERCISE,
    description: "Pulling movement to chest height",
    subExercises: null,
  },
  {
    name: "Lunges",
    type: ExerciseType.EXERCISE,
    description: "Forward or reverse stepping lunge",
    subExercises: null,
  },
  {
    name: "Offset Squat Cleans",
    type: ExerciseType.EXERCISE,
    description: "Squat clean with offset grip",
    subExercises: null,
  },
  {
    name: "Overhead Lunges",
    type: ExerciseType.EXERCISE,
    description: "Lunge with kettlebell held overhead",
    subExercises: null,
  },
  {
    name: "Push Press",
    type: ExerciseType.EXERCISE,
    description: "Overhead pressing movement with leg drive",
    subExercises: null,
  },
  {
    name: "Rows",
    type: ExerciseType.EXERCISE,
    description: "Single arm rowing movement",
    subExercises: null,
  },
  {
    name: "Single Arm Deadlifts",
    type: ExerciseType.EXERCISE,
    description: "Deadlift with single kettlebell",
    subExercises: null,
  },
  {
    name: "Snatches",
    type: ExerciseType.EXERCISE,
    description: "Explosive movement from floor to overhead",
    subExercises: null,
  },
  {
    name: "Squat Clean & Thruster",
    type: ExerciseType.EXERCISE,
    description: "Squat clean followed by thruster",
    subExercises: null,
  },
  {
    name: "Squats",
    type: ExerciseType.EXERCISE,
    description: "Basic squat with kettlebell",
    subExercises: null,
  },
  {
    name: "Swing Clean & Thruster",
    type: ExerciseType.EXERCISE,
    description: "Swing into clean and thruster",
    subExercises: null,
  },
  {
    name: "Swings",
    type: ExerciseType.EXERCISE,
    description: "Hip hinge swinging movement",
    subExercises: null,
  },
  {
    name: "Tactical Cleans",
    type: ExerciseType.EXERCISE,
    description: "Clean with controlled tempo",
    subExercises: null,
  },
  {
    name: "Tactical Snatches",
    type: ExerciseType.EXERCISE,
    description: "Snatch with controlled tempo",
    subExercises: null,
  },
  {
    name: "Thrusters",
    type: ExerciseType.EXERCISE,
    description: "Front squat to press combination",
    subExercises: null,
  },
  {
    name: "Two Hand Squat Cleans",
    type: ExerciseType.EXERCISE,
    description: "Squat clean using both hands on bell",
    subExercises: null,
  },
  {
    name: "Windmill",
    type: ExerciseType.EXERCISE,
    description: "Overhead stability movement with side bend",
    subExercises: null,
  },

  // Complexes
  {
    name: "PD Special",
    type: ExerciseType.COMPLEX,
    description: "5 Rows + 5 Swings + 5 Thrusters",
    subExercises: JSON.stringify([
      { exerciseName: "Rows", reps: 5 },
      { exerciseName: "Swings", reps: 5 },
      { exerciseName: "Thrusters", reps: 5 },
    ]),
  },
  {
    name: "Zeus",
    type: ExerciseType.COMPLEX,
    description: "6 Rows + 5 Cleans + 4 Single Arm Front Squats",
    subExercises: JSON.stringify([
      { exerciseName: "Rows", reps: 6 },
      { exerciseName: "Cleans", reps: 5 },
      { exerciseName: "Single Arm Front Squats", reps: 4 },
    ]),
  },
  {
    name: "Hercules",
    type: ExerciseType.COMPLEX,
    description: "3 Swings + 3 Cleans + 3 Push Press",
    subExercises: JSON.stringify([
      { exerciseName: "Swings", reps: 3 },
      { exerciseName: "Cleans", reps: 3 },
      { exerciseName: "Push Press", reps: 3 },
    ]),
  },
  {
    name: "Poseidon",
    type: ExerciseType.COMPLEX,
    description: "4 Swings + 3 High Pulls + 2 Snatches",
    subExercises: JSON.stringify([
      { exerciseName: "Swings", reps: 4 },
      { exerciseName: "High Pulls", reps: 3 },
      { exerciseName: "Snatches", reps: 2 },
    ]),
  },
  {
    name: "Achilles",
    type: ExerciseType.COMPLEX,
    description: "3 Swings + 3 Snatches + 3 Overhead Lunges",
    subExercises: JSON.stringify([
      { exerciseName: "Swings", reps: 3 },
      { exerciseName: "Snatches", reps: 3 },
      { exerciseName: "Overhead Lunges", reps: 3 },
    ]),
  },
  {
    name: "Sisyphus (2 hands on bell)",
    type: ExerciseType.COMPLEX,
    description: "5 Two Hand Squat Cleans + 4 Goblet Squats + 3/leg Lunges",
    subExercises: JSON.stringify([
      { exerciseName: "Two Hand Squat Cleans", reps: 5 },
      { exerciseName: "Goblet Squats", reps: 4 },
      { exerciseName: "Lunges", reps: 3, note: "per leg" },
    ]),
  },
  {
    name: "Gimli (2 hands on bell)",
    type: ExerciseType.COMPLEX,
    description: "5 Swings + 4 Deadlift High Pulls + 3 Goblet Squats",
    subExercises: JSON.stringify([
      { exerciseName: "Swings", reps: 5 },
      { exerciseName: "Deadlift High Pulls", reps: 4 },
      { exerciseName: "Goblet Squats", reps: 3 },
    ]),
  },
  {
    name: "Aragorn",
    type: ExerciseType.COMPLEX,
    description: "6 Rows + 5 Cleans + 4 Push Press",
    subExercises: JSON.stringify([
      { exerciseName: "Rows", reps: 6 },
      { exerciseName: "Cleans", reps: 5 },
      { exerciseName: "Push Press", reps: 4 },
    ]),
  },
  {
    name: "Legolas",
    type: ExerciseType.COMPLEX,
    description: "4 Ballistic Rows + 4 Tactical Cleans + 4 Tactical Snatches",
    subExercises: JSON.stringify([
      { exerciseName: "Ballistic Rows", reps: 4 },
      { exerciseName: "Tactical Cleans", reps: 4 },
      { exerciseName: "Tactical Snatches", reps: 4 },
    ]),
  },
  {
    name: "Elrond",
    type: ExerciseType.COMPLEX,
    description: "5 Single Arm Deadlifts + 4 Cleans + 3 Push Press",
    subExercises: JSON.stringify([
      { exerciseName: "Single Arm Deadlifts", reps: 5 },
      { exerciseName: "Cleans", reps: 4 },
      { exerciseName: "Push Press", reps: 3 },
    ]),
  },
  {
    name: "Gandalf",
    type: ExerciseType.COMPLEX,
    description:
      "Swing + Tactical Clean & Thruster + Tactical Snatch + Windmill x2 reps",
    subExercises: JSON.stringify([
      { exerciseName: "Swings", reps: 2 },
      { exerciseName: "Clean & Thruster", reps: 2, note: "tactical" },
      { exerciseName: "Tactical Snatches", reps: 2 },
      { exerciseName: "Windmill", reps: 2 },
    ]),
  },
  {
    name: "Leonidas",
    type: ExerciseType.COMPLEX,
    description: "4 Cleans + 3 Push Press + 2 Thrusters",
    subExercises: JSON.stringify([
      { exerciseName: "Cleans", reps: 4 },
      { exerciseName: "Push Press", reps: 3 },
      { exerciseName: "Thrusters", reps: 2 },
    ]),
  },
  {
    name: "Codi Special",
    type: ExerciseType.COMPLEX,
    description: "4 Rows + 3 Swings + 2 Snatches",
    subExercises: JSON.stringify([
      { exerciseName: "Rows", reps: 4 },
      { exerciseName: "Swings", reps: 3 },
      { exerciseName: "Snatches", reps: 2 },
    ]),
  },
  {
    name: "Starky Boy",
    type: ExerciseType.COMPLEX,
    description: "Row + Dead Clean + Swing Clean & Thruster x5 reps",
    subExercises: JSON.stringify([
      { exerciseName: "Rows", reps: 5 },
      { exerciseName: "Dead Clean", reps: 5 },
      { exerciseName: "Swing Clean & Thruster", reps: 5 },
    ]),
  },
  {
    name: "Big Mick",
    type: ExerciseType.COMPLEX,
    description: "3 Rows + 4 Swings + 5 Snatches",
    subExercises: JSON.stringify([
      { exerciseName: "Rows", reps: 3 },
      { exerciseName: "Swings", reps: 4 },
      { exerciseName: "Snatches", reps: 5 },
    ]),
  },
  {
    name: "King Kong (double bell)",
    type: ExerciseType.COMPLEX,
    description: "Gorilla Row + Gorilla Row + Squat Clean & Thruster x5 reps",
    subExercises: JSON.stringify([
      { exerciseName: "Gorilla Rows", reps: 5 },
      { exerciseName: "Gorilla Rows", reps: 5 },
      { exerciseName: "Squat Clean & Thruster", reps: 5 },
    ]),
  },
  {
    name: "Devil's Tricycle (2 hands on bell)",
    type: ExerciseType.COMPLEX,
    description: "6 Swings + 6 Deadlift High Pull + 3/side Offset Squat Cleans",
    subExercises: JSON.stringify([
      { exerciseName: "Swings", reps: 6 },
      { exerciseName: "Deadlift High Pulls", reps: 6 },
      { exerciseName: "Offset Squat Cleans", reps: 3, note: "per side" },
    ]),
  },
  {
    name: "4x4 (double bell)",
    type: ExerciseType.COMPLEX,
    description:
      "4/side Gorilla Rows + 4 Gunslingers + 4 Squats + 4 Push Press",
    subExercises: JSON.stringify([
      { exerciseName: "Gorilla Rows", reps: 4, note: "per side" },
      { exerciseName: "Gunslingers", reps: 4 },
      { exerciseName: "Squats", reps: 4 },
      { exerciseName: "Push Press", reps: 4 },
    ]),
  },
  {
    name: "Bledsoe",
    type: ExerciseType.COMPLEX,
    description: "5 Rows + 5 Cleans + 5 Thrusters",
    subExercises: JSON.stringify([
      { exerciseName: "Rows", reps: 5 },
      { exerciseName: "Cleans", reps: 5 },
      { exerciseName: "Thrusters", reps: 5 },
    ]),
  },
  {
    name: "Toga",
    type: ExerciseType.COMPLEX,
    description: "5 Swings + 4 Gunslingers + 3 Clean & Press",
    subExercises: JSON.stringify([
      { exerciseName: "Swings", reps: 5 },
      { exerciseName: "Gunslingers", reps: 4 },
      { exerciseName: "Clean & Press", reps: 3 },
    ]),
  },
];

async function main() {
  console.log("🌱 Seeding exercises...");
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: exercise,
      create: exercise,
    });
  }
  console.log("✅ Exercises seeded!");

  console.log("🏷️ Seeding workout tags...");
  for (const tag of workoutTags) {
    await prisma.workoutTag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
  }
  console.log("✅ Workout tags seeded!");

  const templateTagSlugs = ["complex", "conditioning"] as const;
  const templateTags = await prisma.workoutTag.findMany({
    where: {
      slug: {
        in: [...templateTagSlugs],
      },
    },
  });

  console.log("🧩 Seeding workout template...");

  const leonidaComplex = await prisma.exercise.findUnique({
    where: { name: "Leonidas" },
  });
  const swings = await prisma.exercise.findUnique({
    where: { name: "Swings" },
  });

  await prisma.workoutTemplate.upsert({
    where: { id: "seed-template-leonidas-conditioning" },
    update: {
      name: "Leonidas conditioning session",
      description: "Leonidas complex followed by a swings finisher.",
      exercises: {
        deleteMany: {},
        create: [
          {
            // biome-ignore lint/style/noNonNullAssertion: Seed data expects existing exercise
            exerciseId: leonidaComplex!.id,
            group: "A",
            order: 0,
            sets: 5,
            reps: "[1,1,1,1,1]",
            weight: 24,
            restTime: 90,
            notes: "Focus on pacing the complex reps.",
          },
          {
            // biome-ignore lint/style/noNonNullAssertion: Seed data expects existing exercise
            exerciseId: swings!.id,
            group: "B",
            order: 1,
            sets: 3,
            reps: "[12,12,12]",
            weight: 20,
            restTime: 30,
            notes: "Hardstyle swings, 12 each arm.",
          },
        ],
      },
      tags: {
        deleteMany: {},
        create: templateTags.map((tag) => ({
          tag: { connect: { id: tag.id } },
        })),
      },
    },
    create: {
      id: "seed-template-leonidas-conditioning",
      name: "Leonidas conditioning session",
      description: "Leonidas complex followed by a swings finisher.",
      exercises: {
        create: [
          {
            // biome-ignore lint/style/noNonNullAssertion: Seed data expects existing exercise
            exerciseId: leonidaComplex!.id,
            group: "A",
            order: 0,
            sets: 5,
            reps: "[1,1,1,1,1]",
            weight: 24,
            restTime: 90,
            notes: "Focus on pacing the complex reps.",
          },
          {
            // biome-ignore lint/style/noNonNullAssertion: Seed data expects existing exercise
            exerciseId: swings!.id,
            group: "B",
            order: 1,
            sets: 3,
            reps: "[12,12,12]",
            weight: 20,
            restTime: 30,
            notes: "Hardstyle swings, 12 each arm.",
          },
        ],
      },
      tags: {
        create: templateTags.map((tag) => ({
          tag: { connect: { id: tag.id } },
        })),
      },
    },
  });

  console.log("✅ Workout template seeded!");

  // Add sample workout
  console.log("🏋️ Seeding sample workout...");

  // Create Pull-ups and Farmers Carry if they don't exist
  const pullups = await prisma.exercise.upsert({
    where: { name: "Pull-ups" },
    update: {},
    create: {
      name: "Pull-ups",
      type: ExerciseType.EXERCISE,
      description: "Bodyweight pulling exercise",
      subExercises: null,
    },
  });

  const farmersCarry = await prisma.exercise.upsert({
    where: { name: "Farmers Carry" },
    update: {},
    create: {
      name: "Farmers Carry",
      type: ExerciseType.EXERCISE,
      description: "Carrying heavy weights for time or distance",
      subExercises: null,
    },
  });

  // Create the sample workout
  const workout = await prisma.workout.create({
    data: {
      date: new Date(),
      duration: 45, // 45 minutes
      notes:
        "Sample workout with A/B grouping - Leonidas complex + accessory work",
      exercises: {
        create: [
          // A1: Leonidas Complex
          {
            // biome-ignore lint/style/noNonNullAssertion: <leave me alone>
            exerciseId: leonidaComplex!.id,
            group: "A",
            order: 1,
            sets: 5,
            reps: "[1,1,1,1,1]", // 1 complex per set
            weight: 24, // 24kg kettlebell
            restTime: 90, // 1:30 minutes = 90 seconds
            notes: "Focus on form, rest 1:30 between sets",
          },
          // B1: Swings
          {
            // biome-ignore lint/style/noNonNullAssertion: <leave me alone>
            exerciseId: swings!.id,
            group: "B",
            order: 1,
            sets: 3,
            reps: "[8,8,8]", // 8 each arm = 16 total per set
            weight: 20, // 20kg
            restTime: 30,
            notes: "8 each arm, alternate arms",
          },
          // B2: Pull-ups
          {
            exerciseId: pullups.id,
            group: "B",
            order: 2,
            sets: 3,
            reps: "[8,8,8]",
            weight: 0, // Bodyweight
            restTime: 30,
            notes: "Full range of motion",
          },
          // B3: Farmers Carry
          {
            exerciseId: farmersCarry.id,
            group: "B",
            order: 3,
            sets: 3,
            reps: "[20,20,20]", // 20 seconds each arm
            weight: 24, // 24kg per hand
            restTime: 60,
            notes: "20 seconds each arm, maintain posture",
          },
        ],
      },
    },
  });

  console.log("✅ Sample workout created!");
  console.log(`Workout ID: ${workout.id}`);

  console.log("🏷️ Assigning tags to sample workout...");
  for (const tag of templateTags) {
    await prisma.workoutTagAssignment.upsert({
      where: {
        workoutId_tagId: {
          workoutId: workout.id,
          tagId: tag.id,
        },
      },
      update: {},
      create: {
        workoutId: workout.id,
        tagId: tag.id,
      },
    });
  }

  console.log("✅ Tags assigned to sample workout!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
