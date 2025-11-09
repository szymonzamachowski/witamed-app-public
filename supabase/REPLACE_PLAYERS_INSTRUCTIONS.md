# Instrukcja zastąpienia wszystkich zawodników

## Krok po kroku:

### 1. Usunięcie obecnych zawodników

**Opcja A: Przez Supabase Dashboard (ZALECANE)**
1. Przejdź do Supabase Dashboard → **Authentication** → **Users**
2. Usuń wszystkich użytkowników ręcznie (lub użyj "Delete all users" jeśli dostępne)

**Opcja B: Przez SQL (tylko profile)**
1. Uruchom skrypt `delete_all_players.sql` w Supabase SQL Editor
2. To usunie tylko profile i powiązane dane
3. Użytkowników z auth.users musisz usunąć przez Dashboard

### 2. Dodanie nowych zawodników

**Opcja A: Przez Panel Administratora (ZALECANE)**
1. Zaloguj się na konto administratora
2. Przejdź do Panel Administratora → **Dodaj zawodników**
3. Wprowadź hasło (np. `HASLO_STARTOWE`)
4. Kliknij "Utwórz wszystkich zawodników"
5. System automatycznie utworzy 13 zawodników z numerami legitymacji
6. Szymon Zamachowski otrzyma automatycznie uprawnienia administratora

**Opcja B: Przez aplikację (ręcznie)**
1. Dla każdego zawodnika przejdź na `/signup`
2. Wypełnij formularz:
   - Username: odpowiedni username (np. `nowak`)
   - Imię i nazwisko: pełne imię i nazwisko (np. `Nowak Maciej`)
   - Numer legitymacji ligowej: odpowiedni numer (np. `9000000009`)
   - Hasło: wybierz hasło
3. Powtórz dla wszystkich 13 zawodników

### 3. Aktualizacja numerów legitymacji i uprawnień (jeśli użyłeś Opcji B)

1. Uruchom skrypt `update_players_license.sql` w Supabase SQL Editor
2. To zaktualizuje numery legitymacji i nada uprawnienia admin Szymonowi Zamachowskiemu

### 4. Sprawdzenie

Uruchom w Supabase SQL Editor:
```sql
SELECT 
  username,
  full_name,
  league_license_number,
  role,
  created_at
FROM profiles
ORDER BY full_name;
```

Powinieneś zobaczyć 13 zawodników z poprawnymi numerami legitymacji i Szymon Zamachowski z rolą `admin`.

## Lista zawodników:

1. Nowak Maciej - 9000000009
2. Kozłowski Maciej - 9000000002
3. Jankowski Michał - 9000000013
4. Lewandowski Mateusz - 9000000011
5. Woźniak Piotr - 9000000004
6. Szymański Jakub - 9000000014
7. Kamiński Michał - 9000000007
8. Dąbrowski Mateusz - 9000000010
9. Zieliński Marcin - 9000000005
10. Michalski Dominik - 9000000001
11. Kowalczyk Łukasz - 9000000006
12. Wójcik Weronika - 9000000015
13. Zamachowski Szymon - 9000000012 (ADMIN)

