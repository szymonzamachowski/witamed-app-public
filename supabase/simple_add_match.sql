-- PROSTY SKRYPT DO DODANIA PRZYKŁADOWEGO MECZU
-- Uruchom ten skrypt w Supabase SQL Editor
-- Ten skrypt na pewno zadziała, nawet jeśli nie masz zawodników

-- 1. Najpierw upewnij się, że struktura jest rozszerzona
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

-- 2. Usuń stary mecz jeśli istnieje (opcjonalnie)
-- DELETE FROM match_statistics WHERE match_id = '550e8400-e29b-41d4-a716-446655440000';
-- DELETE FROM matches WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 3. Dodaj mecz
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

-- 4. Sprawdź czy mecz został dodany
SELECT 
  'Mecz dodany!' as status,
  id,
  opponent,
  date,
  score,
  video_url
FROM matches
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 5. Sprawdź wszystkie mecze
SELECT COUNT(*) as total_matches FROM matches;
SELECT id, opponent, date FROM matches ORDER BY date DESC;

