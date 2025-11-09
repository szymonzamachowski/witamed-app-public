-- Usuń stare polityki jeśli istnieją
DROP POLICY IF EXISTS "Anyone can read news" ON news;
DROP POLICY IF EXISTS "Authenticated users can create news" ON news;

-- Polityka: Wszyscy mogą czytać newsy
CREATE POLICY "Anyone can read news" ON news
  FOR SELECT
  USING (true);

-- Polityka: Admini i trenerzy mogą dodawać newsy
CREATE POLICY "Admins and coaches can create news" ON news
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- Polityka: Admini mogą edytować wszystkie newsy
CREATE POLICY "Admins can update all news" ON news
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Polityka: Autorzy mogą edytować swoje newsy
CREATE POLICY "Authors can update own news" ON news
  FOR UPDATE
  USING (author_id = auth.uid());

-- Polityka: Admini mogą usuwać newsy
CREATE POLICY "Admins can delete news" ON news
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );


