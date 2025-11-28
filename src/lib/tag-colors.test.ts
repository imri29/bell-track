import { describe, expect, it } from "vitest";

import { getTagPalette } from "./tag-colors";

describe("getTagPalette", () => {
  it("returns the override palette for known slugs", () => {
    expect(getTagPalette("emom")).toEqual({
      dot: "bg-amber-500",
      tint: "border-amber-500/25 bg-amber-500/15 text-foreground",
    });
  });

  it("is deterministic for arbitrary slugs", () => {
    const first = getTagPalette("custom-tag");
    const second = getTagPalette("custom-tag");
    expect(first).toEqual(second);
  });

  it("always yields a palette with dot and tint", () => {
    const palette = getTagPalette("unique-slug");
    expect(palette.dot).toBeTruthy();
    expect(palette.tint).toBeTruthy();
  });
});
