# Witamed — redesign wyglądu (kierunek „Boisko”) + motyw jasny/ciemny

Data: 2026-10-12 · Status: do akceptacji

## Po co

Witamed to aplikacja drużyny siatkarskiej (React 19 + Vite + TS, Supabase, zwykłe pliki CSS per strona). Zawodnicy wchodzą **prawie wyłącznie z telefonu**, żeby:

1. zobaczyć najbliższe wydarzenie (trening / sparing / mecz) i zaznaczyć obecność,
2. po meczu zobaczyć wynik, wideo i statystyki.

Panel admina (wpisywanie statystyk meczu) obsługuje 3 adminów, głównie z komputera.

Obecny wygląd jest niespójny (każda strona ma własne kolory i style, „szklane” efekty, slogan i zdjęcie na głównej) i nie ma jasnego motywu. Cel: spójny, ładny, sportowy wygląd w barwach logo, wygodny na telefonie, z przełącznikiem jasny/ciemny.

## Cele

- Jeden spójny system wyglądu w kierunku **A „Boisko”** (zatwierdzony na makiecie): sportowy, mocny, barwy logo.
- **Motyw ciemny i jasny**, przełączany jednym przyciskiem ☀/☾ w górnym pasku.
- **Mobile-first** dla wszystkich stron zawodników; panel admina projektowany pod komputer (ale ma nie być zepsuty na telefonie).
- Przerobienie **każdej strony po kolei** (kolejność niżej), tak żeby użytkownik mógł zweryfikować każdą na podglądzie przed przejściem dalej.

## Nie-cele

- Brak zmian w bazie danych, logice zapisu, uprawnieniach, routingu (adresy URL zostają).
- Brak nowych bibliotek UI (bez Tailwinda, MUI itp.) — zostajemy przy zwykłym CSS.
- Brak zmiany treści merytorycznej (kolumny statystyk, sposób liczenia itp.).

## Anty-cele (porażka, nawet jeśli „działa”)

- **Utrata jakiejkolwiek istniejącej funkcji.** Decyzja użytkownika: *wszystkie obecne funkcjonalności muszą zostać zachowane*. Lista do sprawdzenia — sekcja „Inwentarz funkcji”.
- Motyw jasny, w którym coś jest nieczytelne (np. biały tekst na jasnym tle, bo był wpisany na sztywno).
- Na telefonie: rzeczy wychodzące poza ekran w poziomie (poza celowo przewijanymi tabelami statystyk), przyciski za małe pod palec.

## Decyzje użytkownika

1. **Kierunek A „Boisko”**: granatowe tło w ciemnym, jasnoszare w jasnym; **zielony z logo = kolor akcji**; wysokie, kondensowane nagłówki WIELKIMI LITERAMI w stylu tablicy wyników; duże cyfry wyników.
2. **Strona główna**: usunąć slogan „Jedziemy kruca fiks! Fajer!” i zdjęcie zawodnika (`/photos/hero.png`). Strona zaczyna się od najbliższego wydarzenia.
3. **Szybka obecność na głównej**: karta najbliższego wydarzenia ma przyciski **„Będę” / „Nie będę”**. Kliknięcie **zapisuje obecność i przekierowuje do strony Obecność** (z właściwą zakładką), gdzie widać szczegóły — kto się zapisał, kto nie.
4. **Nawigacja**:
   - telefon: **dolny pasek z 5 pozycjami**: Główna, Obecność, Mecze, Statystyki, Terminarz (ikona + podpis);
   - górny pasek (telefon i komputer): logo + „Witamed” po lewej; po prawej **przełącznik motywu** i **ikonka profilu** → niezalogowany: Logowanie; zalogowany: Moje konto; admin: dodatkowo Panel Admina (np. małe menu po kliknięciu ikonki);
   - komputer: linki stron w górnym pasku (jak teraz), bez dolnego paska.
5. Wszystkie obecne funkcje zostają.

## Decyzje moje (do sprawdzenia przez użytkownika)

