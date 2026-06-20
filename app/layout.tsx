import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/header";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "../components/ThemeProvider";
import { I18nProvider } from "../lib/i18n";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HORIZON | 3D Anime Tracker",
  description: "Die Zukunft des Anime-Trackings. Bento Brutalism trifft auf 3D.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HORIZON",
  },
};

export const viewport: Viewport = {
  themeColor: "#020205",
};

import { BackgroundProvider } from "../components/BackgroundProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-[#020205] text-slate-900 dark:text-slate-50 min-h-screen flex flex-col selection:bg-accent-blue selection:text-white transition-colors duration-300`}>
        <ThemeProvider>
        <I18nProvider>
        <BackgroundProvider>
          <Header />

          <main className="flex-1 w-full p-4 md:p-8 relative z-10">
            {children}
          </main>

          <Analytics />
        </BackgroundProvider>
        </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}