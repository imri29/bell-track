import type React from "react";

/**
 * Prevents Enter keypresses originating from Radix Select triggers/content
 * from bubbling up and submitting the parent form.
 */
export function preventEnterFromSelect(
  event: React.KeyboardEvent<HTMLFormElement>,
) {
  if (event.key !== "Enter") {
    return;
  }

  const target = event.target as HTMLElement;
  const isSelectInteraction = target.closest(
    '[data-slot="select-trigger"], [data-slot="select-content"]',
  );

  if (isSelectInteraction) {
    event.preventDefault();
  }
}
