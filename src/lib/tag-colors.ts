const TAG_DISPLAY_COLORS = [
  {
    dot: "bg-amber-500",
    tint: "border-amber-500/25 bg-amber-500/15 text-foreground",
  },
  {
    dot: "bg-sky-500",
    tint: "border-sky-500/25 bg-sky-500/15 text-foreground",
  },
  {
    dot: "bg-emerald-500",
    tint: "border-emerald-500/25 bg-emerald-500/15 text-foreground",
  },
  {
    dot: "bg-rose-500",
    tint: "border-rose-500/25 bg-rose-500/15 text-foreground",
  },
  {
    dot: "bg-indigo-500",
    tint: "border-indigo-500/20 bg-indigo-500/12 text-foreground",
  },
  {
    dot: "bg-fuchsia-500",
    tint: "border-fuchsia-500/20 bg-fuchsia-500/12 text-foreground",
  },
  {
    dot: "bg-cyan-500",
    tint: "border-cyan-500/20 bg-cyan-500/12 text-foreground",
  },
  {
    dot: "bg-violet-500",
    tint: "border-violet-500/20 bg-violet-500/12 text-foreground",
  },
  {
    dot: "bg-lime-500",
    tint: "border-lime-500/25 bg-lime-500/15 text-foreground",
  },
  {
    dot: "bg-orange-500",
    tint: "border-orange-500/25 bg-orange-500/15 text-foreground",
  },
  {
    dot: "bg-blue-500",
    tint: "border-blue-500/20 bg-blue-500/12 text-foreground",
  },
  {
    dot: "bg-pink-500",
    tint: "border-pink-500/20 bg-pink-500/12 text-foreground",
  },
] as const;

const TAG_COLOR_OVERRIDES: Record<string, number> = {
  emom: 0,
  amrap: 1,
  "main-lift-accessory": 2,
  supersets: 3,
  complex: 4,
  conditioning: 5,
  finisher: 9,
};

type TagPalette = (typeof TAG_DISPLAY_COLORS)[number];

export function getTagPalette(slug: string): TagPalette {
  const overrideIndex = TAG_COLOR_OVERRIDES[slug];
  if (typeof overrideIndex === "number") {
    return TAG_DISPLAY_COLORS[overrideIndex % TAG_DISPLAY_COLORS.length];
  }

  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash << 5) - hash + slug.charCodeAt(index);
    hash |= 0;
  }
  const paletteIndex = Math.abs(hash) % TAG_DISPLAY_COLORS.length;
  return TAG_DISPLAY_COLORS[paletteIndex];
}
