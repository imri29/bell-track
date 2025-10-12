"use client";

import {
  BookIcon,
  DumbbellIcon,
  HistoryIcon,
  HomeIcon,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "History", href: "/history", icon: HistoryIcon },
  { name: "Templates", href: "/templates", icon: DumbbellIcon },
  { name: "Exercises", href: "/exercises", icon: BookIcon },
];

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (pathname === "/signin") {
    return null;
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ callbackUrl: "/signin" });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[200] border-t border-border bg-background md:sticky md:bottom-auto md:left-auto md:right-auto md:top-0 md:h-dvh md:w-64 md:shrink-0 md:border-t-0 md:border-r md:border-border">
      <div className="flex md:h-full md:flex-col">
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 p-3 md:px-4 md:py-3 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary bg-accent/10 md:bg-accent/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/10",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="hidden md:inline">{item.name}</span>
            </Link>
          );
        })}

        {/* Mobile-only account menu in bottom nav */}
        <div className="flex-1 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex size-full flex-col items-center justify-center gap-2 p-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/10">
              <UserRound className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56 mb-2">
              {session?.user && (
                <>
                  <div className="flex flex-col gap-1 px-2 py-1.5">
                    <span className="text-sm font-medium">
                      {session.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {session.user.email}
                    </span>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      if (!isSigningOut) {
                        void handleSignOut();
                      }
                    }}
                    disabled={isSigningOut}
                    className="cursor-pointer"
                  >
                    {isSigningOut ? "Signing out..." : "Sign out"}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
