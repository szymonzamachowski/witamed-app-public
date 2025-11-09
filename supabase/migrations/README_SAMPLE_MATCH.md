# Instrukcja dodania przykładowego meczu

## Krok 1: Rozszerzenie struktury bazy danych

Najpierw uruchom migrację `20251109_extend_match_statistics.sql` w Supabase SQL Editor, aby dodać potrzebne kolumny.

## Krok 2: Dodanie przykładowego meczu

Uruchom migrację `20251109_add_sample_match.sql` w Supabase SQL Editor.

**UWAGA:** Ta migracja wymaga, aby w tabeli `profiles` istnieli zawodnicy z rolą `player`. 
Jeśli nie masz jeszcze zawodników:
1. Najpierw zarejestruj kilku zawodników przez aplikację
2. Następnie uruchom migrację, która doda statystyki dla istniejących zawodników

## Alternatywnie: Ręczne dodanie meczu

Możesz też dodać mecz ręcznie przez panel Supabase:

1. Przejdź do tabeli `matches` w Supabase Dashboard
2. Kliknij "Insert row"
3. Wypełnij pola:
   - `opponent`: "KS AZS Politechnika Warszawska"
   - `date`: wybierz datę
   - `location`: "Hala sportowa, Warszawa"
   - `score`: "3:0 (25:20, 25:18, 25:22)"
   - `video_url`: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
   - `match_errors`: skopiuj JSON z migracji

4. Następnie dodaj statystyki dla zawodników w tabeli `match_statistics`

