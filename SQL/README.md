# HORIZON — SQL Setup

Kompletter Datenbankaufbau für Supabase (PostgreSQL).  
Alle Skripte sind **idempotent** und können wiederholt ausgeführt werden.

## Ausführungsreihenfolge

Skripte im Supabase SQL-Editor **in dieser Reihenfolge** ausführen:

| # | Datei | Inhalt | Abhängigkeiten |
|---|-------|--------|----------------|
| 1 | `01_extensions.sql` | PostgreSQL-Erweiterungen (uuid-ossp, pgcrypto, pg_trgm) | keine |
| 2 | `02_tables.sql` | Alle Tabellen mit Constraints | 01 |
| 3 | `03_functions.sql` | PL/pgSQL Funktionen (Trigger-Funktionen, Utility) | 02 |
| 4 | `04_triggers.sql` | Trigger-Definitionen (updated_at, handle_new_user) | 03 |
| 5 | `05_views.sql` | Datenbank-Views (JOINs, Aggregationen) | 04 |
| 6 | `06_security.sql` | Row Level Security + alle Policies | 05 |
| 7 | `07_indexes.sql` | Performance-Indexes | 06 |

## Tabellen-Übersicht

### `profiles`
Nutzerprofile (1:1 zu `auth.users`).

| Spalte | Typ | Constraint |
|--------|-----|-----------|
| `id` | uuid PK | FK → auth.users ON DELETE CASCADE |
| `username` | text UNIQUE | NULL erlaubt; wenn gesetzt: 3-30 Zeichen, `[a-zA-Z0-9_]` |
| `avatar_url` | text | NULL oder gültiger `http(s)://`-URL |
| `banner_url` | text | NULL oder gültiger `http(s)://`-URL |
| `bio` | text | Max. 500 Zeichen |
| `updated_at` | timestamptz | Automatisch via Trigger |

**Wichtig:** Profil wird automatisch durch `handle_new_user()` Trigger beim Signup erstellt.

---

### `media`
TMDB-Metadaten-Cache. Wird befüllt wenn ein Nutzer etwas zur Watchlist/Liste hinzufügt.

| Spalte | Typ | Constraint |
|--------|-----|-----------|
| `id` | integer PK | TMDB ID (kein Auto-Increment) |
| `title` | text NOT NULL | — |
| `type` | text NOT NULL | CHECK IN ('tv', 'movie') |
| `cover_url` | text | NULL oder `http(s)://` |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | Automatisch via Trigger |

---

### `user_watchlist`
Watchlist-Einträge pro Nutzer.

| Spalte | Typ | Constraint |
|--------|-----|-----------|
| `id` | bigint PK | Auto-Increment |
| `user_id` | uuid FK | → profiles(id) CASCADE |
| `media_id` | integer FK | → media(id) CASCADE |
| `status` | text NOT NULL | CHECK IN ('plan_to_watch', 'watching', 'completed', 'dropped', 'on_hold') |
| `rating` | integer | NULL oder 1-10 |
| `notes` | text | NULL oder max. 1000 Zeichen |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | Automatisch via Trigger |

**UNIQUE:** `(user_id, media_id)` — jeder Titel nur einmal pro Nutzer.

---

### `reviews`
Community-Bewertungen. Max. 1 Review pro Nutzer pro Titel.

| Spalte | Typ | Constraint |
|--------|-----|-----------|
| `id` | uuid PK | gen_random_uuid() |
| `user_id` | uuid FK | → profiles(id) CASCADE |
| `media_id` | integer FK | → media(id) CASCADE (**vorher fehlte dieser FK!**) |
| `rating` | integer NOT NULL | 1-10 |
| `content` | text NOT NULL | 10-5000 Zeichen, nicht leer |
| `is_spoiler` | boolean | Default false |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | Automatisch via Trigger |

**UNIQUE:** `(user_id, media_id)` — verhindert Mehrfach-Reviews.

---

### `custom_lists`
Nutzerdefinierte Medien-Listen.

