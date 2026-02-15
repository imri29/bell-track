import { ExerciseType, PrismaClient } from "@/generated/prisma";

type MovementGroup = "PUSH" | "PULL" | "CORE" | "LEGS";
type MovementPlane = "VERTICAL" | "HORIZONTAL" | null;
type LegBias = "QUAD_DOMINANT" | "HAMSTRING_DOMINANT" | null;

type MetadataSuggestion = {
  movementGroup: MovementGroup;
  movementPlane: MovementPlane;
  legBias: LegBias;
  reason: string;
};

const prisma = new PrismaClient();

function hasAny(text: string, needles: readonly string[]) {
  return needles.some((needle) => text.includes(needle));
}

function fromExactOverride(name: string): MetadataSuggestion | null {
  const exact: Record<string, Omit<MetadataSuggestion, "reason">> = {
    "Clean & Press": {
      movementGroup: "PUSH",
      movementPlane: "VERTICAL",
      legBias: null,
    },
    "KB Chest Press": {
      movementGroup: "PUSH",
      movementPlane: "HORIZONTAL",
      legBias: null,
    },
    "Single Bell Chest Press": {
      movementGroup: "PUSH",
      movementPlane: "HORIZONTAL",
      legBias: null,
    },
    "Push ups": {
      movementGroup: "PUSH",
      movementPlane: "HORIZONTAL",
      legBias: null,
    },
    "Ring Push Ups": {
      movementGroup: "PUSH",
      movementPlane: "HORIZONTAL",
      legBias: null,
    },
    "Chin Ups": {
      movementGroup: "PULL",
      movementPlane: "VERTICAL",
      legBias: null,
    },
    "Pull-ups": {
      movementGroup: "PULL",
      movementPlane: "VERTICAL",
      legBias: null,
    },
    "Face pulls": {
      movementGroup: "PULL",
      movementPlane: "HORIZONTAL",
      legBias: null,
    },
    Gunslingers: {
      movementGroup: "LEGS",
      movementPlane: null,
      legBias: "HAMSTRING_DOMINANT",
    },
    Burpees: {
      movementGroup: "LEGS",
      movementPlane: null,
      legBias: "QUAD_DOMINANT",
    },
    "Jump rope": {
      movementGroup: "LEGS",
      movementPlane: null,
      legBias: "QUAD_DOMINANT",
    },
    "Reverse Nordics": {
      movementGroup: "LEGS",
      movementPlane: null,
      legBias: "QUAD_DOMINANT",
    },
    "Turkish Get-up": {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
    },
    "Bear Walk": {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
    },
    "Front Rack March": {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
    },
    "Goblet Hold March": {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
    },
    "Hollow Hold": {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
    },
    "Hollow Rocks": {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
    },
    "KB Halos": {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
    },
    "Leg Lifts + Heels to Heaven": {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
    },
    "Loaded Beast Cross Reach": {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
    },
    "Mountain Climbers (Slow)": {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
    },
    "Rings Support Hold": {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
    },
    "Single leg V-Ups": {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
    },
    Situps: {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
    },
    "Windshield Wipers": {
      movementGroup: "CORE",
      movementPlane: null,
      legBias: null,
    },
  };

  const match = exact[name];
  if (!match) {
    return null;
  }

  return {
    ...match,
    reason: "exact override",
  };
}

function fromKeywordRules(name: string): MetadataSuggestion | null {
  const lower = name.toLowerCase();

  if (hasAny(lower, ["squat", "thruster", "lunge"])) {
    return {
      movementGroup: "LEGS",
      movementPlane: null,
      legBias: "QUAD_DOMINANT",
      reason: "contains squat/thruster/lunge keyword",
    };
  }

  if (hasAny(lower, ["deadlift", "swing"])) {
    return {
      movementGroup: "LEGS",
      movementPlane: null,
      legBias: "HAMSTRING_DOMINANT",
      reason: "contains deadlift/swing keyword",
    };
  }

  if (hasAny(lower, ["snatch", "high pull", "clean"])) {
    return {
      movementGroup: "PULL",
      movementPlane: "VERTICAL",
      legBias: null,
      reason: "contains snatch/high pull/clean keyword",
    };
  }

  if (hasAny(lower, ["row"])) {
    return {
      movementGroup: "PULL",
      movementPlane: "HORIZONTAL",
      legBias: null,
      reason: "contains row keyword",
    };
  }

  if (hasAny(lower, ["push press", "strict press", "z-press", "press"])) {
    return {
      movementGroup: "PUSH",
      movementPlane: "VERTICAL",
      legBias: null,
      reason: "contains press keyword",
    };
  }

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

function suggest(name: string): MetadataSuggestion | null {
  return fromExactOverride(name) ?? fromKeywordRules(name);
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const dryRun = args.includes("--dry-run") || !apply;

  if (apply && args.includes("--dry-run")) {
    console.error("Choose either --apply or --dry-run, not both.");
    process.exit(1);
  }

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

  const updates: Array<{
    id: string;
    name: string;
    suggestion: MetadataSuggestion;
  }> = [];
  const skippedExisting: string[] = [];
  const unresolved: string[] = [];

  for (const exercise of exercises) {
    const hasAnyExistingField =
      exercise.movementGroup !== null ||
      exercise.movementPlane !== null ||
      exercise.legBias !== null;

    if (hasAnyExistingField) {
      skippedExisting.push(exercise.name);
      continue;
    }

    const suggestion = suggest(exercise.name);
    if (!suggestion) {
      unresolved.push(exercise.name);
      continue;
    }

    updates.push({
      id: exercise.id,
      name: exercise.name,
      suggestion,
    });
  }

  console.log(`Mode: ${dryRun ? "DRY RUN" : "APPLY"}`);
  console.log(`Found ${exercises.length} EXERCISE rows.`);
  console.log(`Will update ${updates.length} rows.`);
  console.log(`Skipped (already has metadata): ${skippedExisting.length}.`);
  console.log(`Unresolved (manual follow-up): ${unresolved.length}.`);

  if (updates.length > 0) {
    console.log("\n=== Planned Updates ===");
    for (const update of updates) {
      console.log(
        [
          update.name,
          `group=${update.suggestion.movementGroup}`,
          `plane=${update.suggestion.movementPlane ?? "-"}`,
          `legBias=${update.suggestion.legBias ?? "-"}`,
          `reason=${update.suggestion.reason}`,
        ].join(" | "),
      );
    }
  }

  if (unresolved.length > 0) {
    console.log("\n=== Unresolved Exercises ===");
    for (const name of unresolved) {
      console.log(name);
    }
  }

  if (dryRun) {
    console.log("\nDry run complete. Re-run with --apply to persist changes.");
    return;
  }

  await prisma.$transaction(
    updates.map((update) =>
      prisma.exercise.update({
        where: { id: update.id },
        data: {
          movementGroup: update.suggestion.movementGroup,
          movementPlane: update.suggestion.movementPlane,
          legBias: update.suggestion.legBias,
        },
      }),
    ),
  );

  console.log(`\nUpdated ${updates.length} exercises.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
