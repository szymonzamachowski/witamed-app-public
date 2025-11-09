-- Naprawa RLS policies dla tabeli events
-- Uruchom ten skrypt w Supabase SQL Editor

-- Sprawdź obecne polityki
SELECT 
  'Obecne polityki events:' as info,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'events';

-- Usuń stare polityki
DROP POLICY IF EXISTS "Anyone can read events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Public events are viewable by everyone" ON events;

-- Utwórz politykę dla odczytu (wszyscy mogą czytać)
CREATE POLICY "Anyone can read events" ON events
  FOR SELECT
  USING (true);

-- Utwórz politykę dla INSERT (tylko admini)
CREATE POLICY "Admins can insert events" ON events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Utwórz politykę dla UPDATE (tylko admini)
CREATE POLICY "Admins can update events" ON events
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
CREATE POLICY "Admins can delete events" ON events
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
WHERE tablename = 'events'
ORDER BY cmd, policyname;