| Spalte | Typ | Constraint |
|--------|-----|-----------|
| `id` | uuid PK | gen_random_uuid() |
| `user_id` | uuid FK | → profiles(id) CASCADE |
| `name` | text NOT NULL | 1-100 Zeichen, nicht leer |
| `description` | text | NULL oder max. 500 Zeichen |
| `is_public` | boolean | Default false |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | Automatisch via Trigger |

---

### `custom_list_items`
Medien innerhalb einer Liste.

| Spalte | Typ | Constraint |
|--------|-----|-----------|
| `id` | bigint PK | Auto-Increment |
| `list_id` | uuid FK | → custom_lists(id) CASCADE |
| `media_id` | integer FK | → media(id) CASCADE |
| `sort_order` | integer | Default 0 (für manuelle Sortierung) |
| `added_at` | timestamptz | — |

**UNIQUE:** `(list_id, media_id)` — jeder Titel nur einmal pro Liste.

---

### `notifications`
Interne App-Benachrichtigungen.

| Spalte | Typ | Constraint |
|--------|-----|-----------|
| `id` | uuid PK | gen_random_uuid() |
| `user_id` | uuid FK | → profiles(id) CASCADE |
| `type` | text | CHECK IN ('info', 'success', 'warning', 'new_episode', 'review_reply') |
| `title` | text NOT NULL | 1-200 Zeichen |
| `message` | text NOT NULL | 1-1000 Zeichen |
| `link` | text | NULL, relativ (/) oder absolut (http/https) |
| `is_read` | boolean | Default false |
| `created_at` | timestamptz | — |

---

## Views

| View | Beschreibung | Verwendet in |
|------|-------------|-------------|
| `watchlist_with_media` | Watchlist + Media JOIN | watchlist/page.tsx |
| `reviews_with_author` | Reviews + Profile JOIN | ReviewSection.tsx |
| `media_community_stats` | AVG Rating + Counts pro Titel | media/[id]/page.tsx |
| `public_lists_view` | Öffentliche Listen + Item-Anzahl | zukünftige Community-Seite |
| `user_watchlist_stats` | Aggregierte Stats pro Nutzer | profile/page.tsx |

Alle Views verwenden `WITH (security_invoker = true)` → RLS der aufrufenden Session wird respektiert.

---

## Funktionen

| Funktion | Beschreibung |
|----------|-------------|
| `set_updated_at()` | Generischer Trigger für `updated_at = now()` |
| `handle_new_user()` | Erstellt Profil nach Signup (SECURITY DEFINER) |
| `get_media_stats(media_id)` | Gibt avg_rating, review_count, watchlist_count zurück |
| `get_user_watchlist_stats(user_id)` | Aggregierte Watchlist-Statistiken für Profil |

---

## RLS-Zusammenfassung

| Tabelle | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| profiles | alle | eigene (via Trigger) | eigene | — |
| media | alle | auth. Nutzer | auth. Nutzer | — |
| user_watchlist | eigene | eigene | eigene | eigene |
| reviews | alle | eigene | eigene | eigene |
| custom_lists | öffentl. + eigene | eigene | eigene | eigene |
| custom_list_items | wenn Liste sichtbar | wenn Liste eigene | wenn Liste eigene | wenn Liste eigene |
| notifications | eigene | eigene | eigene | eigene |

---

## Geändert gegenüber alter DB (database.sql + supabase_migration.sql)

| Problem | Fix |
|---------|-----|
| `reviews` kein UNIQUE(user_id, media_id) | ✅ Hinzugefügt |
| `reviews.media_id` kein FK | ✅ FK auf media(id) hinzugefügt |
| `user_watchlist.status` ohne CHECK | ✅ CHECK Constraint hinzugefügt |
| `profiles.username` ohne Format-CHECK | ✅ Länge + Regex-Constraint |
| Kein `updated_at` auf reviews/watchlist | ✅ Spalte + Trigger hinzugefügt |
| `custom_list_items` ohne `sort_order` | ✅ Spalte hinzugefügt |
| `user_watchlist.notes` fehlte | ✅ Neue Spalte |
| `notifications.type` fehlte | ✅ Neue Spalte mit ENUM-Check |
| `notifications.link` fehlte | ✅ Neue Spalte |
| Keine Performance-Indexes | ✅ 07_indexes.sql |
| Keine Datenbank-Views | ✅ 05_views.sql |
