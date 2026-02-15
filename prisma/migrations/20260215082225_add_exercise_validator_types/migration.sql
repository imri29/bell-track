-- CreateEnum
CREATE TYPE "MovementGroup" AS ENUM ('PUSH', 'PULL', 'CORE', 'LEGS');

-- CreateEnum
CREATE TYPE "MovementPlane" AS ENUM ('VERTICAL', 'HORIZONTAL');

-- CreateEnum
CREATE TYPE "LegBias" AS ENUM ('QUAD_DOMINANT', 'HAMSTRING_DOMINANT');

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "legBias" "LegBias",
ADD COLUMN     "movementGroup" "MovementGroup",
ADD COLUMN     "movementPlane" "MovementPlane";
