-- Status w kadrze: 'active' (gra), 'injured' (kontuzja), 'staff' (sztab, np. kierownik).
-- 'injured' i 'staff' mają dostęp do aplikacji, ale nie zaznaczają obecności nigdzie,
-- nie ma ich w „Nie zaznaczyli obecności”, w statystykach meczu ani w przypomnieniach push.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS player_status TEXT NOT NULL DEFAULT 'active'
  CHECK (player_status IN ('active', 'injured', 'staff'));

-- Status (tak jak rolę) może zmienić tylko admin lub service_role
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
    NEW.player_status := 'active';
  ELSIF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.training_only IS DISTINCT FROM OLD.training_only
     OR NEW.player_status IS DISTINCT FROM OLD.player_status THEN
    RAISE EXCEPTION 'Brak uprawnień do zmiany roli';
  END IF;

  RETURN NEW;
END;
$$;

-- Kontuzjowani i sztab nie zaznaczają obecności; „tylko treningi” – bez meczów ligowych
CREATE OR REPLACE FUNCTION public.check_training_only_attendance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.player_id AND player_status <> 'active') THEN
    RAISE EXCEPTION 'Ten użytkownik nie zaznacza obecności (kontuzja / sztab)';
  END IF;
  IF NEW.match_id IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.player_id AND training_only) THEN
    RAISE EXCEPTION 'Ten zawodnik nie zaznacza obecności na meczach ligowych';
  END IF;
  RETURN NEW;
END;
$$;

UPDATE public.profiles SET player_status = 'injured' WHERE username = 'szymanska';
UPDATE public.profiles SET player_status = 'staff' WHERE username = 'wojcik';

-- Ich dotychczasowe deklaracje nie powinny zaniżać licznika „nie będzie”
DELETE FROM public.attendance
WHERE player_id IN (SELECT id FROM public.profiles WHERE player_status <> 'active');

-- Admin zmienia status zawodników w panelu (pozostałe ograniczenia pilnuje protect_profile_role)
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
