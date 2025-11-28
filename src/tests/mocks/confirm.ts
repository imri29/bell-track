import { vi } from "vitest";

export const confirmMock = vi.fn<(options?: unknown) => Promise<boolean>>();

export const resetConfirmMock = () => {
  confirmMock.mockReset();
};

vi.mock("@/contexts/confirm-context", () => ({
  useConfirm: () => ({ confirm: confirmMock }),
}));
