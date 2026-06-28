-- Activity-Feed: persönliche Aktivitäts-Historie (own-only, da Watchlist privat ist).
-- Sauberer Neuaufbau der früher entfernten user_activities-Tabelle.

DROP TABLE IF EXISTS public.user_activities CASCADE;

CREATE TABLE public.user_activities (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type text        NOT NULL,
  media_id      integer     REFERENCES public.media(id) ON DELETE CASCADE,
  metadata      jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_activity_type CHECK (
    activity_type IN ('added_to_watchlist', 'completed', 'reviewed', 'created_list')
  )
);

COMMENT ON TABLE public.user_activities IS 'Persönliche Aktivitäts-Historie pro Nutzer (own-only). Befüllt via SECURITY DEFINER Trigger.';

ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select_own" ON public.user_activities
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE INDEX idx_activities_user_created ON public.user_activities (user_id, created_at DESC);

-- ---- Trigger-Funktionen (SECURITY DEFINER + search_path='') ----

CREATE OR REPLACE FUNCTION public.log_watchlist_added()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.user_activities (user_id, activity_type, media_id)
  VALUES (NEW.user_id, 'added_to_watchlist', NEW.media_id);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_watchlist_added
  AFTER INSERT ON public.user_watchlist
  FOR EACH ROW EXECUTE FUNCTION public.log_watchlist_added();

CREATE OR REPLACE FUNCTION public.log_watchlist_completed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.user_activities (user_id, activity_type, media_id)
    VALUES (NEW.user_id, 'completed', NEW.media_id);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_watchlist_completed
  AFTER UPDATE ON public.user_watchlist
  FOR EACH ROW EXECUTE FUNCTION public.log_watchlist_completed();

CREATE OR REPLACE FUNCTION public.log_review_added()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.user_activities (user_id, activity_type, media_id)
  VALUES (NEW.user_id, 'reviewed', NEW.media_id);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_review_added
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.log_review_added();

CREATE OR REPLACE FUNCTION public.log_list_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.user_activities (user_id, activity_type, metadata)
  VALUES (NEW.user_id, 'created_list', jsonb_build_object('name', NEW.name, 'list_id', NEW.id));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_list_created
  AFTER INSERT ON public.custom_lists
  FOR EACH ROW EXECUTE FUNCTION public.log_list_created();

-- ---- View für die Anzeige ----
CREATE OR REPLACE VIEW public.activity_feed WITH (security_invoker = true) AS
SELECT
  a.id, a.user_id, a.activity_type, a.media_id, a.metadata, a.created_at,
  m.title    AS media_title,
  m.cover_url AS media_cover,
  m.type     AS media_type
FROM public.user_activities a
LEFT JOIN public.media m ON m.id = a.media_id;

COMMENT ON VIEW public.activity_feed IS 'user_activities + media-Details. security_invoker -> own-only via RLS.';
