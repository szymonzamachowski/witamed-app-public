-- KOMPLETNA NAPRAWA RLS POLICIES DLA match_statistics
-- Uruchom ten skrypt w Supabase SQL Editor, aby naprawić problem z dodawaniem statystyk

-- KROK 1: Sprawdź obecne polityki
SELECT 
  'Obecne polityki:' as info,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'match_statistics';

-- KROK 2: Usuń WSZYSTKIE stare polityki (wszystkie możliwe nazwy)
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

-- Alternatywnie: usuń wszystkie polityki dla tej tabeli (jeśli powyższe nie działają)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'match_statistics') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON match_statistics', r.policyname);
    END LOOP;
END $$;

-- KROK 3: Utwórz nową politykę dla odczytu (wszyscy mogą czytać)
CREATE POLICY "Anyone can read match statistics" ON match_statistics
  FOR SELECT
  USING (true);

-- KROK 4: Utwórz politykę dla INSERT (tylko admini)
-- Uwaga: Dla INSERT używamy WITH CHECK, nie USING
CREATE POLICY "Admins can insert match statistics" ON match_statistics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- KROK 5: Utwórz politykę dla UPDATE (tylko admini)
CREATE POLICY "Admins can update match statistics" ON match_statistics
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- KROK 6: Utwórz politykę dla DELETE (tylko admini)
CREATE POLICY "Admins can delete match statistics" ON match_statistics
  FOR DELETE
  USING (
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

-- KROK 9: Sprawdź czy jesteś zalogowany jako admin
SELECT 
  'Twój profil:' as info,
  id,
  username,
  full_name,
  role
FROM profiles
WHERE id = auth.uid();

