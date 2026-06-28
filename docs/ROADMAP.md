# HORIZON — Feature-Roadmap

Große TODO aus dem Feedback. Aufwand: **S** (klein, ~halber Tag) · **M** (mittel) · **L** (groß).
„AI?" = ob künstliche Intelligenz nötig ist (Ziel: möglichst **ohne**).
Status: ⬜ offen · 🟡 in Arbeit · ✅ fertig

> Bereits erledigt (PRs #9 / #10, ggf. noch nicht gemerged): Hover-Fallback, Watchlist-Flicker-Fix,
> Legal-Layout, SEO, „Watchlist leeren", „Account löschen", Avatar-Picker (DiceBear), Basis-Moderation.

---

## Meilenstein 1 — Quick Wins (sofort spürbar, kleiner Aufwand)

| # | Feature | Aufwand | AI? | Notiz |
|---|---------|---------|-----|-------|
| 1.1 | **Loading-Skeletons statt Spinner** | S | nein | `SkeletonCard`/`SkeletonRow`; in Grid, Detail, Listen, Reviews, Watchlist. War im Design-System vorgesehen. |
| 1.2 | **Banner-Picker** (Anime-Backdrops) | S | nein | Gleiche TMDB-Backdrops wie die App-Hintergründe als Banner-Auswahl. `image.tmdb.org` ist schon in der Allowlist. Reuse von `BackgroundGallery`-Logik. |
| 1.3 | **Trending-diese-Woche-Rail** | S | nein | TMDB `/trending/tv/week` (+ Anime-Filter `with_genres=16`, `original_language=ja`). Rail auf der Startseite. |
| 1.4 | **Watchlist-Stats im Profil** | S | nein | DB-View `user_watchlist_stats` + `get_user_watchlist_stats` existieren bereits → nur anzeigen (Counts pro Status, Ø-Rating, Mini-Balken/Donut). |

---

## Meilenstein 2 — Discovery & Personalisierung

| # | Feature | Aufwand | AI? | Notiz |
|---|---------|---------|-----|-------|
| 2.1 | **Genre/Filter-Seite `/discover`** | M | nein | Chips: Genre, Jahr, Sortierung (Popularität/Rating/Datum), optional Streaming-Provider. Nutzt `/api/discover` (TMDB discover) + Infinite-Scroll (wie Home). |
| 2.2 | **„Weil du X auf der Watchlist hast"-Rail** | M | nein | Für die Top-Watchlist-Titel `/tv/{id}/recommendations` ziehen, aggregieren, deduplizieren, bereits-Vorhandenes rausfiltern. Nur eingeloggt. Caching beachten (TMDB-Ratelimit). |
| 2.3 | **Personalisierte Empfehlungen** | M | nein* | Content-basiert: Genre-Affinität aus der Watchlist + gewichtete TMDB-Recommendations. *Kein generatives AI; reicht für solide Vorschläge. Echte ML später optional. |

---

## Meilenstein 3 — Profil-Überarbeitung & Avatare

| # | Feature | Aufwand | AI? | Notiz |
|---|---------|---------|-----|-------|
| 3.1 | **Profil-Layout neu arrangieren** | M | nein | Reihenfolge: Header (Banner+Avatar) → **Stats** → Watchlist-Vorschau → Aktivität → Edit-Form → Danger Zone. Damit Stats (M1.4) nicht „käse" wirken. |
| 3.2 | **Chibi-Anime-Avatare** | M | nein | ⚠️ **Quellen-Entscheidung nötig:** (a) SFW-Anime-PFP-API (z.B. `nekos.best` — echte Anime-Artworks, Host in Allowlist aufnehmen, **nur SFW-Endpunkte**) oder (b) kuratiertes Set mitgelieferter Chibi-Illustrationen. Beides ohne AI. **Empfehlung:** (a) für Vielfalt, mit SFW-Filter. |

---

## Meilenstein 4 — Community / Social

| # | Feature | Aufwand | AI? | Notiz |
|---|---------|---------|-----|-------|
| 4.1 | **Profil-Sichtbarkeit (privat/öffentlich)** | S–M | nein | Neue Spalte `profiles.is_public` (Default **false** = privat) + RLS-Anpassung. UX wie GitHub-Repos: klar sichtbarer Status + leichter Toggle, **ohne** schweres „bist du sicher?". |
| 4.2 | **Öffentliche Profile `/u/[username]`** | M | nein | Zeigt öffentliche Listen + Stats (+ optional Watchlist). Greift auf `is_public`. |
| 4.3 | **Listen öffentlich teilen** | S–M | nein | `custom_lists.is_public` + `public_lists_view` existieren schon, RLS erlaubt öffentliche Listen bereits. Fehlt: Sichtbarkeits-Toggle in der Liste + Teilen-Button + Gäste-Ansicht von `/lists/[id]`. |
| 4.4 | **Follower + Social-Activity-Feed** | L | nein | `follows`-Tabelle (follower_id, following_id). Feed der Gefolgten — `user_activities` existiert (aktuell own-only), bräuchte Policy für Follower-Sichtbarkeit. Größtes Stück. |

---

## Meilenstein 5 — Plattform / UX

| # | Feature | Aufwand | AI? | Notiz |
|---|---------|---------|-----|-------|
| 5.1 | **Command-Palette (⌘K)** | M | nein | Schnelle Suche (TMDB) + Navigation. `cmdk` oder eigenes Modal. Fuzzy über Routen + Live-Suche. |
| 5.2 | **PWA scharf schalten** | S–M | nein | `next-pwa` ist drin (evtl. Wechsel zu gepflegtem `@ducanh2912/next-pwa`), Manifest existiert. Fehlt: Icons (mehrere Größen), Offline-Strategie, Install-Prompt. |

---

## Bewusst verworfen
- **Episoden-Tracking** — bräuchte Streaming-Account-Anbindung für echtes Auto-Tracking; manuelles Abhaken pflegt niemand. Nicht realistisch / Overkill.

---

## Vorgeschlagene Reihenfolge
1. **M1 komplett** (Skeletons, Banner-Picker, Trending-Rail, Watchlist-Stats) — viel sichtbarer Effekt, wenig Aufwand.
2. **M3.1 Profil-Rearrange** direkt nach den Stats (zusammen sinnvoll).
3. **M2.1 `/discover`-Filterseite** + **M2.2 Recommendations-Rail**.
4. **M4.1–4.3** Sichtbarkeit + öffentliche Profile/Listen.
5. **M5** Command-Palette + PWA.
6. **M3.2 Chibi-Avatare** (sobald Quelle entschieden) und **M4.4 Follower** (größtes Brett) zum Schluss.

## DB-Änderungen, die anstehen
- `profiles.is_public boolean default false` (+ RLS) — M4.1
- `follows`-Tabelle (+ RLS, Indizes) — M4.4
- ggf. Anpassung `user_activities`-Policy für Follower-Sichtbarkeit — M4.4
