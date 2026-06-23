-- ============================================================
--  05_views.sql
--  Datenbank-Views für häufige Joins.
--  security_invoker = true → Views respektieren RLS der
--  aufrufenden Session (sicherer als SECURITY DEFINER Views).
--  Zuerst 04_triggers.sql ausführen.
-- ============================================================

-- ----------------------------------------------------------
-- watchlist_with_media
-- Watchlist-Einträge mit Medien-Details.
-- Verwendung: watchlist/page.tsx, profile/page.tsx
-- RLS: Nutzer sieht nur eigene Einträge (via user_watchlist RLS).
-- ----------------------------------------------------------
DROP VIEW IF EXISTS watchlist_with_media CASCADE;
CREATE OR REPLACE VIEW watchlist_with_media
  WITH (security_invoker = true)
AS
SELECT
  w.id            AS watchlist_id,
  w.user_id,
  w.status,
  w.rating,
  w.notes,
  w.created_at,
  w.updated_at,
  m.id            AS media_id,
  m.title,
  m.type          AS media_type,
  m.cover_url
FROM user_watchlist w
JOIN media m ON m.id = w.media_id;

COMMENT ON VIEW watchlist_with_media IS 'user_watchlist JOIN media. Respektiert RLS – Nutzer sieht nur eigene Einträge.';

-- ----------------------------------------------------------
-- reviews_with_author
-- Reviews mit Autor-Informationen (Username, Avatar).
-- Verwendung: ReviewSection.tsx, media/[id]/page.tsx
-- RLS: Reviews sind öffentlich lesbar.
-- ----------------------------------------------------------
DROP VIEW IF EXISTS reviews_with_author CASCADE;
CREATE OR REPLACE VIEW reviews_with_author
  WITH (security_invoker = true)
AS
SELECT
  r.id,
  r.media_id,
  r.user_id,
  r.rating,
  r.content,
  r.is_spoiler,
  r.created_at,
  r.updated_at,
  p.username,
  p.avatar_url
FROM reviews r
JOIN profiles p ON p.id = r.user_id;

COMMENT ON VIEW reviews_with_author IS 'reviews JOIN profiles(username, avatar_url). Öffentlich lesbar.';

-- ----------------------------------------------------------
-- media_community_stats
-- Aggregierte Community-Daten pro Titel.
-- Verwendung: Medien-Detailseite, zukünftige Ranking-Feature.
-- ----------------------------------------------------------
DROP VIEW IF EXISTS media_community_stats CASCADE;
CREATE OR REPLACE VIEW media_community_stats
  WITH (security_invoker = true)
AS
SELECT
  m.id                                                        AS media_id,
  m.title,
  m.type,
  ROUND(AVG(r.rating)::numeric, 1)                           AS avg_rating,
  COUNT(DISTINCT r.id)                                       AS review_count,
  COUNT(DISTINCT w.id)                                       AS watchlist_count
FROM media m
LEFT JOIN reviews r        ON r.media_id = m.id
LEFT JOIN user_watchlist w ON w.media_id = m.id
GROUP BY m.id, m.title, m.type;

COMMENT ON VIEW media_community_stats IS 'Aggregierte Bewertungs- und Watchlist-Zahlen pro Titel.';

-- ----------------------------------------------------------
-- public_lists_view
-- Öffentliche Custom Lists mit Item-Anzahl und Autor-Name.
-- Verwendung: zukünftige Community-Listen-Seite.
-- ----------------------------------------------------------
DROP VIEW IF EXISTS public_lists_view CASCADE;
CREATE OR REPLACE VIEW public_lists_view
  WITH (security_invoker = true)
AS
SELECT
  cl.id,
  cl.user_id,
  cl.name,
  cl.description,
  cl.is_public,
  cl.created_at,
  cl.updated_at,
  p.username      AS author_username,
  p.avatar_url    AS author_avatar,
  COUNT(cli.id)   AS item_count
FROM custom_lists cl
JOIN profiles p             ON p.id    = cl.user_id
LEFT JOIN custom_list_items cli ON cli.list_id = cl.id
WHERE cl.is_public = true
GROUP BY cl.id, cl.user_id, cl.name, cl.description, cl.is_public, cl.created_at, cl.updated_at, p.username, p.avatar_url;

COMMENT ON VIEW public_lists_view IS 'Nur öffentliche Listen mit Autor-Info und Item-Anzahl.';

-- ----------------------------------------------------------
-- user_watchlist_stats
-- Aggregierte Watchlist-Statistiken pro Nutzer.
-- Verwendung: Profilseite (Statistik-Widget).
-- RLS: Nutzer sieht nur eigene Stats (via user_watchlist RLS).
-- ----------------------------------------------------------
DROP VIEW IF EXISTS user_watchlist_stats CASCADE;
CREATE OR REPLACE VIEW user_watchlist_stats
  WITH (security_invoker = true)
AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE status = 'completed')     AS completed_count,
  COUNT(*) FILTER (WHERE status = 'watching')      AS watching_count,
  COUNT(*) FILTER (WHERE status = 'plan_to_watch') AS planned_count,
  COUNT(*) FILTER (WHERE status = 'dropped')       AS dropped_count,
  COUNT(*) FILTER (WHERE status = 'on_hold')       AS on_hold_count,
  ROUND(AVG(rating) FILTER (WHERE rating IS NOT NULL)::numeric, 1) AS avg_rating,
  COUNT(*)                                         AS total_count
FROM user_watchlist
GROUP BY user_id;

COMMENT ON VIEW user_watchlist_stats IS 'Watchlist-Statistiken aggregiert nach user_id. RLS greift via user_watchlist.';
