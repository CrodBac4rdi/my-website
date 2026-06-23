-- ============================================================
--  07_indexes.sql
--  Performance-Indexes für häufige Abfragen.
--  Zuerst 06_security.sql ausführen.
--
--  Strategie: Jede häufige WHERE- oder JOIN-Bedingung
--  bekommt einen Index. Partial-Indexes für boolesche Filter.
-- ============================================================

-- ----------------------------------------------------------
-- USER_WATCHLIST
-- ----------------------------------------------------------
-- Häufigste Query: alle Einträge eines Nutzers
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id
  ON user_watchlist (user_id);

-- Status-Filter (Tab-Filter auf Watchlist-Seite)
CREATE INDEX IF NOT EXISTS idx_watchlist_user_status
  ON user_watchlist (user_id, status);

-- Media-seitige Lookups (z.B. "Wie viele haben X auf der Watchlist?")
CREATE INDEX IF NOT EXISTS idx_watchlist_media_id
  ON user_watchlist (media_id);

-- ----------------------------------------------------------
-- REVIEWS
-- ----------------------------------------------------------
-- Alle Reviews für einen Titel (ReviewSection)
CREATE INDEX IF NOT EXISTS idx_reviews_media_id
  ON reviews (media_id);

-- Reviews eines Nutzers (Profil-Seite, "Meine Reviews")
CREATE INDEX IF NOT EXISTS idx_reviews_user_id
  ON reviews (user_id);

-- Neueste zuerst (Standardsortierung in ReviewSection)
CREATE INDEX IF NOT EXISTS idx_reviews_media_created
  ON reviews (media_id, created_at DESC);

-- ----------------------------------------------------------
-- CUSTOM_LISTS
-- ----------------------------------------------------------
-- Alle Listen eines Nutzers
CREATE INDEX IF NOT EXISTS idx_custom_lists_user_id
  ON custom_lists (user_id);

-- Alle öffentlichen Listen (für Community-Discovery)
CREATE INDEX IF NOT EXISTS idx_custom_lists_public
  ON custom_lists (is_public)
  WHERE is_public = true;

-- ----------------------------------------------------------
-- CUSTOM_LIST_ITEMS
-- ----------------------------------------------------------
-- Alle Items einer Liste (mit Sortierung)
CREATE INDEX IF NOT EXISTS idx_list_items_list_order
  ON custom_list_items (list_id, sort_order);

-- Rückwärts-Lookup: In welchen Listen ist ein Titel?
CREATE INDEX IF NOT EXISTS idx_list_items_media_id
  ON custom_list_items (media_id);

-- ----------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------
-- Alle Notifications eines Nutzers (neueste zuerst)
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications (user_id, created_at DESC);

-- Ungelesene Notifications (Partial-Index, sehr effizient)
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications (user_id)
  WHERE is_read = false;

-- ----------------------------------------------------------
-- PROFILES
-- ----------------------------------------------------------
-- Username-Suche (Trigram-Index für LIKE/ILIKE)
CREATE INDEX IF NOT EXISTS idx_profiles_username_trgm
  ON profiles USING gin (username gin_trgm_ops);

-- ----------------------------------------------------------
-- MEDIA
-- ----------------------------------------------------------
-- Typ-Filter (tv vs movie)
CREATE INDEX IF NOT EXISTS idx_media_type
  ON media (type);
