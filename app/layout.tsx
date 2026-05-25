import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/header";
import Scene3D from "../components/Scene3D";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body className={`${inter.className} bg-[#020205] text-slate-50 min-h-screen flex flex-col selection:bg-accent-blue selection:text-white`}>
        
        <Scene3D />
        <Header />

        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 relative z-10">
          {children}
        </main>

      </body>
    </html>
  );
}