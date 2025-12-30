import type { ReactNode } from "react";
import { vi } from "vitest";

type RouterMock = {
  push: ReturnType<typeof vi.fn>;
  refresh: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
};

const routerMock: RouterMock = {
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
};

let paramsMock: Record<string, unknown> = {};

export const getRouterMock = () => routerMock;

export const setParamsMock = (params: Record<string, unknown>) => {
  paramsMock = params;
};

export const resetNextMocks = () => {
  routerMock.push.mockReset();
  routerMock.refresh.mockReset();
  routerMock.replace.mockReset();
  paramsMock = {};
};

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  useParams: () => paramsMock,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