- **Paleta** (z logo: zielony `#6DB22A`, niebieski `#23609C`, żółty `#E3B23C`):
  - ciemny: tło `#0B1622`, karta `#13243A`, tekst `#E8EEF4`, tekst drugorzędny `#8CA0B5`, akcent etykiet `#7FC241`;
  - jasny: tło `#F2F5F8`, karta `#FFFFFF` z delikatnym cieniem, tekst `#0B1622`, drugorzędny `#5B6B7C`, akcent etykiet `#4E8A1A`, aktywna zakładka `#23609C`;
  - przycisk główny: zielony `#6DB22A` z ciemnym tekstem; drugorzędny: neutralny (ciemny/jasny szary);
  - żółty tylko jako rzadki akcent (np. wyróżnienie najlepszego wyniku w statystykach); czerwony tylko dla błędów / „Nie będę” w stanie zaznaczonym / porażki.
  - Wartości można korygować pod kontrast (cel: WCAG AA dla tekstu).
- **Fonty**: nagłówki **Barlow Condensed** (600–800, uppercase), tekst **Inter** (400–700) — z Google Fonts.
- **Motyw domyślny** przy pierwszej wizycie: zgodny z ustawieniem telefonu (`prefers-color-scheme`); wybór zapamiętywany w `localStorage`; ustawiany przed renderem (skrypt w `index.html`), żeby nie było mignięcia złego motywu.
- **Karta „Ostatni mecz” na głównej** (wynik + przeciwnik, link do szczegółów meczu) — była na wybranej makiecie, to nowy mały element tylko do odczytu.
- **Aktualności** zostają na głównej pod kartami (bez przycisku „Aktualności poniżej ↓” — przy krótszej stronie nie jest potrzebny).
- Przycisk „Zobacz terminarz” z obecnej karty wydarzenia zostaje jako drugorzędny link.
- Na stronie Obecność, gdy przyjdzie się z przekierowania, wydarzenie, na które kliknięto, ma być widoczne (właściwa zakładka; mile widziane przewinięcie do niego).

## Jak to zbudować (decyzje techniczne)

