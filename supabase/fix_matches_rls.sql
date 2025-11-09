-- Naprawa RLS policies dla tabeli matches
-- Uruchom ten skrypt w Supabase SQL Editor

-- Sprawdź obecne polityki
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'matches';

-- Usuń wszystkie stare polityki dla matches (jeśli istnieją)
DROP POLICY IF EXISTS "Anyone can read matches" ON matches;
DROP POLICY IF EXISTS "Admins can manage matches" ON matches;
DROP POLICY IF EXISTS "Public matches are viewable by everyone" ON matches;
DROP POLICY IF EXISTS "Users can view matches" ON matches;

-- Utwórz nową politykę dla odczytu (wszyscy mogą czytać)
CREATE POLICY "Anyone can read matches" ON matches
  FOR SELECT
  USING (true);

-- Utwórz politykę dla dodawania/edycji/usuwania (tylko admini)
CREATE POLICY "Admins can manage matches" ON matches
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
WHERE tablename = 'matches';

-- Test odczytu meczów (powinno zwrócić wszystkie mecze)
SELECT 
  'Test odczytu' as test,
  COUNT(*) as matches_count,
  ARRAY_AGG(opponent) as opponents
FROM matches;

