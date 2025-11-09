-- Naprawa RLS policies dla tabeli matches (dodawanie meczów przez adminów)
-- Uruchom ten skrypt w Supabase SQL Editor

-- Sprawdź obecne polityki
SELECT 
  'Obecne polityki matches:' as info,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'matches';

-- Usuń stare polityki dla INSERT/UPDATE/DELETE (jeśli istnieją)
DROP POLICY IF EXISTS "Admins can insert matches" ON matches;
DROP POLICY IF EXISTS "Admins can update matches" ON matches;
DROP POLICY IF EXISTS "Admins can delete matches" ON matches;

-- Utwórz politykę dla INSERT (tylko admini)
CREATE POLICY "Admins can insert matches" ON matches
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Utwórz politykę dla UPDATE (tylko admini)
CREATE POLICY "Admins can update matches" ON matches
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

-- Utwórz politykę dla DELETE (tylko admini)
CREATE POLICY "Admins can delete matches" ON matches
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Sprawdź czy polityki zostały utworzone
SELECT 
  '✅ Polityki utworzone!' as status,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'matches'
ORDER BY cmd, policyname;

