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
- **Supabase-Client:** nie `createClient` aus `@supabase/supabase-js` in Komponenten (verursacht "Multiple GoTrueClient instances"). Stattdessen die SSR-Factories (`@/lib/supabase/client` bzw. `/server`) oder den Singleton `@/lib/supabase`.
- **media_id ist `number`:** Route-Params sind Strings → vor DB-Queries mit `Number(id)` konvertieren (der typisierte Client erzwingt das jetzt).

---

## 5. Logik-Schicht (in Arbeit)

### Fundament steht (✅)
```
lib/supabase/
  client.ts   ← createClient() Browser (createBrowserClient, cookie-basiert)
  server.ts   ← createClient() Server (createServerClient + async cookies())
lib/supabase.ts ← Backward-Compat-Singleton (nutzt jetzt SSR-Browser-Client)
proxy.ts        ← Next.js 16 Proxy (ehem. middleware): Session-Refresh pro Request
```

**Next.js 16 Besonderheiten (wichtig):**
- `middleware.ts` heißt jetzt **`proxy.ts`** (Funktion `proxy`). Liegt im Root (Ebene von `app/`).
- `cookies()` aus `next/headers` ist **async** → `await cookies()`.
- Server Actions laufen als POST auf ihre eigene Route und können vom Proxy-Matcher übersprungen werden → **jede Action prüft Auth selbst** (`supabase.auth.getUser()`), niemals nur auf den Proxy verlassen.

### Aufbau (etabliert mit der Watchlist-Vertikale ✅)
```
lib/validation/<domain>.ts  ← zod-Schemas (Eingabe-Validierung)
lib/services/<domain>.ts    ← reine DB-Logik, nimmt Server-Client + userId, scopt auf user_id
lib/actions/<domain>.ts     ← 'use server': validieren → Auth → Service → revalidate → ActionResult
lib/actions/result.ts       ← ActionResult<T> + ok()/fail() Helfer
```

**Datenfluss einer Mutation (Referenz: Watchlist):**
1. Client-Komponente ruft `xxxAction(input)` auf (onClick-Handler), behält `useRef`-Guard + lokalen optimistischen State.
2. Action: `safeParse` (zod) → `getAuthedClient()` (`supabase.auth.getUser()`) → Service-Call.
3. Service: gekapselte Queries mit dem typisierten Server-Client, immer `.eq('user_id', userId)` (Defense-in-Depth zur RLS).
4. Action mappt Fehlercodes (z.B. `23505`) auf deutsche Meldungen, ruft `revalidatePath`, gibt `ActionResult` zurück.
5. Komponente: bei `res.ok` State-Update + Toast, sonst `toast.error(res.error)`.

**Regeln:**
- Jede Action prüft Auth selbst (Server Actions sind per POST direkt erreichbar).
- Services werfen nicht — sie geben `{ error }` im Supabase-Stil zurück, damit Actions Codes auswerten können.
- Reads dürfen vorerst im Client über den `supabase`-Singleton bleiben; **Mutations laufen über Actions**.

### Stand: alle Mutations migriert ✅
Service + Action + Validation existieren für **watchlist, reviews, lists, profile**.
Geteilt: `lib/services/media.ts` (`ensureMedia`/`toCoverUrl`), `lib/validation/media.ts`
(`mediaMetaSchema`), `lib/actions/auth.ts` (`getAuthedClient`).

Migrierte Komponenten (Mutations → Actions): WatchListButton, AnimeCard, watchlist/page,
ReviewSection, lists/page, lists/[id]/page, profile/page.

`ReviewSection` bekommt `mediaTitle`/`mediaType`/`posterPath` als Props (von der
Media-Detailseite), damit `createReviewAction` den media-Cache füllen kann
(Reviews haben FK auf media — Reviews für noch nicht gecachte Titel funktionieren so).

### Noch offen
- Reads laufen weiter client-seitig über den `supabase`-Singleton. Optional in Server
  Components verlagern (dann greift `revalidatePath` voll). Singleton bleibt bis dahin.

**Welcher Client wann?**
- Server Component / Server Action / Route Handler → `createClient()` aus `@/lib/supabase/server`
- Client Component (neu) → `createClient()` aus `@/lib/supabase/client`
- Bestehende Client Component → `supabase` aus `@/lib/supabase` (bis migriert)

