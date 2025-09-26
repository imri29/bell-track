/*
  Warnings:

  - You are about to drop the `WorkoutTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutTemplateExercise` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "WorkoutTemplate_name_key";

-- DropIndex
DROP INDEX "WorkoutTemplateExercise_templateId_exerciseId_order_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WorkoutTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WorkoutTemplateExercise";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WorkoutExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "weight" REAL,
    "restTime" INTEGER,
    "notes" TEXT,
    "group" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkoutExercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WorkoutExercise" ("createdAt", "exerciseId", "group", "id", "notes", "order", "reps", "restTime", "sets", "weight", "workoutId") SELECT "createdAt", "exerciseId", "group", "id", "notes", "order", "reps", "restTime", "sets", "weight", "workoutId" FROM "WorkoutExercise";
DROP TABLE "WorkoutExercise";
ALTER TABLE "new_WorkoutExercise" RENAME TO "WorkoutExercise";
CREATE UNIQUE INDEX "WorkoutExercise_workoutId_exerciseId_order_key" ON "WorkoutExercise"("workoutId", "exerciseId", "order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
