import type { Metadata } from "next";

import AuthProvider from "@/components/auth/AuthProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "AI Support Hub",
  description: "AI-powered customer support and business assistance platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}