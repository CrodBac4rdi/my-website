import { createClient } from "jsr:@supabase/supabase-js@2";

// HORIZON: benachrichtigt Watchlist-Besitzer über neu erschienene Episoden.
// Wird per pg_cron täglich aufgerufen (siehe Migration ..._episode_notifications_tracking_and_cron).
// Liest TMDB last_episode_to_air und legt Notifications an (dedupliziert über episode_notifications).
//
// Benötigte Secrets:
// - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (von Supabase automatisch gesetzt)
// - TMDB_API_KEY                             (MANUELL setzen: Dashboard → Edge Functions → Secrets)

Deno.serve(async () => {
  const json = (obj: unknown, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");

  if (!TMDB_API_KEY) {
    return json({ ok: false, error: "TMDB_API_KEY secret not set" });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Aktive Watchlist-Einträge (TV) + ihre Besitzer.
  const { data: rows, error } = await supabase
    .from("user_watchlist")
    .select("media_id, user_id, media!inner(type)")
    .in("status", ["watching", "plan_to_watch"]);

  if (error) return json({ ok: false, error: error.message });

  const ownersByMedia = new Map<number, Set<string>>();
  for (const r of rows ?? []) {
    // deno-lint-ignore no-explicit-any
    const row = r as any;
    if (row.media?.type !== "tv") continue;
    if (!ownersByMedia.has(row.media_id)) ownersByMedia.set(row.media_id, new Set());
    ownersByMedia.get(row.media_id)!.add(row.user_id);
  }

  const now = Date.now();
  const twoDaysAgo = now - 2 * 86400000;
  let checked = 0;
  let notified = 0;

  for (const [mediaId, owners] of ownersByMedia) {
    checked++;
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${mediaId}?api_key=${TMDB_API_KEY}&language=de-DE`,
      );
      if (!res.ok) continue;
      const tv = await res.json();
      const ep = tv.last_episode_to_air;
      if (!ep?.air_date) continue;

      const air = new Date(ep.air_date).getTime();
      if (air < twoDaysAgo || air > now) continue; // nur kürzlich erschienen

      const { data: existing } = await supabase
        .from("episode_notifications")
        .select("id")
        .eq("media_id", mediaId)
        .eq("episode_air_date", ep.air_date)
        .maybeSingle();
      if (existing) continue;

      const title = tv.name || tv.original_name || "Ein Anime";
      const notifs = [...owners].map((uid) => ({
        user_id: uid,
        type: "new_episode",
        title: "Neue Episode",
        message: `${title}: Episode ${ep.episode_number} ist erschienen.`,
        link: `/media/${mediaId}?type=tv`,
      }));

      const { error: insErr } = await supabase.from("notifications").insert(notifs);
      if (insErr) continue;

      await supabase
        .from("episode_notifications")
        .insert({ media_id: mediaId, episode_air_date: ep.air_date });
      notified += notifs.length;

      await new Promise((r) => setTimeout(r, 260)); // TMDB Rate-Limit schonen
    } catch (_e) {
      // einzelnen Titel überspringen
    }
  }

  return json({ ok: true, checked, notified });
});
