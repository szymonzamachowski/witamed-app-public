-- Polityka: Użytkownicy mogą tworzyć swoje profile
-- Usuń starą politykę jeśli istnieje
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Upewnij się, że użytkownicy mogą aktualizować swoje profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id);


