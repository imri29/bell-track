import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { preventEnterFromSelect } from "./form-handlers";

describe("preventEnterFromSelect", () => {
  it("prevents default when Enter originates from a select trigger", () => {
    const selectTrigger = document.createElement("button");
    selectTrigger.setAttribute("data-slot", "select-trigger");
    const preventDefault = vi.fn();

    const event = {
      key: "Enter",
      target: selectTrigger,
      preventDefault,
    } as unknown as React.KeyboardEvent<HTMLFormElement>;

    preventEnterFromSelect(event);

    expect(preventDefault).toHaveBeenCalledOnce();
  });

  it("does nothing for Enter on a submit button", () => {
    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    const preventDefault = vi.fn();

    const event = {
      key: "Enter",
      target: submitButton,
      preventDefault,
    } as unknown as React.KeyboardEvent<HTMLFormElement>;

    preventEnterFromSelect(event);

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("ignores non-Enter keys", () => {
    const selectTrigger = document.createElement("button");
    selectTrigger.setAttribute("data-slot", "select-trigger");
    const preventDefault = vi.fn();

    const event = {
      key: "Space",
      target: selectTrigger,
      preventDefault,
    } as unknown as React.KeyboardEvent<HTMLFormElement>;

    preventEnterFromSelect(event);

    expect(preventDefault).not.toHaveBeenCalled();
  });
});
