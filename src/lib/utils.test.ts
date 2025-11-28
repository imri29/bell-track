import { describe, expect, it } from "vitest";

import { cn, extractSearchParam, normalizeRestTime } from "./utils";

describe("cn", () => {
  it("merges class names and prefers later Tailwind values", () => {
    expect(cn("px-2", "text-sm", "px-4")).toBe("text-sm px-4");
  });
});

describe("normalizeRestTime", () => {
  it("keeps finite numbers", () => {
    expect(normalizeRestTime(90)).toBe(90);
  });

  it("returns undefined for non-number inputs", () => {
    expect(normalizeRestTime("90")).toBeUndefined();
    expect(normalizeRestTime(NaN)).toBeUndefined();
    expect(normalizeRestTime(null)).toBeUndefined();
  });
});

describe("extractSearchParam", () => {
  it("returns the first entry from an array param", () => {
    expect(extractSearchParam(["first", "second"])).toBe("first");
  });

  it("returns the input when it is a string", () => {
    expect(extractSearchParam("solo")).toBe("solo");
  });

  it("returns undefined when missing", () => {
    expect(extractSearchParam(undefined)).toBeUndefined();
  });
});
