import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchableCombobox } from "./searchable-combobox";

describe("SearchableCombobox", () => {
  it("selects the create action with keyboard when there are no matches", async () => {
    const user = userEvent.setup();
    const handleCreate = vi.fn();

    render(
      <SearchableCombobox
        items={[{ id: "1", name: "Swing" }]}
        value={null}
        onValueChange={() => {}}
        getItemKey={(item) => item.id}
        getItemLabel={(item) => item.name}
        placeholder="Search exercise"
        emptyActionLabel="Create exercise"
        onEmptyAction={handleCreate}
      />,
    );

    const input = screen.getByPlaceholderText("Search exercise");
    await user.click(input);
    await user.type(input, "does-not-exist");
    expect(screen.getByRole("option", { name: "Create exercise" })).toBeInTheDocument();

    await user.keyboard("{ArrowUp}{Enter}");
    expect(handleCreate).toHaveBeenCalledTimes(1);
  });

  it("finds typoed queries with fuzzy matching", async () => {
    const user = userEvent.setup();

    render(
      <SearchableCombobox
        items={[
          { id: "1", name: "Sisyphus" },
          { id: "2", name: "Swing" },
        ]}
        value={null}
        onValueChange={() => {}}
        getItemKey={(item) => item.id}
        getItemLabel={(item) => item.name}
        placeholder="Search exercise"
      />,
    );

    const input = screen.getByPlaceholderText("Search exercise");
    await user.click(input);
    await user.type(input, "sysifus");

    expect(screen.getByRole("option", { name: "Sisyphus" })).toBeInTheDocument();
  });
});
