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
let pathnameMock = "/";
let searchParamsMock = new URLSearchParams();

export const getRouterMock = () => routerMock;

export const setParamsMock = (params: Record<string, unknown>) => {
  paramsMock = params;
};

export const setPathnameMock = (pathname: string) => {
  pathnameMock = pathname;
};

export const setSearchParamsMock = (
  searchParams:
    | string
    | URLSearchParams
    | Record<string, string | number | boolean | null | undefined>,
) => {
  if (typeof searchParams === "string") {
    searchParamsMock = new URLSearchParams(searchParams);
    return;
  }

  if (searchParams instanceof URLSearchParams) {
    searchParamsMock = new URLSearchParams(searchParams.toString());
    return;
  }

  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null) {
      continue;
    }
    next.set(key, String(value));
  }
  searchParamsMock = next;
};

export const resetNextMocks = () => {
  routerMock.push.mockReset();
  routerMock.refresh.mockReset();
  routerMock.replace.mockReset();
  paramsMock = {};
  pathnameMock = "/";
  searchParamsMock = new URLSearchParams();
};

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  useParams: () => paramsMock,
  usePathname: () => pathnameMock,
  useSearchParams: () => searchParamsMock,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
