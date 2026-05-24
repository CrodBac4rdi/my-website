import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Film, Tv, Search, User } from "lucide-react";

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
        
        {/* GLOBALE NAVIGATION */}
        <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-50 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition">
              <Film size={24} />
              <span className="font-bold text-xl tracking-wider text-white">HORIZON</span>
            </Link>

            {/* Mittlere Links */}
            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
              <Link href="/" className="hover:text-white transition">Discover</Link>
              <Link href="/" className="hover:text-white transition">My Watchlist</Link>
            </nav>

            {/* Rechte Icons (Suche & Login) */}
            <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-white transition">
                <Search size={20} />
              </button>
              <Link href="/login" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                <User size={16} />
                <span>Login</span>
              </Link>
            </div>

          </div>
        </header>

        {/* HIER WIRD DER INHALT DER JEWEILIGEN SEITE GELADEN */}
        <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
          {children}
        </main>

      </body>
    </html>
  );
}