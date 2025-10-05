-- CreateTable
CREATE TABLE "WorkoutTagAssignment" (
    "workoutId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkoutTagAssignment_pkey" PRIMARY KEY ("workoutId", "tagId")
);

-- AddForeignKey
ALTER TABLE "WorkoutTagAssignment" ADD CONSTRAINT "WorkoutTagAssignment_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutTagAssignment" ADD CONSTRAINT "WorkoutTagAssignment_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "WorkoutTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
