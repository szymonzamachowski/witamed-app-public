# Witamed App - Aplikacja Zarządzania Drużyną Siatkarską

Aplikacja webowa do zarządzania drużyną siatkarską, umożliwiająca komunikację między zawodnikami, trenerem i menedżerem. System wspiera organizację treningów, meczów ligowych, sparingów oraz śledzenie statystyk i obecności zawodników.

## 🎯 Główne funkcjonalności

### Dla wszystkich użytkowników

- **Strona główna** - Wyświetla najbliższe ważne wydarzenie oraz aktualności drużyny
- **Terminarz** - Kalendarz z wszystkimi wydarzeniami (mecze ligowe, sparingi, treningi)
- **Mecze** - Lista wszystkich rozegranych meczów ligowych z możliwością obejrzenia wideo i statystyk
- **Statystyki** - Agregowane statystyki wszystkich zawodników ze wszystkich meczów z możliwością sortowania
- **Obecność** - System zaznaczania obecności na wydarzeniach (treningi, sparingi, mecze ligowe) z możliwością oznaczenia jako "obecny" lub "nieobecny"

### Dla zalogowanych zawodników

- **Moje konto** - Profil zawodnika z:
  - Statystykami osobistymi (punkty, rozegrane mecze, bloki)
  - Szczegółowymi statystykami (zagrywka, przyjęcie, atak)
  - Informacjami kontaktowymi
  - Możliwością zmiany hasła
- **Zarządzanie obecnością** - Zaznaczanie obecności/nieobecności na wydarzeniach
- **Sprawdzanie obecności** - Podgląd listy zawodników zapisanych na wydarzenia (tylko dla zalogowanych użytkowników)

### Dla administratorów

- **Panel administratora** - Kompleksowe zarządzanie aplikacją:
  - **Aktualności** - Dodawanie, edycja i usuwanie aktualności
  - **Mecze** - Zarządzanie meczami ligowymi (dodawanie, edycja, usuwanie)
  - **Statystyki meczu** - Wprowadzanie szczegółowych statystyk zawodników oraz błędów meczu
  - **Wydarzenia** - Zarządzanie treningami i sparingami
  - **Zawodnicy** - Masowe dodawanie zawodników do systemu

## 🛠️ Technologie

- **Frontend:**
  - React 19 + TypeScript
  - Vite (build tool)
  - React Router (routing)
  - TanStack Query (data fetching)
  - CSS Modules

- **Backend:**
  - Supabase (BaaS)
    - PostgreSQL (baza danych)
    - Row Level Security (RLS)
    - Authentication

## 📦 Instalacja i uruchomienie

### Wymagania

- Node.js 18+ 
- npm lub yarn
- Konto Supabase z skonfigurowaną bazą danych

### Kroki instalacji

1. **Sklonuj repozytorium:**
```bash
git clone https://github.com/szymonzamachowski/witamed-app.git
cd witamed-app
```

2. **Zainstaluj zależności:**
```bash
npm install
```

3. **Skonfiguruj zmienne środowiskowe:**
Utwórz plik `.env` w głównym katalogu projektu:
```env
VITE_SUPABASE_URL=twoj_supabase_url
VITE_SUPABASE_ANON_KEY=twoj_supabase_anon_key
```

4. **Skonfiguruj bazę danych:**
   - Uruchom skrypt `supabase/schema.sql` w Supabase SQL Editor
   - Uruchom migracje z folderu `supabase/migrations/` w kolejności chronologicznej

5. **Uruchom aplikację w trybie deweloperskim:**
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`

### Build produkcyjny

```bash
npm run build
```

Zbudowane pliki znajdziesz w folderze `dist/`

## 📁 Struktura projektu

```
witamed-app/
├── src/
│   ├── components/          # Komponenty React
│   │   ├── Admin*.tsx       # Komponenty panelu administratora
│   │   ├── MatchStatsTable.tsx
│   │   ├── NewsList.tsx
│   │   └── NavBar.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts       # Autentykacja
│   │   ├── useMatches.ts    # Mecze
│   │   ├── usePlayerStatistics.ts  # Statystyki zawodników
│   │   └── ...
│   ├── pages/               # Strony aplikacji
│   │   ├── Home.tsx         # Strona główna
│   │   ├── Matches.tsx      # Lista meczów
│   │   ├── Statistics.tsx   # Statystyki ogólne
│   │   ├── Attendance.tsx   # Obecność
│   │   ├── Calendar.tsx     # Terminarz
│   │   ├── MyAccount.tsx    # Profil zawodnika
│   │   └── AdminPanel.tsx   # Panel administratora
│   ├── lib/
│   │   └── supabase.ts      # Konfiguracja Supabase
│   └── types/
│       └── database.ts       # Typy TypeScript dla bazy danych
├── supabase/
│   ├── schema.sql           # Główny schemat bazy danych
│   └── migrations/          # Migracje bazy danych
├── public/                   # Pliki statyczne
└── package.json
```

## 🔐 Autentykacja

Aplikacja używa Supabase Authentication z następującymi funkcjami:
- Rejestracja przez username (email opcjonalny)
- Logowanie przez username lub email
- Opcja "Zapamiętaj mnie" dla trwałej sesji
- Role użytkowników: `player`, `admin`, `coach`

## 📊 Statystyki

System statystyk obejmuje:
- **Zagrywka:** total, błędy, asy, skuteczność
- **Przyjęcie:** total, pozytywne, pozostałe, błędy, skuteczność
- **Atak:** total, punktowe, nieskończone, błędy, zablokowane, skuteczność
- **Blok:** total bloków
- **Punkty:** suma punktowych ataków + asy + bloki

Statystyki są agregowane ze wszystkich meczów ligowych i wyświetlane zarówno w widoku ogólnym, jak i per mecz.

## 🎬 Wideo z meczów

Aplikacja obsługuje wideo z meczów poprzez integrację z YouTube:
- Obsługa pojedynczych wideo
- Obsługa playlist YouTube (automatyczne odtwarzanie kolejnych wideo)

## 📱 Responsywność

Aplikacja jest w pełni responsywna i działa na:
- Desktop
- Tablety
- Telefony komórkowe

## 🚀 Deployment

Aplikacja jest gotowa do wdrożenia na:
- **Vercel** (zalecane) - automatyczne wdrożenia z GitHub
- **Netlify** - konfiguracja w `netlify.toml`
- Inne platformy wspierające Vite

## 📝 Licencja

Projekt prywatny - Wszystkie prawa zastrzeżone

## 👥 Autorzy

- Szymon Zamachowski

---

**Uwaga:** Aplikacja wymaga skonfigurowanej bazy danych Supabase z odpowiednimi tabelami i politykami bezpieczeństwa (RLS). Szczegóły konfiguracji znajdują się w plikach w folderze `supabase/`.
