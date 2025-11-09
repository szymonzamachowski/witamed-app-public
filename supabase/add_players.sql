-- Skrypt do dodania zawodników z przykładowych statystyk
-- UWAGA: Ten skrypt wymaga, aby użytkownicy byli najpierw utworzeni przez aplikację
-- lub przez Supabase Dashboard (Authentication → Users → Add user)
--
-- Alternatywnie możesz użyć funkcji pomocniczej do tworzenia użytkowników

-- Lista zawodników do dodania:
-- 1. KAMIL
-- 2. NOWAK
-- 3. MARCIN
-- 4. LIS
-- 5. LEWANDOWSKA
-- 6. KOZŁOWSKI
-- 7. ZAMACH

-- KROK 1: Sprawdź czy istnieją profile dla tych zawodników
SELECT 
  username,
  full_name,
  id
FROM profiles
WHERE username IN ('kamil', 'nowak', 'marcin', 'lis', 'lewandowska', 'kozlowski', 'zamach')
   OR LOWER(full_name) LIKE '%kamil%'
   OR LOWER(full_name) LIKE '%nowak%'
   OR LOWER(full_name) LIKE '%marcin%'
   OR LOWER(full_name) LIKE '%lis%'
   OR LOWER(full_name) LIKE '%lewandowska%'
   OR LOWER(full_name) LIKE '%kozlowski%'
   OR LOWER(full_name) LIKE '%zamach%';

-- KROK 2: Jeśli zawodnicy nie istnieją, musisz ich najpierw utworzyć przez aplikację
-- lub użyć poniższej funkcji (wymaga uprawnień admina)

-- Funkcja pomocnicza do tworzenia użytkownika (wymaga uprawnień service_role)
-- UWAGA: Ta funkcja może nie działać w SQL Editor - użyj Supabase Dashboard lub API

-- Przykładowe dane zawodników:
/*
KAMIL - username: kamil, full_name: Kamil
NOWAK - username: nowak, full_name: Nowak  
MARCIN - username: marcin, full_name: Marcin
LIS - username: lis, full_name: Lis
LEWANDOWSKA - username: lewandowska, full_name: Lewandowski
KOZŁOWSKI - username: kozlowski, full_name: Kozłowski
ZAMACH - username: zamach, full_name: Zamach
*/

-- INSTRUKCJA: 
-- 1. Zarejestruj każdego zawodnika przez aplikację (strona /signup)
--    - Username: kamil, nowak, marcin, lis, lewandowska, kozlowski, zamach
--    - Hasło: możesz użyć tego samego dla wszystkich (np. "HASLO_STARTOWE")
--    - Email: opcjonalne (zostanie wygenerowany jako username@witamed.local)
--    - Full name: odpowiednie imię/nazwisko
--
-- 2. Po utworzeniu zawodników, uruchom ten skrypt ponownie, aby sprawdzić czy istnieją
--
-- 3. Jeśli chcesz zaktualizować full_name dla istniejących zawodników, użyj:

-- Aktualizacja full_name dla istniejących zawodników (jeśli username się zgadza)
UPDATE profiles
SET full_name = CASE username
  WHEN 'kamil' THEN 'Kamil'
  WHEN 'nowak' THEN 'Nowak'
  WHEN 'marcin' THEN 'Marcin'
  WHEN 'lis' THEN 'Lis'
  WHEN 'lewandowska' THEN 'Lewandowski'
  WHEN 'kozlowski' THEN 'Kozłowski'
  WHEN 'zamach' THEN 'Zamach'
END
WHERE username IN ('kamil', 'nowak', 'marcin', 'lis', 'lewandowska', 'kozlowski', 'zamach')
  AND full_name IS NULL OR full_name = '';

-- Sprawdź wynik
SELECT username, full_name, role, created_at
FROM profiles
WHERE username IN ('kamil', 'nowak', 'marcin', 'lis', 'lewandowska', 'kozlowski', 'zamach')
ORDER BY username;

