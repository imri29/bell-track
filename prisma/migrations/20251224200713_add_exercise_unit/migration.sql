-- CreateEnum
CREATE TYPE "ExerciseUnit" AS ENUM ('REPS', 'TIME');

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN "unit" "ExerciseUnit" NOT NULL DEFAULT 'REPS';
