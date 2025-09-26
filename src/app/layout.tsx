import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConfirmProvider } from "@/contexts/confirm-context";
import "./globals.css";
import { Navigation } from "@/components/navigation";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pb-16 md:pb-0 md:flex`}
      >
        <TRPCReactProvider>
          <ConfirmProvider>
            <Navigation />
            {children}
          </ConfirmProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
