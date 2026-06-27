-- Optimiert alle RLS-Policies: auth.uid()/auth.role() in (select ...) wrappen,
-- damit Postgres sie einmal pro Query statt einmal pro Zeile auswertet.
-- Behebt 21x auth_rls_initplan Performance-Advisor.

-- ============ profiles ============
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============ media ============
DROP POLICY IF EXISTS "media_insert_authenticated" ON media;
CREATE POLICY "media_insert_authenticated" ON media FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "media_update_authenticated" ON media;
CREATE POLICY "media_update_authenticated" ON media FOR UPDATE
  USING ((select auth.role()) = 'authenticated');

-- ============ user_watchlist ============
DROP POLICY IF EXISTS "watchlist_select_own" ON user_watchlist;
CREATE POLICY "watchlist_select_own" ON user_watchlist FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "watchlist_insert_own" ON user_watchlist;
CREATE POLICY "watchlist_insert_own" ON user_watchlist FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "watchlist_update_own" ON user_watchlist;
CREATE POLICY "watchlist_update_own" ON user_watchlist FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "watchlist_delete_own" ON user_watchlist;
CREATE POLICY "watchlist_delete_own" ON user_watchlist FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============ reviews ============
DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id AND (select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;
CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============ custom_lists ============
DROP POLICY IF EXISTS "lists_select_public_or_own" ON custom_lists;
CREATE POLICY "lists_select_public_or_own" ON custom_lists FOR SELECT
  USING (is_public = true OR (select auth.uid()) = user_id);

DROP POLICY IF EXISTS "lists_insert_own" ON custom_lists;
CREATE POLICY "lists_insert_own" ON custom_lists FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "lists_update_own" ON custom_lists;
CREATE POLICY "lists_update_own" ON custom_lists FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "lists_delete_own" ON custom_lists;
CREATE POLICY "lists_delete_own" ON custom_lists FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============ custom_list_items ============
DROP POLICY IF EXISTS "list_items_select_if_visible" ON custom_list_items;
CREATE POLICY "list_items_select_if_visible" ON custom_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM custom_lists cl
      WHERE cl.id = custom_list_items.list_id
        AND (cl.is_public = true OR cl.user_id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "list_items_insert_own" ON custom_list_items;
CREATE POLICY "list_items_insert_own" ON custom_list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM custom_lists cl
      WHERE cl.id = custom_list_items.list_id
        AND cl.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "list_items_update_own" ON custom_list_items;
CREATE POLICY "list_items_update_own" ON custom_list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM custom_lists cl
      WHERE cl.id = custom_list_items.list_id
        AND cl.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "list_items_delete_own" ON custom_list_items;
CREATE POLICY "list_items_delete_own" ON custom_list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM custom_lists cl
      WHERE cl.id = custom_list_items.list_id
        AND cl.user_id = (select auth.uid())
    )
  );

-- ============ notifications ============
DROP POLICY IF EXISTS "notifications_own" ON notifications;
CREATE POLICY "notifications_own" ON notifications FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
