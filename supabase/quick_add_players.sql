-- SZYBKI SKRYPT DO DODANIA ZAWODNIKÓW
-- Ten skrypt pomoże Ci dodać zawodników z przykładowych statystyk
--
-- UWAGA: Supabase wymaga, aby użytkownicy byli najpierw utworzeni w auth.users
-- Ten skrypt tylko aktualizuje profile, jeśli użytkownicy już istnieją

-- Lista zawodników:
-- 1. KAMIL
-- 2. NOWAK  
-- 3. MARCIN
-- 4. LIS
-- 5. LEWANDOWSKA
-- 6. KOZŁOWSKI
-- 7. ZAMACH

-- KROK 1: Sprawdź obecnych zawodników
SELECT 
  'Obecni zawodnicy:' as info,
  COUNT(*) as total_players
FROM profiles
WHERE role = 'player';

SELECT 
  username,
  full_name,
  id,
  created_at
FROM profiles
WHERE role = 'player'
ORDER BY username;

-- KROK 2: Aktualizuj full_name dla istniejących zawodników (jeśli username się zgadza)
UPDATE profiles
SET full_name = CASE 
  WHEN LOWER(username) = 'kamil' THEN 'Kamil'
  WHEN LOWER(username) = 'nowak' OR LOWER(username) = 'nowak' THEN 'Nowak'
  WHEN LOWER(username) = 'marcin' THEN 'Marcin'
  WHEN LOWER(username) = 'lis' THEN 'Lis'
  WHEN LOWER(username) = 'lewandowska' THEN 'Lewandowski'
  WHEN LOWER(username) = 'kozlowski' OR LOWER(username) = 'kozlowski' THEN 'Kozłowski'
  WHEN LOWER(username) = 'zamach' THEN 'Zamach'
END
WHERE LOWER(username) IN ('kamil', 'nowak', 'nowak', 'marcin', 'lis', 'lewandowska', 'kozlowski', 'kozlowski', 'zamach')
  AND (full_name IS NULL OR full_name = '');

-- KROK 3: Sprawdź wynik
SELECT 
  'Zawodnicy po aktualizacji:' as info,
  username,
  full_name,
  role
FROM profiles
WHERE role = 'player'
ORDER BY username;

-- INSTRUKCJA DODAWANIA ZAWODNIKÓW:
-- 
-- Najprostszy sposób: Zarejestruj każdego zawodnika przez aplikację (/signup)
--
-- Dla każdego zawodnika:
-- 1. Przejdź na /signup
-- 2. Wypełnij:
--    - Nazwa użytkownika: kamil, nowak, marcin, lis, lewandowska, kozlowski, zamach
--    - Imię i nazwisko: Kamil, Nowak, Marcin, Lis, Lewandowski, Kozłowski, Zamach
--    - Hasło: wybierz (np. HASLO_STARTOWE)
--    - Email: pozostaw puste
-- 3. Kliknij "Zarejestruj się"
--
-- Po utworzeniu wszystkich zawodników, uruchom ten skrypt ponownie,
-- aby zaktualizować full_name jeśli potrzeba.

