-- Zawodnicy „tylko treningi”: mogą zaznaczać obecność na treningach i sparingach,
-- ale nie na meczach ligowych; powiadomień o meczach nie dostają (filtr w send-push).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS training_only BOOLEAN NOT NULL DEFAULT false;

-- Flagę (tak jak rolę) może zmienić tylko admin lub service_role
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Brak zalogowanego użytkownika = service_role lub SQL Editor: bez ograniczeń
  IF auth.uid() IS NULL OR public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.role := 'player';
    NEW.training_only := false;
  ELSIF NEW.role IS DISTINCT FROM OLD.role OR NEW.training_only IS DISTINCT FROM OLD.training_only THEN
    RAISE EXCEPTION 'Brak uprawnień do zmiany roli';
  END IF;

  RETURN NEW;
END;
$$;

-- Zawodnik „tylko treningi” nie zaznacza obecności na meczach ligowych
CREATE OR REPLACE FUNCTION public.check_training_only_attendance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.match_id IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.player_id AND training_only) THEN
    RAISE EXCEPTION 'Ten zawodnik nie zaznacza obecności na meczach ligowych';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_training_only_attendance ON public.attendance;
CREATE TRIGGER check_training_only_attendance
  BEFORE INSERT OR UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.check_training_only_attendance();
