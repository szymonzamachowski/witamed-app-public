# Instrukcje wdrożenia aplikacji

## 🚀 Opcje hostingu (darmowe)

### 1. **Vercel** (REKOMENDOWANE) ⭐
- **Darmowy tier**: Tak
- **Łatwość**: Bardzo łatwe (automatyczny deploy z GitHub)
- **Limit**: 100GB transferu/miesiąc, nieograniczone projekty
- **URL**: `https://your-app.vercel.app` (lub własna domena)

#### Jak wdrożyć na Vercel:

1. **Zaloguj się do Vercel:**
   - Wejdź na https://vercel.com
   - Zaloguj się przez GitHub

2. **Połącz repozytorium:**
   - Kliknij "New Project"
   - Wybierz repozytorium `witamed-app`
   - Vercel automatycznie wykryje Vite

3. **Skonfiguruj zmienne środowiskowe:**
   - W ustawieniach projektu → "Environment Variables"
   - Dodaj:
     ```
     VITE_SUPABASE_URL=twoj_url_supabase
     VITE_SUPABASE_ANON_KEY=twoj_anon_key
     ```

4. **Deploy:**
   - Kliknij "Deploy"
   - Vercel automatycznie zbuduje i wdroży aplikację
   - Każdy push do `main` automatycznie wdraża nową wersję

---

### 2. **Netlify**
- **Darmowy tier**: Tak
- **Łatwość**: Bardzo łatwe
- **Limit**: 100GB transferu/miesiąc, 300 minut build time/miesiąc

#### Jak wdrożyć na Netlify:

1. **Zaloguj się do Netlify:**
   - Wejdź na https://netlify.com
   - Zaloguj się przez GitHub

2. **Połącz repozytorium:**
   - Kliknij "Add new site" → "Import an existing project"
   - Wybierz repozytorium `witamed-app`

3. **Skonfiguruj build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Netlify automatycznie użyje `netlify.toml`

4. **Dodaj zmienne środowiskowe:**
   - Site settings → "Environment variables"
   - Dodaj:
     ```
     VITE_SUPABASE_URL=twoj_url_supabase
     VITE_SUPABASE_ANON_KEY=twoj_anon_key
     ```

5. **Deploy:**
   - Kliknij "Deploy site"
   - Netlify automatycznie zbuduje i wdroży

---

### 3. **GitHub Pages** (alternatywa)
- **Darmowy tier**: Tak
- **Łatwość**: Średnia (wymaga konfiguracji)
- **Limit**: 1GB storage, 100GB transferu/miesiąc

#### Jak wdrożyć na GitHub Pages:

1. **Zainstaluj GitHub Actions:**
   - Utwórz folder `.github/workflows`
   - Dodaj plik `deploy.yml` (patrz poniżej)

2. **Skonfiguruj zmienne w GitHub:**
   - Settings → Secrets and variables → Actions
   - Dodaj secrets:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **Włącz GitHub Pages:**
   - Settings → Pages
   - Source: GitHub Actions

---

## 📋 Wymagane zmienne środowiskowe

Przed wdrożeniem musisz mieć:
- `VITE_SUPABASE_URL` - URL twojego projektu Supabase
- `VITE_SUPABASE_ANON_KEY` - Anon/public key z Supabase

**Gdzie znaleźć:**
1. Wejdź do Supabase Dashboard
2. Project Settings → API
3. Skopiuj:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`

---

## 🔧 Konfiguracja dla React Router

Aplikacja używa React Router, więc potrzebuje specjalnej konfiguracji routingu dla SPA (Single Page Application). Pliki `vercel.json` i `netlify.toml` już to obsługują - wszystkie ścieżki przekierowują do `index.html`.

---

## ✅ Sprawdzenie po wdrożeniu

Po wdrożeniu sprawdź:
1. ✅ Strona główna się ładuje
2. ✅ Routing działa (przejście między stronami)
3. ✅ Połączenie z Supabase działa (logowanie, dane)
4. ✅ Wszystkie strony są dostępne

---

## 🎯 Rekomendacja

**Użyj Vercel** - jest najłatwiejszy w konfiguracji i ma najlepsze wsparcie dla aplikacji React/Vite. Deploy zajmuje ~2 minuty.

---

## 📝 Notatki

- **Darmowy tier** wystarczy dla testów drużyny
- **Automatyczny deploy** - każdy push do `main` wdraża nową wersję
- **Preview deployments** - każdy PR dostaje własny URL do testów
- **Własna domena** - możesz dodać później (np. `witamed.pl`)

