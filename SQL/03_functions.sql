-- ============================================================
--  03_functions.sql
--  PL/pgSQL-Funktionen (Trigger-Funktionen + Utility).
--  Zuerst 02_tables.sql ausführen.
-- ============================================================

-- ----------------------------------------------------------
-- set_updated_at()
-- Generischer Trigger, der updated_at auf now() setzt.
-- Wird von mehreren Tabellen-Triggern verwendet.
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at IS 'Generischer BEFORE UPDATE Trigger: setzt updated_at = now().';

-- ----------------------------------------------------------
-- handle_new_user()
-- Erstellt automatisch ein Profil wenn ein neuer Auth-User
-- angelegt wird. Verwendet ON CONFLICT DO NOTHING als Schutz
-- gegen Duplikate bei Retry-Szenarien.
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS 'Auth-Trigger: erstellt Profile-Eintrag nach auth.users INSERT. SECURITY DEFINER für RLS-Bypass nötig.';

-- ----------------------------------------------------------
-- get_media_stats(p_media_id)
-- Gibt Community-Statistiken für einen Titel zurück:
-- Durchschnittsbewertung, Anzahl Reviews, Watchlist-Einträge.
-- SECURITY DEFINER + search_path = public für sichere Ausführung.
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_media_stats(p_media_id integer)
RETURNS TABLE (
  avg_rating      numeric,
  review_count    bigint,
  watchlist_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ROUND(AVG(r.rating)::numeric, 1)                                      AS avg_rating,
    COUNT(DISTINCT r.id)                                                   AS review_count,
    (SELECT COUNT(*) FROM user_watchlist w WHERE w.media_id = p_media_id) AS watchlist_count
  FROM reviews r
  WHERE r.media_id = p_media_id;
$$;

COMMENT ON FUNCTION public.get_media_stats IS 'Gibt avg_rating, review_count, watchlist_count für eine media_id zurück.';

-- ----------------------------------------------------------
-- get_user_watchlist_stats(p_user_id)
-- Statistiken für ein Nutzerprofil (für Profil-Seite).
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_watchlist_stats(p_user_id uuid)
RETURNS TABLE (
  completed_count  bigint,
  watching_count   bigint,
  planned_count    bigint,
  dropped_count    bigint,
  on_hold_count    bigint,
  avg_rating       numeric,
  total_count      bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*) FILTER (WHERE status = 'completed')    AS completed_count,
    COUNT(*) FILTER (WHERE status = 'watching')     AS watching_count,
    COUNT(*) FILTER (WHERE status = 'plan_to_watch') AS planned_count,
    COUNT(*) FILTER (WHERE status = 'dropped')      AS dropped_count,
    COUNT(*) FILTER (WHERE status = 'on_hold')      AS on_hold_count,
    ROUND(AVG(rating) FILTER (WHERE rating IS NOT NULL)::numeric, 1) AS avg_rating,
    COUNT(*)                                        AS total_count
  FROM user_watchlist
  WHERE user_id = p_user_id;
$$;

COMMENT ON FUNCTION public.get_user_watchlist_stats IS 'Aggregierte Watchlist-Statistiken für ein Nutzerprofil.';
