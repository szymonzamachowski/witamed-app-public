# Wyłączenie weryfikacji emaila w Supabase

Aby wyłączyć wymaganie weryfikacji emaila, wykonaj następujące kroki:

## Krok 1: Wyłącz weryfikację emaila w Supabase Dashboard

1. Przejdź do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz swój projekt
3. Przejdź do **Authentication** → **Settings** (lub **Settings** → **Auth**)
4. Znajdź sekcję **Email Auth**
5. **Wyłącz** opcję **"Enable email confirmations"** lub **"Confirm email"**
6. Zapisz zmiany

## Krok 2: (Opcjonalnie) Wyłącz wymaganie emaila

Jeśli chcesz całkowicie wyłączyć wymaganie emaila:

1. W sekcji **Email Auth** znajdź opcję **"Enable email signup"**
2. Możesz ją pozostawić włączoną (email będzie opcjonalny w aplikacji)
3. Upewnij się, że **"Enable email confirmations"** jest wyłączone

## Alternatywnie: Użyj SQL

Możesz też użyć SQL w Supabase SQL Editor:

```sql
-- Sprawdź obecne ustawienia
SELECT * FROM auth.config;

-- Uwaga: Weryfikacja emaila jest kontrolowana przez ustawienia w Dashboard,
-- nie przez SQL. Musisz użyć Dashboard lub API.
```

## Uwaga

Po wyłączeniu weryfikacji emaila:
- Użytkownicy będą mogli się logować bez weryfikacji emaila
- Email będzie opcjonalny przy rejestracji
- Jeśli nie podasz emaila, zostanie wygenerowany jako `username@witamed.local`

