-- AlterTable
ALTER TABLE "WorkoutExercise" ADD COLUMN "unit" "ExerciseUnit" NOT NULL DEFAULT 'REPS';

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "unit";
