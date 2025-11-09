-- Rozszerzenie tabeli attendance o obsługę meczów ligowych
-- Uruchom ten skrypt w Supabase SQL Editor

-- KROK 1: Zmień event_id na opcjonalne (jeśli jeszcze nie jest)
ALTER TABLE attendance
ALTER COLUMN event_id DROP NOT NULL;

-- KROK 2: Dodaj opcjonalne pole match_id do attendance
ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES matches;

-- KROK 3: Dodaj constraint, że musi być albo event_id albo match_id (ale nie oba)
ALTER TABLE attendance
DROP CONSTRAINT IF EXISTS attendance_event_or_match_check;

ALTER TABLE attendance
ADD CONSTRAINT attendance_event_or_match_check 
CHECK (
  (event_id IS NOT NULL AND match_id IS NULL) OR 
  (event_id IS NULL AND match_id IS NOT NULL)
);

-- KROK 3: Zaktualizuj RLS policies dla attendance z match_id
-- (Polityki już powinny działać, ale sprawdzimy)

-- Sprawdź obecne polityki
SELECT 
  'Obecne polityki attendance:' as info,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'attendance';

-- KROK 4: Sprawdź czy wszystko działa
SELECT 
  'Tabela attendance rozszerzona!' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'attendance'
  AND column_name IN ('event_id', 'match_id')
ORDER BY column_name;

