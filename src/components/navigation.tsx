"use client";

import { BookIcon, DumbbellIcon, HistoryIcon, HomeIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "History", href: "/history", icon: HistoryIcon },
  { name: "Templates", href: "/templates", icon: DumbbellIcon },
  { name: "Exercises", href: "/exercises", icon: BookIcon },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:relative md:bottom-auto md:border-t-0 md:border-r md:border-border md:w-64 md:h-screen">
      <div className="flex md:flex-col">
        {navigation.map((item) => {
          const isActive = pathname === item.href;

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
      </div>
    </nav>
  );
}
