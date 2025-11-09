# Instrukcja utworzenia wszystkich zawodników

## Metoda 1: Skrypt Node.js (ZALECANE)

### Krok 1: Pobierz klucz service_role

1. Przejdź do Supabase Dashboard → **Settings** → **API**
2. Znajdź sekcję **Project API keys**
3. Skopiuj klucz **`service_role`** (NIE `anon` key!)
4. ⚠️ **UWAGA**: Ten klucz ma pełne uprawnienia - nie udostępniaj go publicznie!

### Krok 2: Dodaj zmienne środowiskowe

Dodaj do pliku `.env.local` w głównym katalogu projektu:

```env
VITE_SUPABASE_URL=twoj_supabase_url
SUPABASE_SERVICE_ROLE_KEY=twoj_service_role_key
```

### Krok 3: Uruchom skrypt

```bash
node scripts/create-all-players.js
```

Skrypt automatycznie:
- Utworzy wszystkich 13 zawodników
- Ustawi hasło `HASLO_STARTOWE` dla wszystkich
- Utworzy profile z numerami legitymacji
- Nadaje uprawnienia administratora Szymonowi Zamachowskiemu

### Lista zawodników:

1. **nowak** - Nowak Maciej (9000000009)
2. **kozlowski** - Kozłowski Maciej (9000000002)
3. **jankowski** - Jankowski Michał (9000000013)
4. **lewandowska** - Lewandowski Mateusz (9000000011)
5. **wozniak** - Woźniak Piotr (9000000004)
6. **szymanska** - Szymański Jakub (9000000014)
7. **kaminski** - Kamiński Michał (9000000007)
8. **dabrowski** - Dąbrowski Mateusz (9000000010)
9. **zielinski** - Zieliński Marcin (9000000005)
10. **michalski** - Michalski Dominik (9000000001)
11. **kowalczyk** - Kowalczyk Łukasz (9000000006)
12. **wojcik** - Wójcik Weronika (9000000015)
13. **zamachowski** - Zamachowski Szymon (9000000012) - **ADMIN**

### Logowanie:

- **Email**: `username@witamed.local` (np. `nowak@witamed.local`)
- **Hasło**: `HASLO_STARTOWE`

---

## Metoda 2: Panel Administratora w aplikacji

Jeśli masz już konto administratora:

1. Zaloguj się na konto administratora
2. Przejdź do **Panel Administratora** → **Dodaj zawodników**
3. Wprowadź hasło: `HASLO_STARTOWE`
4. Kliknij **"Utwórz wszystkich zawodników"**

---

## Metoda 3: Ręcznie przez aplikację

1. Przejdź na `/signup`
2. Dla każdego zawodnika wypełnij:
   - **Nazwa użytkownika**: odpowiedni username (np. `nowak`)
   - **Imię i nazwisko**: pełne imię i nazwisko (np. `Nowak Maciej`)
   - **Numer legitymacji ligowej**: odpowiedni numer (np. `9000000009`)
   - **Hasło**: `HASLO_STARTOWE`
   - **Email**: pozostaw puste
3. Powtórz dla wszystkich 13 zawodników

---

## Sprawdzenie

Po utworzeniu zawodników, uruchom w Supabase SQL Editor:

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

Powinieneś zobaczyć 13 zawodników z poprawnymi danymi i Szymon Zamachowski z rolą `admin`.

