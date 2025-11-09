-- Skrypt testowy do sprawdzenia czy mecze są w bazie
-- Uruchom ten skrypt w Supabase SQL Editor, aby sprawdzić czy mecze zostały dodane

-- Sprawdź czy mecze istnieją
SELECT 
  id,
  opponent,
  date,
  location,
  score,
  video_url,
  created_at
FROM matches
ORDER BY date DESC;

-- Sprawdź liczbę meczów
SELECT COUNT(*) as total_matches FROM matches;

-- Sprawdź czy przykładowy mecz istnieje
SELECT * FROM matches 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Sprawdź statystyki dla meczu
SELECT 
  ms.*,
  p.full_name,
  p.username
FROM match_statistics ms
LEFT JOIN profiles p ON p.id = ms.player_id
WHERE ms.match_id = '550e8400-e29b-41d4-a716-446655440000';