**Server-Component-Read-Muster (P3):** `watchlist`, `lists`, `profile` sind jetzt Server
Components: Auth + Read server-seitig (`createClient` + `redirect('/login')` + Service-Read),
Übergabe der Initialdaten an einen Client-Wrapper (`WatchlistClient`/`ListsClient`/`ProfileClient`)
für die Interaktivität. Read-Funktionen liegen im jeweiligen Service (`getWatchlist`, `getLists`,
`getProfile`/`getRecentWatchlist`). `lists/[id]` bleibt bewusst client (such-/interaktionslastig).

---

## 6. Externe Daten (TMDB)
- Client in `lib/tmdb.ts`, läuft **nur server-seitig** (`TMDB_API_KEY` nie im Client).
- 1h ISR-Cache (`next: { revalidate: 3600 }`).
- `getMediaDetailWithFallback(id, type)`: versucht bevorzugten Typ, fällt auf den anderen zurück.

---

## 6a. Community-Features (P4)

**Activity-Feed:** `user_activities` (own-only RLS) wird per SECURITY-DEFINER-Trigger befüllt
(watchlist add/completed, review, list created). View `activity_feed` (security_invoker) joint media.
Anzeige: `components/ActivityFeed.tsx` auf der Profilseite.

**Notifications:** Trigger `notify_watchlist_on_review` benachrichtigt Watchlist-Besitzer, wenn ihr
Titel bewertet wird. UI: `components/NotificationBell.tsx` (Header, eingeloggt; Polling 60s).
Mutations (mark read/all) über `lib/actions/notifications.ts`.
**Offen:** „neue Episode"-Notifications brauchen einen Cron/Edge-Function-Job (TMDB-Polling) — separater Deploy.

**MAL/AniList-Import:** `lib/import/parse.ts` (pure, client) parst MAL-XML & AniList/JSON →
normalisierte `{ title, status }`. `lib/services/import.ts` matcht je Titel via TMDB-Suche
(Anime bevorzugt) und upsertet media + watchlist. `importChunkAction` verarbeitet **Chunks à 10**
(TMDB-Rate-Limit); die Seite `/import` ruft sie sequentiell mit Fortschrittsbalken + Ergebnis-Report.

**Trigger-Funktionen:** alle SECURITY DEFINER + `search_path=''` + EXECUTE für anon/authenticated entzogen.

---

## 7. Roadmap / offene Punkte

| Prio | Thema | Status |
|------|-------|--------|
| P0 | Migrations-Workflow (MCP) | ✅ erledigt |
| P1 | DB-Härtung (RLS-Perf, Funktionen, Geister-Tabelle, pg_trgm) | ✅ erledigt |
| P1 | Leaked-Password-Protection | ⬜ manuell im Dashboard |
| P0 | `@supabase/ssr` (client/server) + `proxy.ts` (Session-Refresh) | ✅ erledigt |
| P2 | Service-Layer + Server Actions — Watchlist, Reviews, Listen, Profil | ✅ erledigt |
| P2 | zod-Validierung an Action-Grenze | ✅ erledigt (alle Domains) |
| P3 | Optimistische Updates (Watchlist-Toggle mit Rollback) | ✅ erledigt |
| P3 | Reads in Server Components (watchlist, lists, profile) | ✅ erledigt |
| P3 | Reads in Server Components — lists/[id] | ⬜ bleibt client (such-/interaktionslastig) |
| P3 | Shared UI-Primitives, Error/Loading-Boundaries | ⬜ optional |
| P4 | MAL/AniList-Import (TMDB-Matching, chunked) | ✅ erledigt |
| P4 | Activity-Feed (user_activities + Trigger + View) | ✅ erledigt |
| P4 | Notifications-Frontend + Review-Trigger | ✅ erledigt |
| P4 | Notification-Trigger für neue Episoden (Cron/Edge Function) | ⬜ braucht Deploy |

---

## 8. Befehle (Cheatsheet)
- Typen neu generieren: MCP `generate_typescript_types` (project `phrpjjuhwvanqfzcfxxg`) → `lib/database.types.ts`
- Migration anwenden: MCP `apply_migration` + Datei in `supabase/migrations/` spiegeln
- Advisor-Check (nach jeder DDL): MCP `get_advisors` (security + performance)
- Type-Check lokal: `npx tsc --noEmit`
