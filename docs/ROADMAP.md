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
| 2.1 | **Genre/Filter-Seite `/discover`** | ✅ | Chips Genre/Jahr/Sortierung + Infinite-Scroll (`DiscoverExplorer`), Nav-Link „Entdecken". |
| 2.2 | **„Weil du X auf der Watchlist hast"-Rail** | ✅ | `RecommendationsRail` + `/api/recommendations` (aggregierte TMDB-Recs, gewichtet, Vorhandenes gefiltert). |
| 2.3 | **Personalisierte Empfehlungen** | ✅ | Durch dieselbe content-basierte Aggregation (Häufigkeit + Popularität) abgedeckt. |

---

## Meilenstein 3 — Profil-Überarbeitung & Avatare

| # | Feature | Aufwand | AI? | Notiz |
|---|---------|---------|-----|-------|
| 3.1 | **Profil-Layout neu arrangieren** | ✅ erledigt (siehe M1) | — |
| 3.2 | **Chibi-Anime-Avatare** | ✅ | `AvatarPicker` mit Kategorie-Tabs: nekos.best (Neko/Waifu/Husbando/Kitsune) + „Generiert" (DiceBear). Host `nekos.best` in der Allowlist. |

---

## Meilenstein 4 — Community / Social

| # | Feature | Aufwand | AI? | Notiz |
|---|---------|---------|-----|-------|
| 4.1 | **Profil-Sichtbarkeit (privat/öffentlich)** | ✅ | `profiles.is_public` (default privat) + `public_fields jsonb` + RLS (watchlist öffentlicher Profile lesbar, activity per Flag). Sichtbarkeits-Karte im Profil (sofort-Toggle, Feld-Flags, Link kopieren). |
| 4.2 | **Öffentliche Profile `/u/[username]`** | ✅ | Gäste-Ansicht: Username+Avatar+Watchlist (Pflicht) + Stats/Bio/Listen je nach Flag. Privat → Hinweis statt Inhalt. |
| 4.3 | **Listen öffentlich teilen** | ✅ | `setListVisibilityAction` + Toggle & Teilen-Button in `lists/[id]`, Sichtbarkeits-Badge in der Listen-Übersicht. |
| 4.4 | **Follower + Social-Activity-Feed** | ✅ | `follows`-Tabelle (PK follower/following, no-self-Check, Index) + RLS (öffentlich lesbar; Insert nur eigene Beziehung & nur öffentliche Profile; Delete nur eigene). `social_feed`-View (security_invoker, Akteur-Profil + Medien); Feed nutzt bestehende `user_activities`-RLS (öffentlich+activity-Flag). `FollowSection` (Counts + optimistischer Follow-Button) auf `/u/[username]`, Feed-Seite `/feed` + Nav/Palette-Eintrag. RLS in 4 Fällen verifiziert (public erlaubt; self/spoof/non-public blockiert). |

---

## Meilenstein 5 — Plattform / UX

| # | Feature | Aufwand | AI? | Notiz |
|---|---------|---------|-----|-------|
| 5.1 | **Command-Palette (⌘K)** | ✅ | Eigenes Modal (keine Dependency). ⌘/Ctrl+K + Header-Button öffnen; Fuzzy-Navigation (auth-gated) + debounced TMDB-Live-Suche mit Postern; ↑↓/↵/esc, Backdrop-Close. `components/CommandPalette.tsx`. |
| 5.2 | **PWA scharf schalten** | ✅ | `next-pwa` (Webpack) lief unter Next 16 + **Turbopack** nicht mehr → entfernt. Jetzt manuell laut Next-PWA-Guide: `app/manifest.ts` (/manifest.webmanifest), echte Icons (192/512/maskable + app/icon + apple-icon, generiert via sharp), handgeschriebener `public/sw.js` (Navigation network-first + `/offline`-Fallback, Bilder cache-first, Assets SWR; API/Auth nie gecacht), `components/PWAManager.tsx` (SW-Registrierung nur Prod + Install-Banner Android/Desktop/iOS), Security- & `/sw.js`-No-Cache-Header in `next.config.ts`. Interaktiv verifiziert: SW active, Precache + Offline-Fallback. |

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
