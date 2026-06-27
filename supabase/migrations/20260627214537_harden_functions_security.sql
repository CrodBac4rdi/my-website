-- 1. set_updated_at: search_path fixieren (behebt function_search_path_mutable Advisor)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. handle_new_user: nur als Trigger gedacht – EXECUTE für API-Rollen entziehen.
--    Der Trigger läuft weiterhin (Trigger ignorieren EXECUTE-Grants).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- 3. get_user_watchlist_stats: war SECURITY DEFINER -> jeder konnte mit beliebiger
--    user_id fremde Statistiken abfragen. Auf SECURITY INVOKER umstellen, damit RLS
--    greift (Nutzer sieht nur eigene Watchlist-Zeilen). EXECUTE auf authenticated beschränken.
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
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    COUNT(*) FILTER (WHERE status = 'completed')     AS completed_count,
    COUNT(*) FILTER (WHERE status = 'watching')      AS watching_count,
    COUNT(*) FILTER (WHERE status = 'plan_to_watch') AS planned_count,
    COUNT(*) FILTER (WHERE status = 'dropped')       AS dropped_count,
    COUNT(*) FILTER (WHERE status = 'on_hold')       AS on_hold_count,
    ROUND(AVG(rating) FILTER (WHERE rating IS NOT NULL)::numeric, 1) AS avg_rating,
    COUNT(*)                                         AS total_count
  FROM public.user_watchlist
  WHERE user_id = p_user_id;
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_watchlist_stats(uuid) FROM anon, public;

-- 4. get_media_stats bleibt SECURITY DEFINER (muss watchlist_count über ALLE Nutzer
--    zählen, was unter RLS sonst 0 ergäbe). Gibt nur aggregierte, nicht-personen-
--    bezogene Zahlen zurück -> als öffentlich akzeptiert. search_path ist bereits gesetzt.
COMMENT ON FUNCTION public.get_media_stats(integer) IS
  'Aggregierte Community-Stats pro Titel. SECURITY DEFINER bewusst: zählt watchlist_count über alle Nutzer. Gibt keine PII zurück.';
