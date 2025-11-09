-- SKRYPT DO ZASTĄPIENIA WSZYSTKICH ZAWODNIKÓW NOWYMI
-- Uruchom ten skrypt w Supabase SQL Editor
-- UWAGA: Ten skrypt usuwa tylko profile, użytkowników z auth.users musisz usunąć ręcznie przez Dashboard

-- ============================================
-- KROK 1: USUNIĘCIE WSZYSTKICH OBECNYCH PROFILI
-- ============================================

-- Najpierw usuń powiązane dane (attendance, match_statistics)
DELETE FROM attendance WHERE player_id IN (SELECT id FROM profiles);
DELETE FROM match_statistics WHERE player_id IN (SELECT id FROM profiles);

-- Usuń wszystkie profile (użytkowników z auth.users usuń ręcznie przez Dashboard)
DELETE FROM profiles;

-- ============================================
-- KROK 2: DODANIE NOWYCH ZAWODNIKÓW
-- ============================================
-- UWAGA: Zawodnicy muszą być najpierw utworzeni przez aplikację (/signup) lub przez Supabase Dashboard
-- Po utworzeniu użytkowników w auth.users, uruchom poniższe UPDATE, aby zaktualizować profile

-- Lista zawodników z numerami legitymacji:
-- 1. Nowak Maciej - 9000000009
-- 2. Kozłowski Maciej - 9000000002
-- 3. Jankowski Michał - 9000000013
-- 4. Lewandowski Mateusz - 9000000011
-- 5. Woźniak Piotr - 9000000004
-- 6. Szymański Jakub - 9000000014
-- 7. Kamiński Michał - 9000000007
-- 8. Dąbrowski Mateusz - 9000000010
-- 9. Zieliński Marcin - 9000000005
-- 10. Michalski Dominik - 9000000001
-- 11. Kowalczyk Łukasz - 9000000006
-- 12. Wójcik Weronika - 9000000015
-- 13. Zamachowski Szymon - 9000000012 (ADMIN)

-- ============================================
-- KROK 3: AKTUALIZACJA PROFILI Z NUMERAMI LEGITYMACJI
-- ============================================
-- Uruchom to PO utworzeniu użytkowników przez aplikację lub Dashboard

