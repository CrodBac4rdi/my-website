import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/header";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

const SITE_URL = "https://imaginaryops.com";
const SITE_DESCRIPTION =
  "HORIZON ist dein Anime-Tracker: entdecke Serien & Filme, führe deine Watchlist mit Status und Rating, erstelle Listen und teile Reviews mit der Community.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HORIZON — Anime Tracker",
    template: "%s · HORIZON",
  },
  description: SITE_DESCRIPTION,
  applicationName: "HORIZON",
  keywords: [
    "Anime", "Anime Tracker", "Watchlist", "Anime Liste", "Simulcast",
    "Anime Kalender", "Reviews", "TMDB", "Serien tracken", "HORIZON",
  ],
  authors: [{ name: "CrodBac4rdi" }],
  creator: "CrodBac4rdi",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HORIZON",
  },
  openGraph: {
    type: "website",
    siteName: "HORIZON",
    locale: "de_DE",
    url: SITE_URL,
    title: "HORIZON — Anime Tracker",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "HORIZON — Anime Tracker",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#060711",
};

import { BackgroundProvider } from "../components/BackgroundProvider";
import ToastContainer from "../components/Toast";
import PWAManager from "../components/PWAManager";

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
          <PWAManager />
          <Analytics />
          <SpeedInsights />
        </BackgroundProvider>
        </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}