"use client";

import { LogOut, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (pathname === "/signin" || !session?.user) {
    return null;
  }

  const firstName = session.user.name?.split(" ")[0] ?? session.user.email?.split("@")[0] ?? "User";

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ redirectTo: "/signin" });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="absolute right-6 top-6 z-[300] hidden md:block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 border border-border/60 bg-background/80 shadow-sm backdrop-blur"
          >
            <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
              <UserRound className="size-4 text-primary" />
            </div>
            <span className="text-sm font-medium">{firstName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex flex-col gap-1 px-2 py-1.5">
            <span className="text-sm font-medium">{session.user.name}</span>
            <span className="text-xs text-muted-foreground">{session.user.email}</span>
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
            <LogOut className="size-4" />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
