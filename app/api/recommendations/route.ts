import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRecommendations } from "@/lib/tmdb";

// Personalisierte Empfehlungen (ohne AI): aggregiert TMDB-Recommendations der
// zuletzt gemerkten Watchlist-Titel, gewichtet nach Häufigkeit + Popularität,
// filtert bereits Vorhandenes raus.
export async function GET(request: Request) {
  // `?full=1` liefert mehr Treffer (eigene Empfehlungen-Seite); sonst Rail/Carousel-Menge.
  const full = new URL(request.url).searchParams.get("full") === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ results: [] });

  const { data: wl } = await supabase
    .from("user_watchlist")
    .select("media_id, media!inner(type)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(full ? 12 : 8);

  if (!wl || wl.length === 0) return NextResponse.json({ results: [] });

  const ownedIds = new Set(wl.map((w: any) => w.media_id));
  const sources = wl.slice(0, full ? 10 : 5);
  const scored = new Map<number, { item: any; score: number }>();

  for (const s of sources) {
    const type = (s as any).media?.type === "movie" ? "movie" : "tv";
    const recs = await getRecommendations((s as any).media_id, type);
    for (const r of recs) {
      if (!r.poster_path || ownedIds.has(r.id)) continue;
      const existing = scored.get(r.id);
      if (existing) existing.score += 1;
      else scored.set(r.id, { item: { ...r, media_type: type }, score: 1 + (r.popularity || 0) / 1000 });
    }
  }

  const results = [...scored.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, full ? 60 : 18)
    .map((x) => x.item);

  return NextResponse.json({ results });
}
