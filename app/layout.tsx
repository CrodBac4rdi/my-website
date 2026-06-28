import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/header";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "../components/ThemeProvider";
import { I18nProvider } from "../lib/i18n";

// Cinematic Dark Glass: Space Grotesk (Display), Inter (UI), JetBrains Mono (Code/Tokens)
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
  weight: ["500", "600", "700"],
});
const jbmono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbmono", display: "swap" });

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
  themeColor: "#060711",
};

import { BackgroundProvider } from "../components/BackgroundProvider";
import ToastContainer from "../components/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.variable} ${grotesk.variable} ${jbmono.variable} bg-bg text-fg min-h-screen flex flex-col antialiased selection:bg-primary-600 selection:text-white transition-colors duration-300`}>
        <ThemeProvider>
        <I18nProvider>
        <BackgroundProvider>
          <Header />

          <main className="flex-1 w-full p-4 md:p-8 relative z-10">
            {children}
          </main>

          <ToastContainer />
          <Analytics />
        </BackgroundProvider>
        </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}