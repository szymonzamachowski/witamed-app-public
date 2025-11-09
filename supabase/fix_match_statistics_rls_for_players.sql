-- Aktualizacja RLS policies dla match_statistics
-- Pozwala zawodnikom na dodawanie/edycję swoich własnych statystyk
-- Pozwala adminom na dodawanie/edycję statystyk dla wszystkich zawodników

-- KROK 1: Sprawdź obecne polityki
SELECT 
  'Obecne polityki:' as info,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'match_statistics';

-- KROK 2: Usuń WSZYSTKIE stare polityki
DROP POLICY IF EXISTS "Anyone can read match statistics" ON match_statistics;
DROP POLICY IF EXISTS "Admins can manage match statistics" ON match_statistics;
DROP POLICY IF EXISTS "Admins can insert match statistics" ON match_statistics;
DROP POLICY IF EXISTS "Admins can update match statistics" ON match_statistics;
DROP POLICY IF EXISTS "Admins can delete match statistics" ON match_statistics;
DROP POLICY IF EXISTS "Public match statistics are viewable by everyone" ON match_statistics;
DROP POLICY IF EXISTS "Users can view match statistics" ON match_statistics;
DROP POLICY IF EXISTS "match_statistics_select_policy" ON match_statistics;
DROP POLICY IF EXISTS "match_statistics_insert_policy" ON match_statistics;
DROP POLICY IF EXISTS "match_statistics_update_policy" ON match_statistics;
DROP POLICY IF EXISTS "match_statistics_delete_policy" ON match_statistics;
DROP POLICY IF EXISTS "Players can insert their own statistics" ON match_statistics;
DROP POLICY IF EXISTS "Players can update their own statistics" ON match_statistics;
DROP POLICY IF EXISTS "Players can delete their own statistics" ON match_statistics;

-- Alternatywnie: usuń wszystkie polityki dla tej tabeli (jeśli powyższe nie działają)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'match_statistics') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON match_statistics', r.policyname);
    END LOOP;
END $$;

-- KROK 3: Utwórz politykę dla odczytu (wszyscy mogą czytać)
CREATE POLICY "Anyone can read match statistics" ON match_statistics
  FOR SELECT
  USING (true);

-- KROK 4: Utwórz politykę dla INSERT
-- Zawodnicy mogą dodawać swoje własne statystyki
-- Admini mogą dodawać statystyki dla wszystkich zawodników
CREATE POLICY "Players and admins can insert match statistics" ON match_statistics
  FOR INSERT
  WITH CHECK (
    -- Zawodnik może dodać statystyki dla siebie
    player_id = auth.uid()
    OR
    -- Admin może dodać statystyki dla każdego
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- KROK 5: Utwórz politykę dla UPDATE
-- Zawodnicy mogą edytować swoje własne statystyki
-- Admini mogą edytować statystyki dla wszystkich zawodników
CREATE POLICY "Players and admins can update match statistics" ON match_statistics
  FOR UPDATE
  USING (
    -- Zawodnik może edytować swoje własne statystyki
    player_id = auth.uid()
    OR
    -- Admin może edytować statystyki dla każdego
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    -- Zawodnik może edytować swoje własne statystyki
    player_id = auth.uid()
    OR
    -- Admin może edytować statystyki dla każdego
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- KROK 6: Utwórz politykę dla DELETE
-- Zawodnicy mogą usuwać swoje własne statystyki
-- Admini mogą usuwać statystyki dla wszystkich zawodników
CREATE POLICY "Players and admins can delete match statistics" ON match_statistics
  FOR DELETE
  USING (
    -- Zawodnik może usunąć swoje własne statystyki
    player_id = auth.uid()
    OR
    -- Admin może usunąć statystyki dla każdego
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- KROK 7: Sprawdź czy polityki zostały utworzone
SELECT 
  '✅ Polityki utworzone!' as status,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'match_statistics'
ORDER BY cmd, policyname;

-- KROK 8: Test - sprawdź czy można odczytać statystyki
SELECT 
  'Test odczytu:' as test,
  COUNT(*) as statistics_count
FROM match_statistics;

-- KROK 9: Sprawdź swój profil
SELECT 
  'Twój profil:' as info,
  id,
  username,
  full_name,
  role
FROM profiles
WHERE id = auth.uid();

