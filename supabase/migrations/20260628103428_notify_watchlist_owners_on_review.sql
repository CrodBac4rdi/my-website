-- Benachrichtigt alle Nutzer, die einen Titel auf ihrer Watchlist haben,
-- wenn jemand (außer ihnen selbst) eine Review zu diesem Titel schreibt.

CREATE OR REPLACE FUNCTION public.notify_watchlist_on_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link)
  SELECT
    w.user_id,
    'review_reply',
    'Neue Bewertung',
    'Ein Titel auf deiner Watchlist wurde bewertet.',
    '/media/' || NEW.media_id
  FROM public.user_watchlist w
  WHERE w.media_id = NEW.media_id
    AND w.user_id <> NEW.user_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_review_notify
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.notify_watchlist_on_review();
