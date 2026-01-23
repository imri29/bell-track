"use client";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

vi.mock("vaul", async () => {
  const React = await import("react");
  const DrawerContext = React.createContext<{ onOpenChange?: (open: boolean) => void } | null>(
    null,
  );

  const Root = ({
    children,
    onOpenChange,
  }: {
    children: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
  }) => <DrawerContext.Provider value={{ onOpenChange }}>{children}</DrawerContext.Provider>;

  const Close = ({
    asChild,
    children,
    onClick,
    ...props
  }: {
    asChild?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
  }) => {
    const ctx = React.useContext(DrawerContext);
    const handleClick = () => {
      onClick?.();
      ctx?.onOpenChange?.(false);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
        onClick: handleClick,
      });
    }

    return (
      <button type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    );
  };

  const Trigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Portal = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Overlay = ({ children, ...props }: { children?: React.ReactNode }) => (
    <div {...props}>{children}</div>
  );
  const Content = ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  );
  const Title = ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  );
  const Description = ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  );

  return {
    Drawer: {
      Root,
      Trigger,
      Portal,
      Close,
      Overlay,
      Content,
      Title,
      Description,
    },
  };
});

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  }
});

describe("Drawer", () => {
  it("renders content when open and calls onOpenChange on close", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Drawer open onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>
          <button type="button">Open drawer</button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer title</DrawerTitle>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose asChild>
              <button type="button">Close drawer</button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>,
    );

    expect(screen.getByText("Drawer title")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='drawer-overlay']")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='drawer-content']")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close drawer/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
