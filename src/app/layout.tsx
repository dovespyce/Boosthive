// src/app/layout.tsx
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "BoostHive - Powering Your Social Growth",
    template: "%s | BoostHive",
  },
  description: "The fastest, most reliable social media marketing platform. Buy TikTok followers, Instagram likes, YouTube views and more.",
  keywords: ["SMM panel", "buy followers", "social media marketing", "TikTok followers", "Instagram likes"],
  openGraph: {
    title: "BoostHive - Powering Your Social Growth",
    description: "The fastest, most reliable social media marketing platform.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "BoostHive",
  },
  twitter: {
    card: "summary_large_image",
    title: "BoostHive - Powering Your Social Growth",
    description: "The fastest, most reliable social media marketing platform.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
