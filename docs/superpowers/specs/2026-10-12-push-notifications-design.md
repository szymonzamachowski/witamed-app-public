# Witamed — powiadomienia push (PWA) + poradnik instalacji

Data: 2026-10-12 · Status: do akceptacji

## Po co

Zawodnicy zapominają zaznaczać obecność i nie wiedzą, kiedy pojawiło się wideo albo statystyki meczu. Chcemy powiadomień na telefonie (iPhone i Android) bez osobnej aplikacji w sklepach.

## Decyzje użytkownika

- Kanał: **powiadomienia push ze strony zainstalowanej na ekranie głównym (PWA)**, iOS + Android.
- **Poradnik PDF** dla obu platform: jak dodać Witamed do ekranu głównego (i włączyć powiadomienia).
- Przypomnienia:
  - **mecz ligowy: tydzień przed**,
  - **trening: dzień przed i 3 godziny przed**.
- **Wideo i statystyki meczu: automatycznie po dodaniu** przez admina.
- Produkcja: https://your-app.vercel.app. Nic nie pushujemy bez polecenia.

## Moje decyzje (do sprawdzenia)

- **Sparingi** traktowane jak treningi (dzień przed + 3h przed).
- **Kto dostaje co:**
  - „dzień przed” / „tydzień przed”: wszyscy, którzy nie zaznaczyli „Nie będę”. Kto jeszcze nie odpowiedział, dostaje treść z prośbą o zaznaczenie obecności („Jutro trening 20:00 — będziesz? Zaznacz obecność”); kto zaznaczył „Będę” — zwykłe przypomnienie.
  - „3h przed”: tylko osoby z „Będę”.
  - wideo / statystyki: wszyscy z włączonymi powiadomieniami.
- **„Dzień przed” = poprzedni dzień o 18:00 czasu polskiego** (nie dokładnie 24h przed).
- **Statystyki: jedno powiadomienie na mecz** (przy pierwszym zapisie), poprawki nie wysyłają kolejnych.
- **Kliknięcie powiadomienia** otwiera właściwą stronę: Obecność (z podświetleniem wydarzenia), szczegóły meczu.
- **Włączanie**: karta „Powiadomienia” w Moje konto (Włącz / Wyłącz / Wyślij test) + jednorazowy, zamykany baner na stronie głównej dla zalogowanych, którzy jeszcze nie włączyli. Na iPhonie bez instalacji baner/karta mówi „najpierw dodaj do ekranu głównego” i linkuje do poradnika.
- **Poradnik**: PDF A4 (2 strony: iPhone, Android) z kodem QR do strony, krokami z rysunkami ikon (Udostępnij / ⋮) i krótką częścią „włącz powiadomienia”. Ten sam poradnik dostępny w aplikacji jako strona `/instalacja`.

## Jak to zbudować

- **PWA**: podpięty `manifest` (nazwa, kolory motywu, ikony 192/512/maskable + `apple-touch-icon` wygenerowane z logo), `service worker` (`public/sw.js`) obsługujący `push` i `notificationclick`.
- **Baza (Supabase)**:
  - `push_subscriptions` (zawodnik, endpoint, klucze) — RLS: każdy widzi i zmienia tylko swoje,
  - `notification_log` (rodzaj, wydarzenie/mecz, zawodnik) — zabezpieczenie przed podwójnym wysłaniem.
- **Wysyłka**: funkcja Supabase Edge `send-push` (biblioteka `web-push`, klucze VAPID):
  - co 15 minut (`pg_cron`) sprawdza, komu należą się przypomnienia,
  - triggery w bazie wywołują ją po dodaniu wideo (`matches.video_url` z pustego na link) i pierwszych statystyk meczu,
  - wywołania z bazy autoryzowane wspólnym sekretem; „Wyślij test” — tokenem zalogowanego użytkownika (tylko do siebie).
- Wygasłe subskrypcje (błąd 404/410) usuwane automatycznie.
- Koszt: 0 zł (darmowe plany Supabase/Vercel).

## Ograniczenia (do komunikacji zawodnikom)

- iPhone: tylko po dodaniu do ekranu głównego, iOS 16.4+.
- Każdy musi sam raz zezwolić na powiadomienia.
- Powiadomienia zadziałają na produkcji dopiero po „push” (wdrożeniu); lokalnie da się przetestować na komputerze (Chrome).

## Weryfikacja

- `tsc`, build, test na komputerze (Chrome): włącz → „Wyślij test” → powiadomienie; symulacja przypomnień na danych testowych.
- Na telefonie po wdrożeniu (użytkownik).
