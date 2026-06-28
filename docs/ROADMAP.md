# HORIZON — Feature-Roadmap

Große TODO aus dem Feedback. Aufwand: **S** (klein, ~halber Tag) · **M** (mittel) · **L** (groß).
„AI?" = ob künstliche Intelligenz nötig ist (Ziel: möglichst **ohne**).
Status: ⬜ offen · 🟡 in Arbeit · ✅ fertig

> Bereits erledigt (PRs #9 / #10, ggf. noch nicht gemerged): Hover-Fallback, Watchlist-Flicker-Fix,
> Legal-Layout, SEO, „Watchlist leeren", „Account löschen", Avatar-Picker (DiceBear), Basis-Moderation.

---

## Meilenstein 1 — Quick Wins ✅ ERLEDIGT

| # | Feature | Status | Notiz |
|---|---------|--------|-------|
| 1.1 | **Loading-Skeletons statt Spinner** | ✅ | `components/Skeletons.tsx` + route-`loading.tsx` (watchlist/lists/profile/media). |
| 1.2 | **Banner-Picker** (Anime-Backdrops) | ✅ | `BannerPicker` zieht Backdrops via `/api/discover`, setzt TMDB-Original-URL. |
| 1.3 | **Trending-diese-Woche-Rail** | ✅ | `getTrendingWeek()` (`/trending/tv/week`, Anime-gefiltert) → Rail auf der Home. |
| 1.4 | **Watchlist-Stats im Profil** | ✅ | View `user_watchlist_stats` → Stat-Tiles (Gesamt, Abgeschlossen, Schaut, Geplant, Ø-Rating). |
| 3.1 | **Profil-Layout neu arrangiert** | ✅ | Identität → Stats → Bearbeiten (ausklappbar) → Watchlist → Aktivität → Danger Zone. |

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
| 3.1 | **Profil-Layout neu arrangieren** | ✅ erledigt (siehe M1) | — |
| 3.2 | **Chibi-Anime-Avatare** | M | nein | **Entschieden:** `nekos.best` als Quelle, **alle SFW-Kategorien** anbieten, nach Kategorie sortiert. Host `nekos.best`/CDN in die Bild-Allowlist aufnehmen. (Ergänzt/ersetzt den DiceBear-Picker.) |

---

## Meilenstein 4 — Community / Social

| # | Feature | Aufwand | AI? | Notiz |
|---|---------|---------|-----|-------|
| 4.1 | **Profil-Sichtbarkeit (privat/öffentlich)** | S–M | nein | Neue Spalte `profiles.is_public` (Default **false** = privat) + RLS. UX wie GitHub-Repos: klar sichtbarer Status + leichter Toggle, **ohne** schweres „bist du sicher?". **Entschieden:** ist das Profil öffentlich, sind **Username + Profilbild + Watchlist immer sichtbar** (Pflicht); alles andere (Stats, Bio, Listen, Aktivität) **pro Feld optional** umschaltbar → braucht Sichtbarkeits-Flags (z.B. `profiles.public_fields jsonb`). |
| 4.2 | **Öffentliche Profile `/u/[username]`** | M | nein | Gäste-Ansicht; zeigt Pflicht-Felder + die optional freigegebenen. Greift auf `is_public` + `public_fields`. |
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
