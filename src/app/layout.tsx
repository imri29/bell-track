import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ConfirmProvider } from "@/contexts/confirm-context";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { UserMenu } from "@/components/user-menu";
import { TRPCReactProvider } from "@/trpc/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bell Track",
  description: "Kettlebell workout tracker",
  icons: {
    icon: process.env.NODE_ENV === "development" ? "/favicon-dev.svg" : "/favicon.ico",
    apple: "./apple-icon.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased pb-16 md:pb-0`}>
        <SessionProvider>
          <TRPCReactProvider>
            <ConfirmProvider>
              <div className="md:flex">
                <Navigation />
                <main className="relative min-h-dvh md:flex-1">
                  <UserMenu />
                  {children}
                </main>
              </div>
            </ConfirmProvider>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
