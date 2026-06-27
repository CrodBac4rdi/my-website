-- user_activities war nicht Teil des definierten Schemas (SQL/-Ordner).
-- RLS aktiv aber 0 Policies (komplett unzugänglich), media_id als bigint
-- inkonsistent zu media.id (integer), user_id -> auth.users statt profiles.
-- 0 Zeilen. Sauber entfernen; ein echter Activity-Feed kommt später konsistent zurück.
DROP TABLE IF EXISTS public.user_activities CASCADE;
