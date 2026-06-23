-- ============================================================
--  04_triggers.sql
--  Trigger-Definitionen.
--  Zuerst 03_functions.sql ausführen.
-- ============================================================

-- ----------------------------------------------------------
-- Auth-Trigger: Profil bei Signup erstellen
-- Greift auf auth.users zu – kann nur als Superuser gesetzt werden
-- (in Supabase über das SQL-Editor ohne Einschränkungen möglich).
-- ----------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------
-- updated_at Trigger für alle relevanten Tabellen
-- ----------------------------------------------------------
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_media_updated_at ON media;
CREATE TRIGGER set_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_watchlist_updated_at ON user_watchlist;
CREATE TRIGGER set_watchlist_updated_at
  BEFORE UPDATE ON user_watchlist
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_reviews_updated_at ON reviews;
CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_custom_lists_updated_at ON custom_lists;
CREATE TRIGGER set_custom_lists_updated_at
  BEFORE UPDATE ON custom_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
