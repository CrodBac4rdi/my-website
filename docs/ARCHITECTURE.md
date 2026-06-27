# HORIZON — Architektur

> **Eine** Doku für alles: Datenbank, Frontend, Logik-Schicht. Für Menschen **und** KI-Agenten.
> Kein menschliche/KI-Split (erzeugt nur Drift). Halte dieses Dokument aktuell, wenn sich Architektur ändert.

Letzte Aktualisierung: nach DB-Härtung (Migrationen bis `20260627214604`).

---

## 1. Stack & Überblick

HORIZON ist ein Anime-Tracker. Daten kommen von **TMDB** (gecached), Persistenz + Auth über **Supabase**.

| Layer | Technologie |
|-------|------------|
| Framework | Next.js 16+ (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS 4 |
| DB / Auth | Supabase (PostgreSQL 17, RLS) |
| Externe Daten | TMDB API (server-seitig, 1h ISR-Cache) |
| Animation / 3D | Framer Motion, Three.js |

**Supabase-Projekt:** `phrpjjuhwvanqfzcfxxg` (Region us-east-1).
**Wichtig:** Es ist eine private Spielwiese — es gibt **keine echten Nutzerdaten**, alle Inhalte stammen aus TMDB und werden nur zwischengespeichert.

---

## 2. Schichten-Architektur

### Ziel (Soll)
```
Components (Server + Client)   ← nur UI + Aufruf, keine DB-Logik
        │
Server Actions ('use server')  ← Auth-Check + zod-Validierung
        │
Service / Data Layer           ← lib/services, Business-Regeln (eine Quelle pro Regel)
        │
Supabase SSR-Client            ← @supabase/ssr, Cookie-Session
        │
PostgreSQL (RLS + Migrations)
```

### Ist (aktuell)
Die Logik liegt noch **direkt in den Client-Komponenten** (`supabase.from(...)` in `WatchListButton`, `ReviewSection`, den Listen-Seiten). Es gibt noch keine Service-Schicht und keine Server Actions für Mutations. Migration dorthin → siehe Roadmap (Abschnitt 7).

**Warum diese Richtung?** Next.js App Router macht Server Actions zur Best Practice für Mutations: ein Ort für Auth + Validierung + Business-Logik, testbar, typsicher, RLS bleibt als zweite Verteidigungslinie.

---

## 3. Datenbank

### Migrations-Workflow (WICHTIG)
- **Quelle der Wahrheit:** `supabase/migrations/*.sql` — versionierte, inkrementelle Änderungen.
- **Baseline:** Der `SQL/`-Ordner (01–07) beschreibt den **initialen** Schema-Aufbau. Die Migrationen in `supabase/migrations/` bauen darauf auf. Reihenfolge = `SQL/` zuerst, dann Migrationen chronologisch.
- **Neue Änderung:** Über Supabase MCP `apply_migration` (wird sofort auf die Live-DB angewendet **und** in der Migrations-Historie versioniert). Danach die identische SQL-Datei in `supabase/migrations/` spiegeln, damit Git & DB synchron bleiben.
- **Niemals** mehr roh im SQL-Editor ohne Migration — sonst entsteht wieder undokumentierte Drift (so entstand die Geister-Tabelle `user_activities`).
- **Typen neu generieren** nach jeder Schema-Änderung: MCP `generate_typescript_types` → nach `lib/database.types.ts`.

### Tabellen (Kurzform)
Vollständige Spalten/Constraints siehe `SQL/02_tables.sql` + `lib/database.types.ts`.

| Tabelle | Zweck | Schlüssel-Constraints |
|---------|-------|----------------------|
| `profiles` | Nutzerprofil (1:1 auth.users) | username 3–30 `[a-z0-9_]`, URLs `http(s)://` |
| `media` | TMDB-Cache | type ∈ (tv, movie) |
| `user_watchlist` | Watchlist + Tracking | UNIQUE(user, media), status-ENUM, rating 1–10 |
| `reviews` | Community-Reviews | UNIQUE(user, media), FK→media, content 10–5000 |
| `custom_lists` | Nutzer-Listen | name 1–100, is_public |
| `custom_list_items` | Listen-Items | UNIQUE(list, media), sort_order |
| `notifications` | App-Benachrichtigungen | type-ENUM, link `/` oder http(s) |

### RLS-Modell
- Öffentlich lesbar: `profiles`, `media`, `reviews`, öffentliche `custom_lists`.
- Privat (nur eigene): `user_watchlist`, `notifications`, private Listen.
- Schreiben: immer nur authentifiziert + eigene `user_id`.
- **Performance-Regel:** Policies nutzen `(select auth.uid())`, **nie** `auth.uid()` direkt — sonst wird es pro Zeile ausgewertet (Advisor `auth_rls_initplan`).

### Views (alle `security_invoker = true`)
`watchlist_with_media`, `reviews_with_author`, `media_community_stats`, `public_lists_view`, `user_watchlist_stats`.

### Funktionen
| Funktion | Security | Notiz |
|----------|----------|-------|
| `set_updated_at()` | trigger, `search_path=''` | generisch für updated_at |
| `handle_new_user()` | DEFINER, EXECUTE nur via Trigger | Profil bei Signup; EXECUTE für anon/authenticated entzogen |
| `get_media_stats(int)` | DEFINER (bewusst) | aggregiert über alle Nutzer, keine PII |
| `get_user_watchlist_stats(uuid)` | INVOKER | RLS schützt; gibt nur eigene Daten |

### Bekannte, akzeptierte Advisor-Hinweise
- `get_media_stats` als DEFINER aufrufbar → **bewusst** (öffentliche Aggregat-Stats).
- "unused index" (12×) → **kein Problem**, nur weil noch kein Traffic/Daten da sind.

### Manuell im Dashboard (nicht per SQL/MCP möglich)
- **Leaked-Password-Protection aktivieren**: Auth → Policies → "Leaked password protection" (HaveIBeenPwned). Noch offen.

---

## 4. Frontend

### Routing
| Route | Auth | Render | Notiz |
|-------|------|--------|-------|
| `/` | – | Server | Landing (Hero + Discover) |
| `/media/[id]?type=tv\|movie` | – | Server | `type` steuert TMDB-Fetch, Fallback auf anderen Typ |
| `/watchlist` | ✓ | Client | Status-Filter-Tabs + Rating; redirect → /login |
| `/lists` + `/lists/[id]` | ✓* | Client | *öffentliche Listen ohne Auth lesbar |
| `/profile` | ✓ | Client | Profil-Edit + Validierung |
| `/login` | – | Client | Login + Signup + Passwort-Reset |
| `/search` | – | Server+Client | SSR initial, Client-Interaktion |
| `/import` | ✓ | Client | **Placeholder, nicht funktional** |

### Konventionen (gelten überall)
- **Double-Submit-Guard:** Mutations nutzen `useRef(false)` als synchronen Guard (State-Updates sind async und schützen nicht vor Doppelklick). Pattern:
  ```ts
  const busy = useRef(false);
  if (busy.current) return; busy.current = true;
  try { /* ... */ } finally { busy.current = false; }
  ```
- **Toast:** `import { toast } from '@/lib/toast'` → `toast.success/error/info`. Container in `app/layout.tsx`.
- **Bilder:** `getImageUrl(path)` versteht volle URLs (DB `cover_url`) **und** TMDB-Pfade (`/abc.jpg`).
- **Listen-Keys:** TMDB liefert teils doppelte IDs → vor dem Rendern deduplizieren (`filter findIndex`), nicht `key={id-index}` als Workaround.
- **Supabase-Fehlercode `23505`** (Unique-Verletzung) wird überall mit klarer Meldung abgefangen.
- **Ein Supabase-Browser-Client:** immer `@/lib/supabase` importieren, nie `createClient` in Komponenten (sonst "Multiple GoTrueClient instances").

---

## 5. Logik-Schicht (in Arbeit)

Zielstruktur (noch nicht umgesetzt):
```
lib/
  services/        ← reine Business-Logik, DB-Zugriff gekapselt
    watchlist.ts
    reviews.ts
    lists.ts
    profile.ts
  actions/         ← 'use server' Server Actions (Auth + zod + service call)
  supabase/
    server.ts      ← createServerClient (@supabase/ssr, cookies)
    client.ts      ← createBrowserClient
  validation/      ← zod-Schemas
```
Voraussetzung: Umstieg auf `@supabase/ssr` + Middleware (Session-Refresh). Erst danach machen Server Actions Sinn, weil sie den server-seitigen, cookie-basierten Client brauchen.

---

## 6. Externe Daten (TMDB)
- Client in `lib/tmdb.ts`, läuft **nur server-seitig** (`TMDB_API_KEY` nie im Client).
- 1h ISR-Cache (`next: { revalidate: 3600 }`).
- `getMediaDetailWithFallback(id, type)`: versucht bevorzugten Typ, fällt auf den anderen zurück.

---

## 7. Roadmap / offene Punkte

| Prio | Thema | Status |
|------|-------|--------|
| P0 | Migrations-Workflow (MCP) | ✅ erledigt |
| P1 | DB-Härtung (RLS-Perf, Funktionen, Geister-Tabelle, pg_trgm) | ✅ erledigt |
| P1 | Leaked-Password-Protection | ⬜ manuell im Dashboard |
| P0 | `@supabase/ssr` + Middleware | ⬜ als Nächstes |
| P2 | Service-Layer + Server Actions (Watchlist, Reviews, Listen, Profil) | ⬜ |
| P2 | zod-Validierung an Action-Grenze | ⬜ |
| P3 | Shared UI-Primitives, Error/Loading-Boundaries, optimistische Updates | ⬜ |
| P4 | MAL/AniList-Import echt umsetzen | ⬜ |
| P4 | Activity-Feed (sauberes Redesign von user_activities) | ⬜ |
| P4 | Notifications-Frontend (+ Trigger für neue Episoden) | ⬜ |

---

## 8. Befehle (Cheatsheet)
- Typen neu generieren: MCP `generate_typescript_types` (project `phrpjjuhwvanqfzcfxxg`) → `lib/database.types.ts`
- Migration anwenden: MCP `apply_migration` + Datei in `supabase/migrations/` spiegeln
- Advisor-Check (nach jeder DDL): MCP `get_advisors` (security + performance)
- Type-Check lokal: `npx tsc --noEmit`
