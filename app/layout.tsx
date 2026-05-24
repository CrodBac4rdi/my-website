import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/header";
// Wir importieren unseren neuen smarten Header!


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Horizon Tracker",
  description: "Dein Anime & Serien Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen flex flex-col`}>
        
        {/* HIER STECKT JETZT DIE GANZE LOGIK DRIN */}
        <Header />

        <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
          {children}
        </main>

      </body>
    </html>
  );
}