import { ExerciseType, type Prisma, PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

const exercises: Prisma.ExerciseCreateInput[] = [
  {
    name: "Push Press",
    type: ExerciseType.EXERCISE,
    description: "Overhead pressing movement with leg drive",
    subExercises: null,
  },
  {
    name: "Turkish Get-up",
    type: ExerciseType.EXERCISE,
    description: "Full body movement from lying to standing",
    subExercises: null,
  },
  {
    name: "Single Arm Row",
    type: ExerciseType.EXERCISE,
    description: "Pulling movement targeting back muscles",
    subExercises: null,
  },
  {
    name: "Clean",
    type: ExerciseType.EXERCISE,
    description: "Explosive movement from floor to rack position",
    subExercises: null,
  },
  {
    name: "Single Arm Squat",
    type: ExerciseType.EXERCISE,
    description: "Unilateral squat movement (bell in rack position)",
    subExercises: null,
  },
  {
    name: "Zeus Complex",
    type: ExerciseType.COMPLEX,
    description: "6 single arm rows, 5 cleans, 4 single arm squats",
    subExercises: JSON.stringify([
      { exerciseName: "Single Arm Row", reps: 6 },
      { exerciseName: "Clean", reps: 5 },
      { exerciseName: "Single Arm Squat", reps: 4 },
    ]),
  },
];

async function main() {
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: exercise,
      create: exercise,
    });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
