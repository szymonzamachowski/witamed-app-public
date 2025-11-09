-- Skrypt do sprawdzenia RLS policies dla tabeli matches
-- Uruchom ten skrypt w Supabase SQL Editor

-- Sprawdź czy RLS jest włączony
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'matches';

-- Sprawdź wszystkie polityki dla tabeli matches
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'matches';

-- Sprawdź czy można odczytać mecze (jako anonimowy użytkownik)
-- To powinno zwrócić wszystkie mecze jeśli polityka "Anyone can read matches" działa
SELECT 
  'Test odczytu meczów' as test,
  COUNT(*) as matches_count
FROM matches;

-- Jeśli powyższe zwraca 0, ale mecze istnieją, to problem jest z RLS
-- W takim przypadku uruchom:
-- DROP POLICY IF EXISTS "Anyone can read matches" ON matches;
-- CREATE POLICY "Anyone can read matches" ON matches FOR SELECT USING (true);

