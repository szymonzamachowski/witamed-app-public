-- Naprawa RLS policies dla tabeli match_statistics
-- Uruchom ten skrypt w Supabase SQL Editor

-- Sprawdź obecne polityki
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'match_statistics';

-- Usuń wszystkie stare polityki dla match_statistics (jeśli istnieją)
DROP POLICY IF EXISTS "Anyone can read match statistics" ON match_statistics;
DROP POLICY IF EXISTS "Admins can manage match statistics" ON match_statistics;
DROP POLICY IF EXISTS "Public match statistics are viewable by everyone" ON match_statistics;
DROP POLICY IF EXISTS "Users can view match statistics" ON match_statistics;

-- Utwórz nową politykę dla odczytu (wszyscy mogą czytać)
CREATE POLICY "Anyone can read match statistics" ON match_statistics
  FOR SELECT
  USING (true);

-- Utwórz politykę dla dodawania/edycji/usuwania (tylko admini)
CREATE POLICY "Admins can manage match statistics" ON match_statistics
  FOR ALL
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

-- Sprawdź czy polityki zostały utworzone
SELECT 
  'Polityki utworzone!' as status,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'match_statistics';

-- Test odczytu statystyk (powinno zwrócić wszystkie statystyki)
SELECT 
  'Test odczytu statystyk' as test,
  COUNT(*) as statistics_count
FROM match_statistics;

-- Sprawdź statystyki dla przykładowego meczu
SELECT 
  ms.*,
  p.username,
  p.full_name
FROM match_statistics ms
LEFT JOIN profiles p ON p.id = ms.player_id
LIMIT 10;

