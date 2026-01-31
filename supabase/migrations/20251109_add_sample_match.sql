-- Dodanie przykładowego meczu z danymi testowymi
-- Ta migracja tworzy przykładowych zawodników (jeśli nie istnieją) i mecz ze statystykami

-- Przykładowy mecz
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

-- Funkcja pomocnicza do dodawania statystyk (używa istniejących zawodników lub tworzy przykładowych)
DO $$
DECLARE
  match_id UUID := '550e8400-e29b-41d4-a716-446655440000';
  player_ids UUID[];
  player_id UUID;
  i INTEGER;
BEGIN
  -- Pobierz istniejących zawodników
  SELECT ARRAY_AGG(id) INTO player_ids FROM profiles WHERE role = 'player' LIMIT 7;
  
  -- Jeśli nie ma zawodników, utwórz przykładowych (wymaga auth.users)
  -- Dla testów użyjemy istniejących lub stworzymy statystyki bez player_id (nie będzie działać)
  
  -- Przykładowe statystyki dla istniejących zawodników
  IF array_length(player_ids, 1) > 0 THEN
    -- Statystyki dla pierwszego zawodnika (MARCIN)
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
    
    -- Statystyki dla drugiego zawodnika (LIS) - jeśli istnieje
    IF array_length(player_ids, 1) > 1 THEN
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
    
    -- Statystyki dla trzeciego zawodnika (LEWANDOWSKA) - jeśli istnieje
    IF array_length(player_ids, 1) > 2 THEN
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
    
    -- Statystyki dla czwartego zawodnika (NOWAK) - jeśli istnieje
    IF array_length(player_ids, 1) > 3 THEN
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
    
    -- Statystyki dla piątego zawodnika (KAMIL) - jeśli istnieje
    IF array_length(player_ids, 1) > 4 THEN
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
    
    -- Statystyki dla szóstego zawodnika (KOZŁOWSKI) - jeśli istnieje
    IF array_length(player_ids, 1) > 5 THEN
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
    
    -- Statystyki dla siódmego zawodnika (ZAMACH) - jeśli istnieje
    IF array_length(player_ids, 1) > 6 THEN
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
  END IF;
END $$;
