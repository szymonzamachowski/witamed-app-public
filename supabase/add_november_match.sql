-- Dodanie przykładowego meczu na listopad do testowania kalendarza
-- Uruchom ten skrypt w Supabase SQL Editor

-- Dodaj mecz na listopad 2025
INSERT INTO matches (date, opponent, location, score, video_url)
VALUES (
  '2025-11-20 18:00:00+00',  -- 20 listopada 2025, 18:00
  'KS AZS Politechnika Warszawska',
  'Hala sportowa, ul. Sportowa 1, Warszawa',
  NULL,  -- Brak wyniku (mecz jeszcze się nie odbył)
  NULL   -- Brak wideo
)
ON CONFLICT DO NOTHING;

-- Dodaj kolejny mecz na listopad (jeśli chcesz więcej testów)
INSERT INTO matches (date, opponent, location, score, video_url)
VALUES (
  '2025-11-27 19:00:00+00',  -- 27 listopada 2025, 19:00
  'MKS Ślepsk Suwałki',
  'Hala sportowa, ul. Meczowa 5, Suwałki',
  NULL,
  NULL
)
ON CONFLICT DO NOTHING;

-- Sprawdź dodane mecze
SELECT 
  id,
  date,
  opponent,
  location,
  score,
  created_at
FROM matches
WHERE EXTRACT(MONTH FROM date) = 11
  AND EXTRACT(YEAR FROM date) = 2025
ORDER BY date;

