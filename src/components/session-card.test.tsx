import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionCard } from "@/components/session-card";

describe("SessionCard.Description", () => {
  it("renders plain URLs as clickable links", () => {
    render(
      <SessionCard.Description>
        Check https://example.com/path?x=1 for details.
      </SessionCard.Description>,
    );

    const link = screen.getByRole("link", { name: "https://example.com/path?x=1" });
    expect(link).toHaveAttribute("href", "https://example.com/path?x=1");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
