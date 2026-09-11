import { ExerciseType, PrismaClient } from "@prisma/client";

type SuggestedMetadata = {
  movementGroup: "PUSH" | "PULL" | "CORE" | "LEGS";
  movementPlane: "VERTICAL" | "HORIZONTAL" | null;
  legBias: "QUAD_DOMINANT" | "HAMSTRING_DOMINANT" | null;
  reason: string;
};

const prisma = new PrismaClient();

function hasAny(text: string, needles: readonly string[]) {
  return needles.some((needle) => text.includes(needle));
}

function suggestFromName(name: string): SuggestedMetadata | null {
  const lower = name.toLowerCase();

  // Exact-name corrections take priority over broad keyword rules. Several
  // kettlebell movements combine multiple patterns, so keyword order alone
  // would classify them incorrectly.
  if (lower === "clean & press" || lower === "single bell press" || lower === "strict press") {
    return {
      movementGroup: "PUSH",
      movementPlane: "VERTICAL",
      legBias: null,
      reason: "exact pressing movement override",
    };
  }

  if (lower.includes("chest press")) {
    return {
      movementGroup: "PUSH",
      movementPlane: "HORIZONTAL",
      legBias: null,
      reason: "exact chest press override",
    };
  }

  if (["push ups", "ring push ups"].includes(lower)) {
    return {
      movementGroup: "PUSH",
      movementPlane: "HORIZONTAL",
      legBias: null,
      reason: "exact push-up override",
    };
  }

  if (["chin ups", "pull-ups"].includes(lower)) {
    return {
      movementGroup: "PULL",
      movementPlane: "VERTICAL",
      legBias: null,
      reason: "exact vertical-pull override",
    };
  }

  if (lower.includes("face pull")) {
    return {
      movementGroup: "PULL",
      movementPlane: "HORIZONTAL",
      legBias: null,
      reason: "exact face-pull override",
    };
  }

  if (lower.includes("deadlift high pull")) {
    return {
      movementGroup: "PULL",
      movementPlane: "VERTICAL",
      legBias: null,
      reason: "exact deadlift high-pull override",
    };
  }

  // Legs - quad dominant
  if (hasAny(lower, ["squat", "thruster", "lunge"])) {
    return {
      movementGroup: "LEGS",
      movementPlane: null,
      legBias: "QUAD_DOMINANT",
      reason: "contains squat/thruster/lunge keyword",
    };
  }

  // Legs - hamstring dominant
  if (hasAny(lower, ["deadlift", "swing"])) {
    return {
      movementGroup: "LEGS",
      movementPlane: null,
      legBias: "HAMSTRING_DOMINANT",
      reason: "contains deadlift/swing keyword",
    };
  }

  // Pull - vertical
  if (hasAny(lower, ["snatch", "high pull", "clean"])) {
    return {
      movementGroup: "PULL",
      movementPlane: "VERTICAL",
      legBias: null,
      reason: "contains snatch/high pull/clean keyword",
    };
  }

  // Pull - horizontal
  if (hasAny(lower, ["row"])) {
    return {
      movementGroup: "PULL",
      movementPlane: "HORIZONTAL",
      legBias: null,
      reason: "contains row keyword",
    };
  }

  // Push - vertical
  if (hasAny(lower, ["push press", "press"])) {
    return {
      movementGroup: "PUSH",
      movementPlane: "VERTICAL",
      legBias: null,
      reason: "contains press keyword",
    };
  }

  // Core
  if (hasAny(lower, ["windmill", "carry", "plank", "twist"])) {
    return {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
      reason: "contains core-focused keyword",
    };
  }

  return null;
}

function toDisplayValue(value: string | null | undefined) {
  return value ?? "-";
}

async function main() {
  const exercises = await prisma.exercise.findMany({
    where: { type: ExerciseType.EXERCISE },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      movementGroup: true,
      movementPlane: true,
      legBias: true,
    },
  });

  const mapped: Array<
    SuggestedMetadata & {
      id: string;
      name: string;
      hasExistingMetadata: boolean;
    }
  > = [];
  const unmapped: Array<{
    id: string;
    name: string;
    hasExistingMetadata: boolean;
  }> = [];

  for (const exercise of exercises) {
    const hasExistingMetadata =
      exercise.movementGroup !== null ||
      exercise.movementPlane !== null ||
      exercise.legBias !== null;
    const suggestion = suggestFromName(exercise.name);

    if (suggestion) {
      mapped.push({
        id: exercise.id,
        name: exercise.name,
        hasExistingMetadata,
        ...suggestion,
      });
    } else {
      unmapped.push({
        id: exercise.id,
        name: exercise.name,
        hasExistingMetadata,
      });
    }
  }

  console.log(`Found ${exercises.length} EXERCISE rows.`);
  console.log(
    `Suggested mappings: ${mapped.length}. Unmapped/needs manual review: ${unmapped.length}.`,
  );

  console.log("\n=== Suggested Mappings ===");
  for (const entry of mapped) {
    console.log(
      [
        entry.name,
        `group=${entry.movementGroup}`,
        `plane=${toDisplayValue(entry.movementPlane)}`,
        `legBias=${toDisplayValue(entry.legBias)}`,
        `existing=${entry.hasExistingMetadata ? "yes" : "no"}`,
        `reason=${entry.reason}`,
      ].join(" | "),
    );
  }

  console.log("\n=== Needs Manual Review ===");
  for (const entry of unmapped) {
    console.log(
      [entry.name, `existing=${entry.hasExistingMetadata ? "yes" : "no"}`, `id=${entry.id}`].join(
        " | ",
      ),
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