-- Aktualizacja numerów legitymacji i pełnych nazw
UPDATE profiles
SET 
  league_license_number = CASE 
    WHEN LOWER(username) = 'nowak' OR LOWER(full_name) LIKE '%nowak%' THEN '9000000009'
    WHEN LOWER(username) = 'kozlowski' OR LOWER(full_name) LIKE '%kozlowski%' THEN '9000000002'
    WHEN LOWER(username) = 'jankowski' OR LOWER(full_name) LIKE '%jankowski%' THEN '9000000013'
    WHEN LOWER(username) = 'lewandowska' OR LOWER(full_name) LIKE '%lewandowska%' THEN '9000000011'
    WHEN LOWER(username) = 'wozniak' OR LOWER(full_name) LIKE '%wozniak%' THEN '9000000004'
    WHEN LOWER(username) = 'szymanska' OR LOWER(full_name) LIKE '%szymanska%' THEN '9000000014'
    WHEN LOWER(username) = 'kaminski' OR LOWER(full_name) LIKE '%kaminski%' THEN '9000000007'
    WHEN LOWER(username) = 'dabrowski' OR LOWER(full_name) LIKE '%dabrowski%' THEN '9000000010'
    WHEN LOWER(username) = 'zielinski' OR LOWER(full_name) LIKE '%zielinski%' THEN '9000000005'
    WHEN LOWER(username) = 'michalski' OR LOWER(full_name) LIKE '%michalski%' THEN '9000000001'
    WHEN LOWER(username) = 'kowalczyk' OR LOWER(full_name) LIKE '%kowalczyk%' THEN '9000000006'
    WHEN LOWER(username) = 'wojcik' OR LOWER(full_name) LIKE '%wojcik%' THEN '9000000015'
    WHEN LOWER(username) = 'zamachowski' OR LOWER(full_name) LIKE '%zamachowski%' OR LOWER(full_name) LIKE '%zamach%' THEN '9000000012'
    ELSE league_license_number
  END,
  full_name = CASE 
    WHEN LOWER(username) = 'nowak' OR LOWER(full_name) LIKE '%nowak%' THEN 'Nowak Maciej'
    WHEN LOWER(username) = 'kozlowski' OR LOWER(full_name) LIKE '%kozlowski%' THEN 'Kozłowski Maciej'
    WHEN LOWER(username) = 'jankowski' OR LOWER(full_name) LIKE '%jankowski%' THEN 'Jankowski Michał'
    WHEN LOWER(username) = 'lewandowska' OR LOWER(full_name) LIKE '%lewandowska%' THEN 'Lewandowski Mateusz'
    WHEN LOWER(username) = 'wozniak' OR LOWER(full_name) LIKE '%wozniak%' THEN 'Woźniak Piotr'
    WHEN LOWER(username) = 'szymanska' OR LOWER(full_name) LIKE '%szymanska%' THEN 'Szymański Jakub'
    WHEN LOWER(username) = 'kaminski' OR LOWER(full_name) LIKE '%kaminski%' THEN 'Kamiński Michał'
    WHEN LOWER(username) = 'dabrowski' OR LOWER(full_name) LIKE '%dabrowski%' THEN 'Dąbrowski Mateusz'
    WHEN LOWER(username) = 'zielinski' OR LOWER(full_name) LIKE '%zielinski%' THEN 'Zieliński Marcin'
    WHEN LOWER(username) = 'michalski' OR LOWER(full_name) LIKE '%michalski%' THEN 'Michalski Dominik'
    WHEN LOWER(username) = 'kowalczyk' OR LOWER(full_name) LIKE '%kowalczyk%' THEN 'Kowalczyk Łukasz'
    WHEN LOWER(username) = 'wojcik' OR LOWER(full_name) LIKE '%wojcik%' THEN 'Wójcik Weronika'
    WHEN LOWER(username) = 'zamachowski' OR LOWER(full_name) LIKE '%zamachowski%' OR LOWER(full_name) LIKE '%zamach%' THEN 'Zamachowski Szymon'
    ELSE full_name
  END
WHERE username IN (
  'nowak', 'kozlowski', 'jankowski', 'lewandowska', 'wozniak', 'szymanska', 
  'kaminski', 'dabrowski', 'zielinski', 'michalski', 'kowalczyk', 'wojcik', 
  'zamachowski', 'zamach'
) OR LOWER(full_name) LIKE '%nowak%'
   OR LOWER(full_name) LIKE '%kozlowski%'
   OR LOWER(full_name) LIKE '%jankowski%'
   OR LOWER(full_name) LIKE '%lewandowska%'
   OR LOWER(full_name) LIKE '%wozniak%'
   OR LOWER(full_name) LIKE '%szymanska%'
   OR LOWER(full_name) LIKE '%kaminski%'
   OR LOWER(full_name) LIKE '%dabrowski%'
   OR LOWER(full_name) LIKE '%zielinski%'
   OR LOWER(full_name) LIKE '%michalski%'
   OR LOWER(full_name) LIKE '%kowalczyk%'
   OR LOWER(full_name) LIKE '%wojcik%'
   OR LOWER(full_name) LIKE '%zamachowski%'
   OR LOWER(full_name) LIKE '%zamach%';

-- ============================================
-- KROK 4: NADANIE UPRAWNIEŃ ADMINISTRATORA
-- ============================================

-- Nadaj uprawnienia administratora Szymonowi Zamachowskiemu
UPDATE profiles
SET role = 'admin'
WHERE (LOWER(username) = 'zamachowski' OR LOWER(username) = 'zamach')
   OR (LOWER(full_name) LIKE '%zamachowski%' OR LOWER(full_name) LIKE '%zamach%')
   OR league_license_number = '9000000012';

-- ============================================
-- KROK 5: SPRAWDZENIE WYNIKU
-- ============================================

SELECT 
  username,
  full_name,
  league_license_number,
  role,
  created_at
FROM profiles
ORDER BY full_name;

