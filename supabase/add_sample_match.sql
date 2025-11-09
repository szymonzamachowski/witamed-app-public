-- ============================================
-- SKRYPT DO DODANIA PRZYKŁADOWEGO MECZU
-- ============================================
-- Uruchom ten skrypt w Supabase SQL Editor
-- 
-- UWAGA: Najpierw upewnij się, że:
-- 1. Uruchomiłeś migrację 20251109_extend_match_statistics.sql
-- 2. Masz przynajmniej kilku zawodników w tabeli profiles
-- ============================================

-- KROK 1: Rozszerzenie struktury (jeśli jeszcze nie zostało wykonane)
ALTER TABLE match_statistics
ADD COLUMN IF NOT EXISTS serve_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS serve_errors INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS serve_aces INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reception_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reception_positive INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reception_other INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reception_errors INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reception_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attack_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attack_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attack_unfinished INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attack_errors INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attack_blocked INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attack_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS block_total INTEGER DEFAULT 0;

ALTER TABLE matches
ADD COLUMN IF NOT EXISTS match_errors JSONB;

-- KROK 2: Dodanie przykładowego meczu
INSERT INTO matches (id, date, opponent, location, score, video_url, match_errors)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '2024-11-15 18:00:00+00',
  'KS AZS Politechnika Warszawska',
  'Hala sportowa, Warszawa',
  '3:0 (25:20, 25:18, 25:22)',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '{
    "opponent_errors_total": 25,
    "opponent_errors_set1": 10,
    "opponent_errors_set2": 10,
    "opponent_errors_set3": 5,
    "blocks_against_total": 6,
    "blocks_against_set1": 3,
    "blocks_against_set2": 3,
    "blocks_against_set3": 0,
    "own_errors_total": 21,
    "own_errors_set1": 7,
    "own_errors_set2": 9,
    "own_errors_set3": 5,
    "own_errors_other_set1": 2,
    "own_errors_other_set2": 5,
    "own_errors_other_set3": 0
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  date = EXCLUDED.date,
  opponent = EXCLUDED.opponent,
  location = EXCLUDED.location,
  score = EXCLUDED.score,
  video_url = EXCLUDED.video_url,
  match_errors = EXCLUDED.match_errors;

-- KROK 3: Dodanie statystyk dla istniejących zawodników
-- Ten skrypt automatycznie znajdzie pierwszych 7 zawodników i doda dla nich statystyki
DO $$
DECLARE
  match_id UUID := '550e8400-e29b-41d4-a716-446655440000';
  player_ids UUID[];
  player_count INTEGER;
