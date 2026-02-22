import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

// Use a system font stack for reliability during development
const geistMono = {
  variable: "--font-geist-mono",
  className: "font-mono"
};

export const metadata: Metadata = {
  title: "CreatorIQ | SaaS for Creators & Agencies",
  description: "Advanced analytics and discovery platform for the creator economy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistMono.variable} suppressHydrationWarning>
      <body className={`${geistMono.className} antialiased min-h-screen bg-background text-foreground`}>
        <Providers>
          <Navbar />
          <main className="w-full transition-all duration-300">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
