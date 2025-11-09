# Jak wdrożyć poprawkę timezone na hostingu

## ✅ Zmiany są już na GitHub

Wszystkie poprawki dotyczące timezone zostały zapushowane na GitHub w commitcie:
```
5f25752 Fix timezone handling for dates and times - use Europe/Warsaw timezone
```

## 🚀 Opcje wdrożenia

### Opcja 1: Vercel (jeśli już masz skonfigurowane)

Jeśli masz już projekt na Vercel połączony z GitHub:

1. **Automatyczny deploy** (powinien się uruchomić automatycznie):
   - Vercel automatycznie wykrywa push do `main` i wdraża nową wersję
   - Sprawdź w Vercel Dashboard → Deployments, czy pojawił się nowy deployment

2. **Ręczny redeploy** (jeśli automatyczny nie zadziałał):
   - Wejdź do Vercel Dashboard: https://vercel.com/dashboard
   - Wybierz projekt `witamed-app`
   - Kliknij na ostatni deployment
   - Kliknij "Redeploy" (lub trzy kropki → "Redeploy")
   - Wybierz commit `5f25752` lub "Use existing Build Cache"
   - Kliknij "Redeploy"

3. **Sprawdź status:**
   - Po zakończeniu builda (zwykle 1-2 minuty) aplikacja będzie dostępna z poprawkami

---

### Opcja 2: Netlify (jeśli używasz Netlify)

1. **Automatyczny deploy:**
   - Netlify również automatycznie wykrywa push do `main`
   - Sprawdź w Netlify Dashboard → Deploys

2. **Ręczny redeploy:**
   - Wejdź do Netlify Dashboard: https://app.netlify.com
   - Wybierz projekt
   - Kliknij "Trigger deploy" → "Deploy site"
   - Wybierz branch `main`

---

### Opcja 3: Jeśli jeszcze nie masz hostingu skonfigurowanego

**Vercel (REKOMENDOWANE - najłatwiejsze):**

1. **Zaloguj się:**
   - Wejdź na https://vercel.com
   - Zaloguj się przez GitHub

2. **Dodaj projekt:**
   - Kliknij "Add New..." → "Project"
   - Wybierz repozytorium `szymonzamachowski/witamed-app`
   - Kliknij "Import"

3. **Skonfiguruj zmienne środowiskowe:**
   - W sekcji "Environment Variables" dodaj:
     ```
     VITE_SUPABASE_URL=twoj_url_z_supabase
     VITE_SUPABASE_ANON_KEY=twoj_anon_key_z_supabase
     ```
   - Gdzie znaleźć:
     - Supabase Dashboard → Project Settings → API
     - Project URL → `VITE_SUPABASE_URL`
     - anon public key → `VITE_SUPABASE_ANON_KEY`

4. **Deploy:**
   - Kliknij "Deploy"
   - Vercel automatycznie zbuduje aplikację (1-2 minuty)
   - Po zakończeniu dostaniesz URL (np. `your-app.vercel.app`)

5. **Automatyczne deployy:**
   - Od teraz każdy push do `main` automatycznie wdraża nową wersję
   - Nie musisz nic robić ręcznie!

---

## 🔍 Sprawdzenie czy działa

Po wdrożeniu sprawdź:

1. **Otwórz aplikację na hostingu**
2. **Zaloguj się jako admin**
3. **Dodaj lub edytuj mecz/wydarzenie:**
   - Wprowadź datę i godzinę (np. 15:00)
   - Zapisz
   - Sprawdź czy wyświetla się poprawna godzina (15:00, a nie 16:00 lub 14:00)

4. **Sprawdź wyświetlanie dat:**
   - Przejdź do sekcji "Mecze" lub "Terminarz"
   - Sprawdź czy godziny są poprawne (zgodne z polskim czasem)

---

## ⚠️ Jeśli nadal widzisz problem

1. **Wyczyść cache przeglądarki:**
   - Ctrl+Shift+R (Windows/Linux) lub Cmd+Shift+R (Mac)
   - Lub otwórz w trybie incognito

2. **Sprawdź build logi:**
   - Vercel/Netlify Dashboard → Deployments → Ostatni deployment → Build Logs
   - Sprawdź czy build się powiódł bez błędów

3. **Sprawdź zmienne środowiskowe:**
   - Upewnij się, że `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` są ustawione

4. **Ręczny rebuild:**
   - W Vercel: Settings → General → Clear Build Cache → Redeploy
   - W Netlify: Site settings → Build & deploy → Clear cache and retry deploy

---

## 📝 Notatki

- **Czas wdrożenia:** ~1-2 minuty
- **Automatyczne deployy:** Każdy push do `main` automatycznie wdraża nową wersję
- **Preview deployments:** Każdy PR dostaje własny URL do testów (Vercel)

---

## 🎯 Szybka komenda (jeśli używasz Vercel CLI)

Jeśli masz zainstalowany Vercel CLI:

```bash
vercel --prod
```

To wdroży najnowszą wersję z GitHub na produkcję.

