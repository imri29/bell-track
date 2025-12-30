"use client";

import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GoogleSignInButtonProps {
  callbackUrl?: string;
  className?: string;
}

export function GoogleSignInButton({ callbackUrl = "/", className }: GoogleSignInButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    try {
      setIsSubmitting(true);
      await signIn("google", { callbackUrl });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      type="button"
      size="lg"
      variant="outline"
      className={cn(
        "flex h-12 w-full items-center justify-center gap-3 rounded-full border border-input bg-white px-6 text-base font-medium text-neutral-900 shadow-md transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:border-border dark:text-neutral-100 dark:hover:bg-neutral-900",
        className,
      )}
      aria-label="Sign in with Google"
      onClick={handleClick}
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <Loader2 className="size-5 animate-spin text-neutral-500" />
      ) : (
        <GoogleGlyph className="size-5" />
      )}
      {isSubmitting ? "Signing you in..." : "Sign in with Google"}
    </Button>
  );
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.18-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62"
        fill="#4285F4"
      />
      <path
        d="M9 18a8.59 8.59 0 0 0 5.94-2.18l-2.92-2.26c-.81.54-1.85.86-3.02.86-2.32 0-4.28-1.57-4.98-3.69H.99v2.32A9 9 0 0 0 9 18"
        fill="#34A853"
      />
      <path
        d="M4.02 10.73a5.41 5.41 0 0 1 0-3.46V4.95H.99a9 9 0 0 0 0 8.1l3.03-2.32"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.26 0 2.38.43 3.27 1.28l2.45-2.45A8.61 8.61 0 0 0 9 0 9 9 0 0 0 .99 4.95l3.03 2.32C4.72 5.88 6.68 4.31 9 4.31"
        fill="#EA4335"
      />
    </svg>
  );
}