- **Tokeny w CSS**: w `src/index.css` zestaw zmiennych (`--bg`, `--surface`, `--text`, `--text-muted`, `--primary`, `--primary-contrast`, `--accent`, `--border`, `--danger`, `--success`, promienie, cienie, odstępy, fonty) zdefiniowany dla `:root[data-theme="dark"]` i `:root[data-theme="light"]`.
- Wszystkie pliki CSS stron/komponentów przechodzą na te tokeny; usuwamy kolory wpisane na sztywno, także w **stylach inline w TSX** (np. `style={{ color: '#fff' }}`, `rgba(255,255,255,…)` w `MyAccount.tsx`, `Home.tsx`, `EventCard.tsx` i innych) — inaczej jasny motyw będzie nieczytelny.
- Przełącznik: mały hook/komponent ustawiający `data-theme` na `<html>` + `localStorage`.
- Ikony: `@heroicons/react` (już jest w zależnościach).
- Bez zmian w hookach danych i zapytaniach Supabase, poza tym co konieczne dla szybkiej obecności na głównej (użyć istniejącej mutacji ustawiania obecności z `useAttendance`/`useMatchAttendance`).
- Niezalogowany klika „Będę” na głównej → przekierowanie do logowania z parametrem powrotu; po zalogowaniu wraca na Obecność z właściwą zakładką i zaznacza tam sam (bez automatycznego zapisu). Wymaga małej zmiany w `Login.tsx` (obsługa `?redirect=`, tylko ścieżki wewnętrzne). *(moja decyzja)*
- Jeśli zawodnik już odpowiedział: na karcie na głównej zaznaczony jest wybrany przycisk; kliknięcie dowolnego **ustawia** status (funkcje `useSet*AttendanceStatus`, nie toggle) i przekierowuje do Obecności. Status czytany przez `useUserAttendance` / `useUserMatchAttendance`. *(moja decyzja)*
- Podgląd do weryfikacji = lokalny serwer deweloperski (`npm run dev`, http://localhost:5173).
- Praca lokalnie na `main`, commit po każdej zatwierdzonej stronie, **bez pushowania** — push dopiero na wyraźne polecenie użytkownika (main = produkcja). Zmiany przed redesignem są w osobnym commicie.

## Kolejność prac (strona po stronie, z weryfikacją użytkownika po każdej)

0. Fundament: tokeny, fonty, motyw + przełącznik, nowa nawigacja (górny pasek + dolny pasek na telefonie).
1. Główna
2. Obecność (z modalami listy obecności)
3. Mecze + Szczegóły meczu (wideo, tabela statystyk meczu, tabele błędów)
4. Statystyki
5. Terminarz
6. Logowanie
7. Moje konto
8. Panel admina (wszystkie sekcje)

## Inwentarz funkcji (nic z tego nie może zniknąć)

- **Nawigacja**: wszystkie strony dostępne; link do Panelu Admina tylko dla adminów; Logowanie / Moje konto zależnie od stanu.
- **Główna**: najbliższe wydarzenie (najbliższe przyszłe z events + przyszłe mecze bez wyniku, z miejscem, datą w strefie Europe/Warsaw, opisem, przeciwnikiem dla meczu); link do terminarza; lista aktualności (ładowanie / błąd / pusto).
- **Obecność**: zakładki Treningi / Sparingi / Mecze ligowe (z parametrem `?tab=`); przyszłe wydarzenia w każdej; zaznaczanie „obecny / nieobecny”; liczniki; info „musisz być zalogowany”; modal „Lista obecności” z listą zapisanych i niezapisanych; **admin może zmieniać status innych zawodników** w modalu (obecny / nieobecny / usuń).
- **Mecze**: lista rozegranych meczów (przeciwnik, wynik z setami, data, miejsce, znacznik wideo), klik → szczegóły.
- **Szczegóły meczu**: powrót do listy; nagłówek z wynikiem; wideo YouTube (pojedyncze i playlisty, link awaryjny); tabela statystyk meczu; tabele błędów (przeciwnika, wybloki, własne); komunikat gdy brak statystyk.
- **Statystyki**: wyszukiwarka zawodnika; tabela z grupami kolumn (Zagrywka, Przyjęcie, Atak, Blok, punkty itd.), sortowanie po każdej kolumnie; wiersz RAZEM; podsumowanie błędów (przeciwnika / wybloki / własne). Na telefonie tabela przewijana w poziomie z przyklejoną kolumną zawodnika.
- **Terminarz**: widok miesiąca, poprzedni / następny / dziś; wydarzenia i mecze w dniach; klik dnia → okno ze szczegółami i przejściem do obecności (`/attendance?tab=…`).
- **Logowanie**: login (nazwisko), hasło, „Zapamiętaj mnie”, komunikaty błędów.
- **Moje konto**: wyloguj; informacje osobiste (imię i nazwisko, ksywka, telefon, nr legitymacji); edycja ksywki i telefonu; zmiana hasła; statystyki osobiste zawodnika (podsumowanie + szczegóły zagrywka/przyjęcie/atak).
- **Panel admina**: Aktualności (dodaj / edytuj / usuń), Wydarzenia (treningi, sparingi — dodaj / edytuj / usuń), Mecze ligowe (dodaj / edytuj / usuń, wynik, wideo), Statystyki meczu (wybór meczu, tabela wprowadzania statystyk zawodników, błędy meczu), Lista zawodników.

## Zostawione wykonawcy

- Dokładne odstępy, rozmiary, promienie, animacje przejść (subtelne).
- Ikony konkretnych pozycji w dolnym pasku.
- Układ panelu admina w obrębie stylu (np. zakładki/sekcje), o ile wszystkie funkcje zostają.
- Puste stany (np. „Brak meczów w tym sezonie”) — krótkie, po ludzku; usunąć techniczne komunikaty typu „Upewnij się, że uruchomiłeś skrypt SQL…”.

## Weryfikacja

- Po każdej stronie: `npx tsc -b`, przeklikanie na podglądzie w obu motywach, szerokość 375 px i 1440 px, brak błędów w konsoli; zrzuty dla użytkownika.
- Na koniec: przejście całego inwentarza funkcji.
