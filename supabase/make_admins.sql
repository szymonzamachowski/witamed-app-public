-- Nadanie roli administratora użytkownikom: Weronika Wójcik i Michał Kamiński
-- Uruchom ten skrypt w Supabase SQL Editor

-- Sprawdź obecne role przed zmianą
SELECT 
  'Przed zmianą:' as info,
  username,
  full_name,
  role,
  id
FROM profiles
WHERE LOWER(username) IN ('wojcik', 'kaminski')
ORDER BY username;

-- Nadaj rolę admin dla Weroniki Wójcik
UPDATE profiles
SET role = 'admin'
WHERE LOWER(username) = 'wojcik';

-- Nadaj rolę admin dla Michała Kamińskiego
UPDATE profiles
SET role = 'admin'
WHERE LOWER(username) = 'kaminski';

-- Sprawdź wynik po zmianie
SELECT 
  'Po zmianie - Weronika Wójcik i Michał Kamiński są teraz administratorami!' as status,
  username,
  full_name,
  role,
  created_at
FROM profiles
WHERE LOWER(username) IN ('wojcik', 'kaminski')
ORDER BY username;

-- Jeśli nie znalazł użytkowników, sprawdź wszystkie profile
SELECT 
  'Wszyscy administratorzy:' as info,
  username,
  full_name,
  role
FROM profiles
WHERE role = 'admin'
ORDER BY username;

