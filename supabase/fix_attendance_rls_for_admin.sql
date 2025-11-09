-- Naprawa RLS policies dla tabeli attendance - dodanie uprawnień dla administratorów
-- Uruchom ten skrypt w Supabase SQL Editor

-- Sprawdź obecne polityki
SELECT 
  'Obecne polityki:' as info,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'attendance';

-- Usuń stare polityki
DROP POLICY IF EXISTS "Users can view attendance" ON attendance;
DROP POLICY IF EXISTS "Users can manage own attendance" ON attendance;
DROP POLICY IF EXISTS "Anyone can read attendance" ON attendance;
DROP POLICY IF EXISTS "Users can insert own attendance" ON attendance;
DROP POLICY IF EXISTS "Users can update own attendance" ON attendance;
DROP POLICY IF EXISTS "Users can delete own attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can manage attendance" ON attendance;

-- Utwórz politykę dla odczytu (wszyscy mogą czytać)
CREATE POLICY "Anyone can read attendance" ON attendance
  FOR SELECT
  USING (true);

-- Utwórz politykę dla INSERT (użytkownicy mogą dodawać swoją obecność)
-- Obsługuje zarówno event_id jak i match_id
CREATE POLICY "Users can insert own attendance" ON attendance
  FOR INSERT
  WITH CHECK (
    auth.uid() = player_id AND
    ((event_id IS NOT NULL AND match_id IS NULL) OR (event_id IS NULL AND match_id IS NOT NULL))
  );

-- Utwórz politykę dla INSERT (administratorzy mogą dodawać obecność dla wszystkich)
CREATE POLICY "Admins can insert any attendance" ON attendance
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    ) AND
    ((event_id IS NOT NULL AND match_id IS NULL) OR (event_id IS NULL AND match_id IS NOT NULL))
  );

-- Utwórz politykę dla UPDATE (użytkownicy mogą aktualizować swoją obecność)
CREATE POLICY "Users can update own attendance" ON attendance
  FOR UPDATE
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- Utwórz politykę dla UPDATE (administratorzy mogą aktualizować obecność wszystkich)
CREATE POLICY "Admins can update any attendance" ON attendance
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

-- Utwórz politykę dla DELETE (użytkownicy mogą usuwać swoją obecność)
CREATE POLICY "Users can delete own attendance" ON attendance
  FOR DELETE
  USING (auth.uid() = player_id);

-- Utwórz politykę dla DELETE (administratorzy mogą usuwać obecność wszystkich)
CREATE POLICY "Admins can delete any attendance" ON attendance
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
WHERE tablename = 'attendance'
ORDER BY cmd, policyname;

