-- Ermöglicht es einem eingeloggten Nutzer, NUR seinen eigenen Account zu löschen.
-- SECURITY DEFINER: läuft mit den Rechten des Owners und darf auth.users löschen.
-- Das Löschen cascadet via FK über profiles auf alle Nutzerdaten
-- (watchlist, reviews, lists, notifications, activities).
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM auth.users WHERE id = (SELECT auth.uid());
$$;

-- Nur eingeloggte Nutzer dürfen die Funktion aufrufen (für sich selbst).
REVOKE EXECUTE ON FUNCTION public.delete_user() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;

COMMENT ON FUNCTION public.delete_user() IS
  'Löscht den eigenen Account (auth.uid()) inkl. aller Daten via Cascade. Nur authenticated.';
