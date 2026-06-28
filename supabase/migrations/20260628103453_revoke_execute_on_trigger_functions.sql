-- Trigger-Funktionen sind nur für Trigger gedacht, nicht für RPC.
-- EXECUTE für API-Rollen entziehen (Trigger laufen weiterhin).
REVOKE EXECUTE ON FUNCTION public.log_watchlist_added()     FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.log_watchlist_completed() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.log_review_added()        FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.log_list_created()        FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_watchlist_on_review() FROM anon, authenticated, public;
