-- SKRYPT DO AKTUALIZACJI NUMERÓW LEGITYMACJI I NADANIA UPRAWNIEŃ ADMIN
-- Uruchom ten skrypt PO utworzeniu zawodników przez aplikację lub panel admina

-- ============================================
-- AKTUALIZACJA NUMERÓW LEGITYMACJI I PEŁNYCH NAZW
-- ============================================

UPDATE profiles
SET 
  league_license_number = CASE 
    WHEN LOWER(username) = 'nowak' OR LOWER(full_name) LIKE '%nowak%' THEN '9000000009'
    WHEN LOWER(username) = 'kozlowski' OR LOWER(full_name) LIKE '%kozlowski%' THEN '9000000002'
    WHEN LOWER(username) = 'jankowski' OR LOWER(full_name) LIKE '%jankowski%' OR LOWER(full_name) LIKE '%jankowski%' THEN '9000000013'
    WHEN LOWER(username) = 'lewandowska' OR LOWER(full_name) LIKE '%lewandowska%' THEN '9000000011'
    WHEN LOWER(username) = 'wozniak' OR LOWER(full_name) LIKE '%wozniak%' THEN '9000000004'
    WHEN LOWER(username) = 'szymanska' OR LOWER(full_name) LIKE '%szymanska%' THEN '9000000014'
    WHEN LOWER(username) = 'kaminski' OR LOWER(full_name) LIKE '%kaminski%' THEN '9000000007'
    WHEN LOWER(username) = 'dabrowski' OR LOWER(full_name) LIKE '%dabrowski%' THEN '9000000010'
    WHEN LOWER(username) = 'zielinski' OR LOWER(full_name) LIKE '%zielinski%' OR LOWER(full_name) LIKE '%ogorzalk%' THEN '9000000005'
    WHEN LOWER(username) = 'michalski' OR LOWER(full_name) LIKE '%michalski%' THEN '9000000001'
    WHEN LOWER(username) = 'kowalczyk' OR LOWER(full_name) LIKE '%kowalczyk%' THEN '9000000006'
    WHEN LOWER(username) = 'wojcik' OR LOWER(full_name) LIKE '%wojcik%' THEN '9000000015'
    WHEN LOWER(username) = 'zamachowski' OR LOWER(username) = 'zamach' OR LOWER(full_name) LIKE '%zamachowski%' OR LOWER(full_name) LIKE '%zamach%' THEN '9000000012'
    ELSE league_license_number
  END,
  full_name = CASE 
    WHEN LOWER(username) = 'nowak' OR LOWER(full_name) LIKE '%nowak%' THEN 'Nowak Maciej'
    WHEN LOWER(username) = 'kozlowski' OR LOWER(full_name) LIKE '%kozlowski%' THEN 'Kozłowski Maciej'
    WHEN LOWER(username) = 'jankowski' OR LOWER(full_name) LIKE '%jankowski%' OR LOWER(full_name) LIKE '%jankowski%' THEN 'Jankowski Michał'
    WHEN LOWER(username) = 'lewandowska' OR LOWER(full_name) LIKE '%lewandowska%' THEN 'Lewandowski Mateusz'
    WHEN LOWER(username) = 'wozniak' OR LOWER(full_name) LIKE '%wozniak%' THEN 'Woźniak Piotr'
    WHEN LOWER(username) = 'szymanska' OR LOWER(full_name) LIKE '%szymanska%' THEN 'Szymański Jakub'
    WHEN LOWER(username) = 'kaminski' OR LOWER(full_name) LIKE '%kaminski%' THEN 'Kamiński Michał'
    WHEN LOWER(username) = 'dabrowski' OR LOWER(full_name) LIKE '%dabrowski%' THEN 'Dąbrowski Mateusz'
    WHEN LOWER(username) = 'zielinski' OR LOWER(full_name) LIKE '%zielinski%' OR LOWER(full_name) LIKE '%ogorzalk%' THEN 'Zieliński Marcin'
    WHEN LOWER(username) = 'michalski' OR LOWER(full_name) LIKE '%michalski%' THEN 'Michalski Dominik'
    WHEN LOWER(username) = 'kowalczyk' OR LOWER(full_name) LIKE '%kowalczyk%' THEN 'Kowalczyk Łukasz'
    WHEN LOWER(username) = 'wojcik' OR LOWER(full_name) LIKE '%wojcik%' THEN 'Wójcik Weronika'
    WHEN LOWER(username) = 'zamachowski' OR LOWER(username) = 'zamach' OR LOWER(full_name) LIKE '%zamachowski%' OR LOWER(full_name) LIKE '%zamach%' THEN 'Zamachowski Szymon'
    ELSE full_name
  END
WHERE username IN (
  'nowak', 'kozlowski', 'jankowski', 'lewandowska', 'wozniak', 'szymanska', 
  'kaminski', 'dabrowski', 'zielinski', 'michalski', 'kowalczyk', 'wojcik', 
  'zamachowski', 'zamach'
) OR LOWER(full_name) LIKE '%nowak%'
   OR LOWER(full_name) LIKE '%kozlowski%'
   OR LOWER(full_name) LIKE '%jankowski%'
   OR LOWER(full_name) LIKE '%jankowski%'
   OR LOWER(full_name) LIKE '%lewandowska%'
   OR LOWER(full_name) LIKE '%wozniak%'
   OR LOWER(full_name) LIKE '%szymanska%'
   OR LOWER(full_name) LIKE '%kaminski%'
   OR LOWER(full_name) LIKE '%dabrowski%'
   OR LOWER(full_name) LIKE '%zielinski%'
   OR LOWER(full_name) LIKE '%ogorzalk%'
   OR LOWER(full_name) LIKE '%michalski%'
   OR LOWER(full_name) LIKE '%kowalczyk%'
   OR LOWER(full_name) LIKE '%wojcik%'
   OR LOWER(full_name) LIKE '%zamachowski%'
   OR LOWER(full_name) LIKE '%zamach%';

-- ============================================
-- NADANIE UPRAWNIEŃ ADMINISTRATORA
-- ============================================

UPDATE profiles
SET role = 'admin'
WHERE (LOWER(username) = 'zamachowski' OR LOWER(username) = 'zamach')
   OR (LOWER(full_name) LIKE '%zamachowski%' OR LOWER(full_name) LIKE '%zamach%')
   OR league_license_number = '9000000012';

-- ============================================
-- SPRAWDZENIE WYNIKU
-- ============================================

SELECT 
  username,
  full_name,
  league_license_number,
  role,
  created_at
FROM profiles
ORDER BY full_name;

