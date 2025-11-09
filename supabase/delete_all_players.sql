-- SKRYPT DO USUNIĘCIA WSZYSTKICH ZAWODNIKÓW
-- Uruchom ten skrypt w Supabase SQL Editor PRZED dodaniem nowych zawodników
-- UWAGA: Ten skrypt usuwa tylko profile i powiązane dane
-- Użytkowników z auth.users musisz usunąć ręcznie przez Supabase Dashboard → Authentication → Users

-- ============================================
-- KROK 1: USUNIĘCIE POWIĄZANYCH DANYCH
-- ============================================

-- Usuń newsy (news) - najpierw, bo mają foreign key do profiles
DELETE FROM news WHERE author_id IN (SELECT id FROM profiles);

-- Usuń obecności (attendance)
DELETE FROM attendance WHERE player_id IN (SELECT id FROM profiles);

-- Usuń statystyki meczów (match_statistics)
DELETE FROM match_statistics WHERE player_id IN (SELECT id FROM profiles);

-- ============================================
-- KROK 2: USUNIĘCIE WSZYSTKICH PROFILI
-- ============================================

DELETE FROM profiles;

-- ============================================
-- KROK 3: SPRAWDZENIE
-- ============================================

SELECT COUNT(*) as remaining_profiles FROM profiles;
-- Powinno zwrócić 0

-- ============================================
-- INSTRUKCJA: USUNIĘCIE UŻYTKOWNIKÓW Z AUTH.USERS
-- ============================================
-- Po uruchomieniu tego skryptu, przejdź do:
-- Supabase Dashboard → Authentication → Users
-- I usuń wszystkich użytkowników ręcznie (lub użyj API)

