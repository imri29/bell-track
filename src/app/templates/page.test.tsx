"use client";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RouterOutputs } from "@/server/api/root";
import { confirmMock, resetConfirmMock } from "@/tests/mocks/confirm";
import {
  getRouterMock,
  resetNextMocks,
  setPathnameMock,
  setSearchParamsMock,
} from "@/tests/mocks/next";
import TemplatesPage from "./page";

type TemplateWithExercises = RouterOutputs["template"]["getAll"][number];
const mockComplexSubstitutionPicker = vi.fn();

vi.mock("@/components/patterns/simple-tooltip", () => ({
  SimpleTooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/complex-name-tooltip", () => ({
  ComplexNameTooltip: ({
    children,
  }: {
    children: ReactNode;
    name: string;
    subExercises?: string | null;
  }) => <>{children}</>,
}));

vi.mock("@/components/patterns/complex-substitution-picker", () => ({
  ComplexSubstitutionPicker: ({
    currentComplex,
    onSelect,
  }: {
    currentComplex: { name: string };
    onSelect: (complexId: string) => void;
  }) => (
    <>
      {mockComplexSubstitutionPicker({ currentComplex })}
      <button
        type="button"
        aria-label={`Find a substitute for ${currentComplex.name}`}
        onClick={() => onSelect("complex-alt")}
      >
        Swap
      </button>
    </>
  ),
}));

const mockTemplateQuery = vi.fn();
const mockTagsQuery = vi.fn();
const mockExercisesQuery = vi.fn();
const mockDeleteTemplate = vi.fn();
const mockInvalidateTemplates = vi.fn();

vi.mock("@/trpc/react", () => ({
  api: {
    useUtils: () => ({
      template: { getAll: { invalidate: mockInvalidateTemplates } },
    }),
    template: {
      getAll: {
        useQuery: (...args: unknown[]) => mockTemplateQuery(...args),
      },
      getTags: {
        useQuery: (...args: unknown[]) => mockTagsQuery(...args),
      },
      delete: {
        useMutation: (opts?: { onSuccess?: () => void }) => ({
          mutate: (input: { id: string }) => {
            mockDeleteTemplate(input);
            opts?.onSuccess?.();
          },
          isPending: false,
        }),
      },
    },
    exercise: {
      getAll: {
        useQuery: (...args: unknown[]) =>
          mockExercisesQuery(...args) ?? { data: [], isPending: false, error: undefined },
      },
    },
  },
}));

const sharedDates = {
  createdAt: "2024-10-01T12:00:00.000Z",
  updatedAt: "2024-10-02T12:00:00.000Z",
  assignedAt: "2024-10-03T12:00:00.000Z",
};

const templateOne: TemplateWithExercises = {
  id: "t1",
  name: "Strength Builder",
  description: "Full body template",
  createdAt: sharedDates.createdAt,
  updatedAt: sharedDates.updatedAt,
  exercises: [
    {
      id: "te1",
      exerciseId: "ex1",
      sets: 3,
      unit: "REPS",
      reps: "8",
      weight: 24,
      restTime: 90,
      notes: "",
      group: "A",
      order: 1,
      exercise: {
        id: "ex1",
        name: "Clean",
        type: "EXERCISE",
        subExercises: "[]",
        description: null,
      },
      sectionTitle: null,
    },
    {
      id: "te1b",
      exerciseId: "ex2",
      sets: 2,
      unit: "REPS",
      reps: "12",
      weight: 20,
      restTime: 60,
      notes: "",
      group: "B",
      order: 2,
      exercise: {
        id: "ex2",
        name: "Push Press",
        type: "EXERCISE",
        subExercises: "[]",
        description: null,
      },
      sectionTitle: "Finisher",
    },
  ],
  tags: [
    {
      id: "tag1",
      name: "Strength",
      slug: "strength",
      description: null,
      createdAt: sharedDates.createdAt,
      updatedAt: sharedDates.updatedAt,
      assignedAt: sharedDates.assignedAt,
    },
  ],
};

