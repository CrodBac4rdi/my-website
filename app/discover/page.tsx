import { Compass } from "lucide-react";
import DiscoverExplorer from "@/components/DiscoverExplorer";

export const metadata = {
  title: "Entdecken",
  description: "Filtere Anime nach Genre, Jahr und Bewertung.",
};

export default function DiscoverPage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-8 min-h-screen">
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-primary-400 font-bold uppercase tracking-[0.2em] text-xs">
          <Compass size={16} /> Katalog
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-fg tracking-tight leading-none">
          Entdecken
        </h1>
        <p className="text-muted text-lg">Filtere nach Genre, Jahr und Sortierung.</p>
      </div>

      <DiscoverExplorer />
    </div>
  );
}