BEGIN
  -- Pobierz ID pierwszych 7 zawodników
  SELECT ARRAY_AGG(id), COUNT(*) INTO player_ids, player_count
  FROM profiles 
  WHERE role = 'player' 
  LIMIT 7;
  
  -- Jeśli nie ma zawodników, wyświetl komunikat
  IF player_count = 0 THEN
    RAISE NOTICE 'UWAGA: Nie znaleziono zawodników w bazie. Najpierw zarejestruj zawodników przez aplikację, a następnie uruchom ten skrypt ponownie.';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Znaleziono % zawodników. Dodawanie statystyk...', player_count;
  
  -- Statystyki dla pierwszego zawodnika (MARCIN)
  IF array_length(player_ids, 1) >= 1 THEN
    INSERT INTO match_statistics (
      match_id, player_id,
      points, aces, blocks, spikes, digs,
      serve_total, serve_errors, serve_aces,
      reception_total, reception_positive, reception_other, reception_errors, reception_percentage,
      attack_total, attack_points, attack_unfinished, attack_errors, attack_blocked, attack_percentage,
      block_total
    )
    VALUES (
      match_id, player_ids[1],
      18, 2, 0, 7, 13,
      15, 1, 2,
      13, 9, 4, 0, 69,
      7, 6, 1, 0, 0, 86,
      0
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Statystyki dla drugiego zawodnika (LIS)
  IF array_length(player_ids, 1) >= 2 THEN
    INSERT INTO match_statistics (
      match_id, player_id,
      points, aces, blocks, spikes, digs,
      serve_total, serve_errors, serve_aces,
      reception_total, reception_positive, reception_other, reception_errors, reception_percentage,
      attack_total, attack_points, attack_unfinished, attack_errors, attack_blocked, attack_percentage,
      block_total
    )
    VALUES (
      match_id, player_ids[2],
      15, 3, 1, 16, 13,
      17, 1, 3,
      13, 8, 4, 1, 62,
      16, 4, 10, 2, 0, 25,
      1
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Statystyki dla trzeciego zawodnika (LEWANDOWSKA)
  IF array_length(player_ids, 1) >= 3 THEN
    INSERT INTO match_statistics (
      match_id, player_id,
      points, aces, blocks, spikes, digs,
      serve_total, serve_errors, serve_aces,
      reception_total, reception_positive, reception_other, reception_errors, reception_percentage,
      attack_total, attack_points, attack_unfinished, attack_errors, attack_blocked, attack_percentage,
      block_total
    )
    VALUES (
      match_id, player_ids[3],
      22, 1, 0, 30, 0,
      10, 2, 1,
      0, 0, 0, 0, 0,
      30, 18, 8, 3, 1, 60,
      0
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Statystyki dla czwartego zawodnika (NOWAK)
  IF array_length(player_ids, 1) >= 4 THEN
    INSERT INTO match_statistics (
      match_id, player_id,
      points, aces, blocks, spikes, digs,
      serve_total, serve_errors, serve_aces,
      reception_total, reception_positive, reception_other, reception_errors, reception_percentage,
      attack_total, attack_points, attack_unfinished, attack_errors, attack_blocked, attack_percentage,
      block_total
    )
    VALUES (
      match_id, player_ids[4],
      8, 0, 5, 11, 0,
      6, 0, 0,
      0, 0, 0, 0, 0,
      11, 5, 3, 3, 0, 45,
      5
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Statystyki dla piątego zawodnika (KAMIL)
  IF array_length(player_ids, 1) >= 5 THEN
    INSERT INTO match_statistics (
      match_id, player_id,
      points, aces, blocks, spikes, digs,
      serve_total, serve_errors, serve_aces,
      reception_total, reception_positive, reception_other, reception_errors, reception_percentage,
      attack_total, attack_points, attack_unfinished, attack_errors, attack_blocked, attack_percentage,
      block_total
    )
    VALUES (
      match_id, player_ids[5],
      2, 0, 0, 0, 0,
      13, 2, 0,
      0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      0
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Statystyki dla szóstego zawodnika (KOZŁOWSKI)
  IF array_length(player_ids, 1) >= 6 THEN
    INSERT INTO match_statistics (
      match_id, player_id,
      points, aces, blocks, spikes, digs,
      serve_total, serve_errors, serve_aces,
      reception_total, reception_positive, reception_other, reception_errors, reception_percentage,
      attack_total, attack_points, attack_unfinished, attack_errors, attack_blocked, attack_percentage,
      block_total
    )
    VALUES (
      match_id, player_ids[6],
      0, 0, 0, 0, 8,
      0, 0, 0,
      8, 6, 2, 0, 0,
      0, 0, 0, 0, 0, 0,
      0
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Statystyki dla siódmego zawodnika (ZAMACH)
  IF array_length(player_ids, 1) >= 7 THEN
    INSERT INTO match_statistics (
      match_id, player_id,
      points, aces, blocks, spikes, digs,
      serve_total, serve_errors, serve_aces,
      reception_total, reception_positive, reception_other, reception_errors, reception_percentage,
      attack_total, attack_points, attack_unfinished, attack_errors, attack_blocked, attack_percentage,
      block_total
    )
    VALUES (
      match_id, player_ids[7],
      0, 0, 0, 0, 4,
      0, 0, 0,
      4, 2, 2, 0, 50,
      0, 0, 0, 0, 0, 0,
      0
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RAISE NOTICE 'Statystyki zostały dodane pomyślnie!';
END $$;

-- Sprawdzenie czy mecz został dodany
SELECT 
  m.id,
  m.opponent,
  m.date,
  m.score,
  m.video_url,
  COUNT(ms.id) as statistics_count
FROM matches m
LEFT JOIN match_statistics ms ON ms.match_id = m.id
WHERE m.id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY m.id, m.opponent, m.date, m.score, m.video_url;