const templateTwo: TemplateWithExercises = {
  id: "t2",
  name: "Conditioning",
  description: null,
  createdAt: sharedDates.createdAt,
  updatedAt: sharedDates.updatedAt,
  exercises: [
    {
      id: "te2",
      exerciseId: "ex2",
      sets: 5,
      unit: "REPS",
      reps: "10",
      weight: 16,
      restTime: 60,
      notes: "",
      group: "B",
      order: 1,
      exercise: {
        id: "ex2",
        name: "Swing",
        type: "EXERCISE",
        subExercises: "[]",
        description: null,
      },
      sectionTitle: null,
    },
  ],
  tags: [],
};

const templateWithComplex: TemplateWithExercises = {
  ...templateOne,
  id: "t-complex",
  name: "Complex Day",
  exercises: [
    {
      id: "te-complex",
      exerciseId: "complex-current",
      sets: 3,
      unit: "REPS",
      reps: "1",
      weight: 20,
      restTime: 60,
      notes: "",
      group: "",
      order: 1,
      exercise: {
        id: "complex-current",
        name: "Armor Building",
        type: "COMPLEX",
        subExercises: JSON.stringify([
          { exerciseName: "Clean", reps: 2 },
          { exerciseName: "Press", reps: 1 },
        ]),
        description: null,
      },
      sectionTitle: null,
    },
  ],
  tags: [],
};

const renderTemplates = () => {
  render(<TemplatesPage />);
};

afterEach(() => {
  resetConfirmMock();
  resetNextMocks();
  vi.clearAllMocks();
});

