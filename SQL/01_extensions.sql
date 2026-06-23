-- ============================================================
--  01_extensions.sql
--  Aktiviert benötigte PostgreSQL-Erweiterungen.
--  Supabase aktiviert die meisten davon bereits standardmäßig.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- UUID-Generierung (gen_random_uuid läuft auch ohne, aber sicher ist sicher)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Kryptographische Funktionen (für gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Trigram-Suche (für zukünftige Volltextsuche auf Usernamen)
