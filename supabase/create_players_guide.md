# Instrukcja dodania zawodników z przykładowych statystyk

## Zawodnicy do dodania:

1. **KAMIL** - username: `kamil`
2. **NOWAK** - username: `nowak`
3. **MARCIN** - username: `marcin`
4. **LIS** - username: `lis`
5. **LEWANDOWSKA** - username: `lewandowska`
6. **KOZŁOWSKI** - username: `kozlowski`
7. **ZAMACH** - username: `zamach`

## Metoda 1: Przez aplikację (zalecane)

1. Przejdź na stronę `/signup` w aplikacji
2. Dla każdego zawodnika wypełnij formularz:
   - **Nazwa użytkownika**: odpowiedni username (np. `kamil`)
   - **Imię i nazwisko**: odpowiednie imię (np. `Kamil`)
   - **Hasło**: wybierz hasło (np. `HASLO_STARTOWE` dla wszystkich)
   - **Email**: pozostaw puste (zostanie wygenerowany automatycznie)
   - **Numer telefonu**: opcjonalne
   - **Numer legitymacji ligowej**: opcjonalne
3. Kliknij "Zarejestruj się"
4. Powtórz dla każdego zawodnika

## Metoda 2: Przez Supabase Dashboard

1. Przejdź do Supabase Dashboard → **Authentication** → **Users**
2. Kliknij **"Add user"** lub **"Invite user"**
3. Dla każdego zawodnika:
   - **Email**: `username@witamed.local` (np. `kamil@witamed.local`)
   - **Password**: wybierz hasło (np. `HASLO_STARTOWE`)
   - **Auto Confirm User**: ✅ (zaznacz, aby nie wymagać weryfikacji)
4. Po utworzeniu użytkownika, dodaj profil w tabeli `profiles`:
   ```sql
   INSERT INTO profiles (id, username, full_name, role)
   VALUES (
     'USER_ID_Z_SUPABASE',  -- skopiuj ID z Authentication → Users
     'kamil',
     'Kamil',
     'player'
   );
   ```

## Metoda 3: Masowe dodanie przez SQL (wymaga uprawnień)

Jeśli masz dostęp do service_role key, możesz użyć API lub funkcji Supabase.

## Po dodaniu zawodników:

1. Uruchom skrypt `add_players.sql` w Supabase SQL Editor, aby sprawdzić czy zawodnicy istnieją
2. Jeśli wszystko jest OK, możesz dodać statystyki dla meczu używając panelu admina

## Uwaga:

- Upewnij się, że username są unikalne
- Hasła powinny mieć minimum 6 znaków
- Po utworzeniu zawodników, możesz zaktualizować ich `full_name` używając skryptu SQL

