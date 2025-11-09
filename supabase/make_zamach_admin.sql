-- Nadanie roli administratora użytkownikowi "zamach"
-- Uruchom ten skrypt w Supabase SQL Editor

-- Sprawdź obecną rolę przed zmianą
SELECT 
  'Przed zmianą:' as info,
  username,
  full_name,
  role,
  id
FROM profiles
WHERE LOWER(username) = 'zamach';

-- Nadaj rolę admin
UPDATE profiles
SET role = 'admin'
WHERE LOWER(username) = 'zamach';

-- Sprawdź wynik po zmianie
SELECT 
  'Po zmianie - Zamach jest teraz administratorem!' as status,
  username,
  full_name,
  role,
  created_at
FROM profiles
WHERE LOWER(username) = 'zamach';

-- Jeśli nie znalazł użytkownika, sprawdź wszystkie profile
SELECT 
  'Wszyscy użytkownicy:' as info,
  username,
  full_name,
  role
FROM profiles
ORDER BY username;
