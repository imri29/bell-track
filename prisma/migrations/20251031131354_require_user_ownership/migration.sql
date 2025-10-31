/*
  Warnings:

  - Made the column `userId` on table `Workout` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `WorkoutTemplate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Workout" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "WorkoutTemplate" ALTER COLUMN "userId" SET NOT NULL;
