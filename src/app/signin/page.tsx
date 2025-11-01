import type { Metadata } from "next";
import { GoogleSignInButton } from "@/components/sign-in/google-sign-in-button";

export const metadata: Metadata = {
  title: "Sign In - Bell Track",
  description: "Sign in to track your kettlebell workouts",
};

type SignInPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/";
  const error = params.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-4 dark:from-neutral-950 dark:to-neutral-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Bell Track
          </h1>
          <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400">
            Track your kettlebell workouts
          </p>
        </div>
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
            {error === "OAuthAccountNotLinked"
              ? "This email is already associated with another account."
              : error === "AccessDenied"
                ? "Access was denied. Please try again."
                : "An error occurred during sign in. Please try again."}
          </div>
        )}
        <GoogleSignInButton callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
