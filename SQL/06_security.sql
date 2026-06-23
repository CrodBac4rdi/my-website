-- ============================================================
--  06_security.sql
--  Row Level Security (RLS) + Policies für alle Tabellen.
--  Zuerst 05_views.sql ausführen.
--
--  Prinzip:
--  - Öffentliche Daten (profiles, media, reviews) → SELECT für alle
--  - Nutzerdaten (watchlist, notifications) → nur eigene Daten
--  - Schreiben → immer nur authentifiziert + eigene user_id
-- ============================================================

-- ----------------------------------------------------------
-- RLS aktivieren (idempotent)
-- ----------------------------------------------------------
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE media              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlist     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_lists       ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_list_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------
-- PROFILES
-- Öffentlich lesbar (Nutzerprofil-Seiten), nur eigene Änderungen.
-- INSERT wird durch den handle_new_user() Trigger übernommen
-- (SECURITY DEFINER, umgeht RLS – daher kein separates INSERT-Policy nötig).
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_all"    ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"    ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"    ON profiles;

CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------
-- MEDIA
-- Öffentlich lesbar (globaler Cache).
-- Schreiben (upsert) nur für authentifizierte Nutzer.
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "media_select_all"             ON media;
DROP POLICY IF EXISTS "media_insert_authenticated"   ON media;
DROP POLICY IF EXISTS "media_update_authenticated"   ON media;

CREATE POLICY "media_select_all"
  ON media FOR SELECT
  USING (true);

CREATE POLICY "media_insert_authenticated"
  ON media FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "media_update_authenticated"
  ON media FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ----------------------------------------------------------
-- USER_WATCHLIST
-- Nur eigene Einträge sichtbar und veränderbar.
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "watchlist_select_own"  ON user_watchlist;
DROP POLICY IF EXISTS "watchlist_insert_own"  ON user_watchlist;
DROP POLICY IF EXISTS "watchlist_update_own"  ON user_watchlist;
DROP POLICY IF EXISTS "watchlist_delete_own"  ON user_watchlist;

CREATE POLICY "watchlist_select_own"
  ON user_watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "watchlist_insert_own"
  ON user_watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watchlist_update_own"
  ON user_watchlist FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watchlist_delete_own"
  ON user_watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------
-- REVIEWS
-- Öffentlich lesbar.
-- Erstellen nur als eingeloggter Nutzer (user_id muss passen).
-- Bearbeiten/Löschen nur eigene Reviews.
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "reviews_select_all"   ON reviews;
DROP POLICY IF EXISTS "reviews_insert_own"   ON reviews;
DROP POLICY IF EXISTS "reviews_update_own"   ON reviews;
DROP POLICY IF EXISTS "reviews_delete_own"   ON reviews;

CREATE POLICY "reviews_select_all"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_own"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "reviews_update_own"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------
-- CUSTOM_LISTS
-- Öffentliche Listen für alle lesbar.
-- Private Listen nur für den Ersteller.
-- Erstellen/Bearbeiten/Löschen nur eigene.
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "lists_select_public_or_own"  ON custom_lists;
DROP POLICY IF EXISTS "lists_insert_own"            ON custom_lists;
DROP POLICY IF EXISTS "lists_update_own"            ON custom_lists;
DROP POLICY IF EXISTS "lists_delete_own"            ON custom_lists;

CREATE POLICY "lists_select_public_or_own"
  ON custom_lists FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "lists_insert_own"
  ON custom_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lists_update_own"
  ON custom_lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lists_delete_own"
  ON custom_lists FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------
-- CUSTOM_LIST_ITEMS
-- Lesbar wenn die übergeordnete Liste sichtbar ist.
-- Schreiben/Löschen nur wenn Liste dem Nutzer gehört.
-- Subquery ist notwendig, da RLS nicht direkt JOINen kann.
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "list_items_select_if_visible"  ON custom_list_items;
DROP POLICY IF EXISTS "list_items_insert_own"         ON custom_list_items;
DROP POLICY IF EXISTS "list_items_update_own"         ON custom_list_items;
DROP POLICY IF EXISTS "list_items_delete_own"         ON custom_list_items;

CREATE POLICY "list_items_select_if_visible"
  ON custom_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM custom_lists cl
      WHERE cl.id = custom_list_items.list_id
        AND (cl.is_public = true OR cl.user_id = auth.uid())
    )
  );

CREATE POLICY "list_items_insert_own"
  ON custom_list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM custom_lists cl
      WHERE cl.id = custom_list_items.list_id
        AND cl.user_id = auth.uid()
    )
  );

CREATE POLICY "list_items_update_own"
  ON custom_list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM custom_lists cl
      WHERE cl.id = custom_list_items.list_id
        AND cl.user_id = auth.uid()
    )
  );

CREATE POLICY "list_items_delete_own"
  ON custom_list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM custom_lists cl
      WHERE cl.id = custom_list_items.list_id
        AND cl.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------
-- NOTIFICATIONS
-- Vollständig privat – nur eigene Notifications sichtbar/änderbar.
-- FOR ALL fasst SELECT/INSERT/UPDATE/DELETE zusammen.
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "notifications_own"  ON notifications;

CREATE POLICY "notifications_own"
  ON notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