describe("TemplatesPage", () => {
  it("renders templates and lets a user log from a template", async () => {
    confirmMock.mockResolvedValue(true);
    mockTemplateQuery.mockReturnValue({
      data: [templateOne, templateTwo],
      isPending: false,
      error: undefined,
    });
    mockTagsQuery.mockReturnValue({
      data: [
        {
          id: "tag1",
          name: "Strength",
          slug: "strength",
          description: null,
          createdAt: sharedDates.createdAt,
          updatedAt: sharedDates.updatedAt,
          assignedAt: sharedDates.assignedAt,
        },
      ],
      isPending: false,
      error: undefined,
    });

    renderTemplates();

    expect(screen.getByRole("heading", { name: "Templates", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/you have 2 templates/i)).toBeInTheDocument();
    expect(screen.getByText("Strength Builder")).toBeInTheDocument();
    expect(screen.getByText("Conditioning")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(/log strength builder/i));

    await waitFor(() => {
      expect(getRouterMock().push).toHaveBeenCalledWith("/history/new?templateId=t1");
    });
  });

  it("confirms delete before removing a template", async () => {
    confirmMock.mockResolvedValue(true);
    mockTemplateQuery.mockReturnValue({
      data: [templateOne],
      isPending: false,
      error: undefined,
    });
    mockTagsQuery.mockReturnValue({
      data: [],
      isPending: false,
      error: undefined,
    });

    renderTemplates();

    await userEvent.click(screen.getByLabelText(/delete strength builder/i));

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalled();
      expect(mockDeleteTemplate).toHaveBeenCalledWith({ id: "t1" });
      expect(mockInvalidateTemplates).toHaveBeenCalled();
    });
  });

  it("links to edit a template", async () => {
    mockTemplateQuery.mockReturnValue({
      data: [templateOne],
      isPending: false,
      error: undefined,
    });
    mockTagsQuery.mockReturnValue({
      data: [],
      isPending: false,
      error: undefined,
    });

    renderTemplates();

    const editLink = screen.getByLabelText(/edit strength builder/i);
    expect(editLink).toHaveAttribute("href", "/templates/t1/edit");
    await userEvent.click(editLink);
  });

  it("initializes filters from the URL and includes them in edit links", () => {
    setPathnameMock("/templates");
    setSearchParamsMock("search=strength&tag=strength");
    mockTemplateQuery.mockReturnValue({
      data: [templateOne],
      isPending: false,
      error: undefined,
    });
    mockTagsQuery.mockReturnValue({
      data: [
        {
          id: "tag1",
          name: "Strength",
          slug: "strength",
          description: null,
          createdAt: sharedDates.createdAt,
          updatedAt: sharedDates.updatedAt,
          assignedAt: sharedDates.assignedAt,
        },
      ],
      isPending: false,
      error: undefined,
    });

    renderTemplates();

    expect(screen.getByLabelText(/search templates/i)).toHaveValue("strength");
    expect(mockTemplateQuery).toHaveBeenCalledWith({ search: "strength", tagSlugs: ["strength"] });
    expect(screen.getByLabelText(/edit strength builder/i)).toHaveAttribute(
      "href",
      "/templates/t1/edit?search=strength&tag=strength",
    );
  });

  it("writes filter changes to the URL", async () => {
    setPathnameMock("/templates");
    mockTemplateQuery.mockReturnValue({
      data: [templateOne],
      isPending: false,
      error: undefined,
    });
    mockTagsQuery.mockReturnValue({
      data: [
        {
          id: "tag1",
          name: "Strength",
          slug: "strength",
          description: null,
          createdAt: sharedDates.createdAt,
          updatedAt: sharedDates.updatedAt,
          assignedAt: sharedDates.assignedAt,
        },
      ],
      isPending: false,
      error: undefined,
    });

    renderTemplates();

    fireEvent.change(screen.getByLabelText(/search templates/i), {
      target: { value: "builder" },
    });
    await waitFor(() => {
      expect(getRouterMock().replace).toHaveBeenLastCalledWith("/templates?search=builder");
    });

    await userEvent.click(screen.getByRole("button", { name: "Strength" }));
    await waitFor(() => {
      expect(getRouterMock().replace).toHaveBeenLastCalledWith(
        "/templates?search=builder&tag=strength",
      );
    });
  });

  it("renders section title headers in template summaries", () => {
    mockTemplateQuery.mockReturnValue({
      data: [templateOne],
      isPending: false,
      error: undefined,
    });
    mockTagsQuery.mockReturnValue({
      data: [],
      isPending: false,
      error: undefined,
    });

    renderTemplates();

    expect(screen.getByText("Finisher")).toBeInTheDocument();
  });

  it("temporarily substitutes a complex and carries it into logging", async () => {
    mockTemplateQuery.mockReturnValue({
      data: [templateWithComplex],
      isPending: false,
      error: undefined,
    });
    mockTagsQuery.mockReturnValue({
      data: [],
      isPending: false,
      error: undefined,
    });
    mockExercisesQuery.mockReturnValue({
      data: [
        {
          id: "complex-current",
          name: "Armor Building",
          type: "COMPLEX",
          subExercises: [{ exerciseName: "Clean", reps: 2 }],
        },
        {
          id: "complex-alt",
          name: "King Kong",
          type: "COMPLEX",
          subExercises: [{ exerciseName: "Gorilla Row", reps: 5 }],
        },
      ],
      isPending: false,
      error: undefined,
    });

    renderTemplates();

    expect(mockComplexSubstitutionPicker).toHaveBeenLastCalledWith(
      expect.objectContaining({
        currentComplex: expect.objectContaining({ name: "Armor Building" }),
      }),
    );
    await userEvent.click(screen.getByLabelText("Find a substitute for Armor Building"));

    await waitFor(() => {
      expect(screen.getByText("1 substitution")).toBeInTheDocument();
      expect(mockComplexSubstitutionPicker).toHaveBeenLastCalledWith(
        expect.objectContaining({ currentComplex: expect.objectContaining({ name: "King Kong" }) }),
      );
    });

    await userEvent.click(screen.getByLabelText("Log Complex Day"));

    expect(getRouterMock().push).toHaveBeenCalledWith(
      "/history/new?templateId=t-complex&swap=te-complex%3Acomplex-alt",
    );

    await userEvent.click(screen.getByRole("button", { name: "Reset" }));

    await waitFor(() => {
      expect(screen.queryByText("1 substitution")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Find a substitute for Armor Building")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText("Log Complex Day"));
    expect(getRouterMock().push).toHaveBeenLastCalledWith("/history/new?templateId=t-complex");
  });
});
