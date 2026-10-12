# Witamed

Aplikacja drużyny siatkarskiej Witamed: obecność na treningach i meczach, wyniki, wideo, statystyki zawodników i powiadomienia na telefon.

Produkcja: https://your-app.vercel.app (Vercel, wdrożenie z gałęzi `main`).

## Funkcje

- **Główna** — najbliższe wydarzenie z szybkim „Będę / Nie będę”, ostatni mecz, aktualności.
- **Obecność** — treningi, sparingi i mecze ligowe; lista kto będzie / nie będzie (admin może zmieniać statusy).
- **Mecze** — wyniki (wygrana / porażka / remis), wideo z YouTube, statystyki i błędy meczu.
- **Statystyki** — łączne statystyki sezonu; na telefonie zakładki kategorii i panel zawodnika ze strzałkami trendu.
- **Terminarz** — kalendarz miesiąca z listą wydarzeń.
- **Moje konto** — dane, statystyki, zmiana hasła, powiadomienia.
- **Panel admina** — aktualności, wydarzenia, mecze, wpisywanie statystyk, lista zawodników.
- **PWA + powiadomienia push** — instalacja na ekranie głównym (iOS 16.4+ / Android), przypomnienia (mecz: tydzień przed; trening/sparing: dzień przed o 18:00 i 3h przed), info o nowym wideo i statystykach.
- Motyw jasny / ciemny.

## Logowanie

- Loginem jest **nazwisko** zawodnika (bez znaczenia wielkość liter i polskie znaki); konto w Supabase Auth to `nazwisko@witamed.local`.
- Rejestracja jest wyłączona — konta zakłada admin (klucz service role).

## Technologie

React 19 + TypeScript + Vite, React Router, TanStack Query, zwykłe CSS (tokeny motywu w `src/index.css`), Supabase (Postgres + RLS, Auth, Edge Functions, pg_cron, pg_net, Vault).

## Uruchomienie lokalne

```bash
npm install
npm run dev   # http://localhost:5173
```

Plik `.env.local` (nie trafia do repo):

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_VAPID_PUBLIC_KEY=...          # publiczny klucz powiadomień push
# tylko do skryptów/administracji, nigdy we froncie:
SUPABASE_SERVICE_ROLE_KEY=...
VAPID_PRIVATE_KEY=...
PUSH_CRON_SECRET=...
```

Na Vercelu muszą być ustawione `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` i `VITE_VAPID_PUBLIC_KEY`.

## Struktura

```
src/
  pages/            strony (Home, Attendance, Matches, MatchDetail, Statistics, Calendar,
                    Login, MyAccount, AdminPanel, Install) + ich CSS
  components/       komponenty (NavBar, BottomNav, StatsBoard, StatGroupTiles,
                    NotificationsCard/Banner, Admin*)
  hooks/            dane z Supabase (useMatches, useAttendance, usePlayerStatistics,
                    usePushNotifications, useTheme…)
  stats/statConfig.ts  definicja kolumn statystyk — jedno miejsce do zmian
  styles/           wspólne style tabel
  utils/            pomocnicze (wynik meczu, przekierowania, daty, YouTube)
public/             manifest PWA, ikony, service worker (sw.js)
supabase/
  schema.sql, migrations/   schemat i migracje bazy
  functions/send-push/      funkcja wysyłająca powiadomienia
scripts/generate-icons.mjs  generowanie ikon PWA z logo
docs/                       projekty zmian, plany, poradnik PDF
```

## Statystyki — zmiany po konsultacji z trenerem

Kolumny, skróty, wzory procentów i kolory kafelków są w `src/stats/statConfig.ts` (opis na górze pliku). Nowa liczba zbierana w meczu wymaga dodatkowo kolumny w `match_statistics` i pola w formularzu admina.

## Powiadomienia — wdrożenie funkcji

```bash
npx supabase functions deploy send-push --project-ref <ref> --no-verify-jwt --use-api
```

Sekrety funkcji: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PUSH_CRON_SECRET`. W Vault bazy: `push_function_url`, `push_cron_secret` (patrz `supabase/migrations/20261012_push_notifications.sql`).
