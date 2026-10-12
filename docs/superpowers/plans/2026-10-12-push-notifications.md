# Powiadomienia push + poradnik — plan wdrożenia

> Wykonanie: natywnie w tej sesji (superpowers:executing-plans), bez commitów i bez pushowania (polecenie użytkownika).

**Cel:** powiadomienia push PWA (iOS/Android) dla przypomnień o obecności/wydarzeniach i o nowym wideo/statystykach + poradnik instalacji (PDF i strona `/instalacja`).
**Spec:** `docs/superpowers/specs/2026-10-12-push-notifications-design.md`

## Global Constraints
- Produkcja: `https://your-app.vercel.app`; baza = produkcyjna (`<project-ref>`).
- Mecz: tydzień przed. Trening/sparing: dzień przed o 18:00 (Europe/Warsaw) + 3h przed. Wideo/statystyki: automatycznie, statystyki raz na mecz.
- Odbiorcy: przypomnienia „przed” — wszyscy bez „Nie będę” (treść zależna od tego, czy odpowiedzieli); „3h przed” — tylko „Będę”.
- Bez nowych bibliotek UI. `web-push` tylko w funkcji Edge (npm:), nie we froncie.
- Teksty po polsku. Nie pushować.

## Review Focus
- Podwójne wysyłki przy nakładających się uruchomieniach crona → unikalny indeks w `notification_log`, wstawienie przed wysłaniem.
- Funkcja wywołana bez sekretu/tokena → 401.
- Wygasłe subskrypcje (404/410) → usuwane.
- iOS Safari bez instalacji → karta pokazuje instrukcję zamiast przycisku.
- Brak `VITE_VAPID_PUBLIC_KEY` → karta pokazuje „niedostępne”, aplikacja działa dalej.

### Task 1: PWA (ikony, manifest, service worker)
- `scripts/generate-icons.mjs` (jimp) → `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png`, `apple-touch-icon.png` (180).
- `public/site.webmanifest`: nazwa „Witamed”, kolory `#0B1622`, ikony; `index.html`: `<link rel="manifest">`, `apple-touch-icon`, `apple-mobile-web-app-capable`.
- `public/sw.js`: `push` → `showNotification(title,{body,icon,badge,data:{url},tag})`; `notificationclick` → fokus otwartego okna / `openWindow(url)`.
- Rejestracja SW w `src/main.tsx` (tylko gdy `serviceWorker` w `navigator`).
- Weryfikacja: build, `navigator.serviceWorker.getRegistration()` w przeglądarce, manifest bez błędów.

### Task 2: Baza + klucze
- Klucze VAPID (`npx web-push generate-vapid-keys`): publiczny → `.env.local` `VITE_VAPID_PUBLIC_KEY`; prywatny + publiczny + `PUSH_CRON_SECRET` → sekrety funkcji Supabase.
- Migracja `supabase/migrations/20261012_push_notifications.sql`: `push_subscriptions` (unikalny endpoint, RLS własne wiersze), `notification_log` (unikalne `kind, ref_id, player_id`), rozszerzenia `pg_net`, `pg_cron`; triggery: `matches.video_url` null→wartość ⇒ `video`, pierwszy `match_statistics` meczu ⇒ `stats`; cron co 15 min ⇒ `reminders`. Sekret i URL funkcji w `vault`.
- Weryfikacja: tabele i polityki w `pg_policies`, zadanie w `cron.job`.

### Task 3: Funkcja Edge `send-push`
- `supabase/functions/send-push/index.ts` (Deno, `npm:web-push`, `npm:@supabase/supabase-js`), tryby: `reminders`, `video` {match_id}, `stats` {match_id}, `test` (JWT użytkownika, tylko do niego).
- Logika przypomnień wg Global Constraints; okno: wydarzenia, których moment przypomnienia minął w ostatnich 24h, a wydarzenie jeszcze się nie zaczęło; wpis do `notification_log` przed wysyłką (konflikt = pomiń).
- Deploy: `npx supabase functions deploy send-push --no-verify-jwt --project-ref …`.
- Weryfikacja: wywołanie bez sekretu → 401; `reminders` na danych testowych → poprawne wpisy w logu (bez subskrypcji = 0 wysyłek).

### Task 4: Frontend
- `src/hooks/usePushNotifications.ts`: `{ supported, needsInstall, permission, subscribed, subscribe(), unsubscribe(), sendTest() }`.
- `src/components/NotificationsCard.tsx` w Moje konto; `src/components/NotificationsBanner.tsx` na głównej (zalogowani, nie włączone, zamykany — `localStorage`).
- `src/pages/Install.tsx` (`/instalacja`): instrukcje iPhone/Android + „Włącz powiadomienia”.
- Weryfikacja: Chrome desktop lokalnie: Włącz → wiersz w `push_subscriptions` → „Wyślij test” → powiadomienie (sprawdza użytkownik po zalogowaniu).

### Task 5: Poradnik PDF
- `docs/poradnik/poradnik-instalacji.html` → `docs/poradnik/Witamed-poradnik-instalacji.pdf` (A4, 2 strony: iPhone / Android, QR do strony, kroki z ikonami, sekcja powiadomień).
- Weryfikacja: podgląd stron PDF.
