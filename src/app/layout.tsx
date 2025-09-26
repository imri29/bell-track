import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConfirmProvider } from "@/contexts/confirm-context";
import "./globals.css";
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCReactProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
