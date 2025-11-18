-- Naprawa duplikujących się wpisów obecności i dodanie ograniczeń unikalności
-- Uruchom w Supabase SQL Editor lub jako migrację

-- 1. Usuń duplikaty dla meczów ligowych
WITH ranked_match_attendance AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY player_id, match_id
      ORDER BY created_at DESC, id DESC
    ) AS rn
  FROM attendance
  WHERE match_id IS NOT NULL
)
DELETE FROM attendance a
USING ranked_match_attendance r
WHERE a.id = r.id
  AND r.rn > 1;

-- 2. Usuń duplikaty dla wydarzeń (treningi, sparingi itd.)
WITH ranked_event_attendance AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY player_id, event_id
      ORDER BY created_at DESC, id DESC
    ) AS rn
  FROM attendance
  WHERE event_id IS NOT NULL
)
DELETE FROM attendance a
USING ranked_event_attendance r
WHERE a.id = r.id
  AND r.rn > 1;

-- 3. Dodaj ograniczenia unikalności:
--    - jeden wpis obecności na mecz na zawodnika
--    - jeden wpis obecności na wydarzenie na zawodnika
DO $$
BEGIN
  -- Bezpiecznie dodaj constraint tylko jeśli jeszcze nie istnieje
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'attendance_unique_match'
  ) THEN
    ALTER TABLE attendance
      ADD CONSTRAINT attendance_unique_match
      UNIQUE (player_id, match_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'attendance_unique_event'
  ) THEN
    ALTER TABLE attendance
      ADD CONSTRAINT attendance_unique_event
      UNIQUE (player_id, event_id);
  END IF;
END $$;


