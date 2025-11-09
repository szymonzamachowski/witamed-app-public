# 🔧 Naprawa problemu z czasem na Vercel

## ✅ Krok 1: Sprawdź czy deployment się udał

1. **Wejdź do Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Zaloguj się

2. **Znajdź projekt `witamed-app`**

3. **Sprawdź zakładkę "Deployments":**
   - Czy widzisz deployment z commitem `5f25752`?
   - Jaki jest status? (Ready / Building / Error)

4. **Jeśli jest błąd:**
   - Kliknij na deployment z błędem
   - Sprawdź "Build Logs"
   - Skopiuj błędy i sprawdź co poszło nie tak

---

## 🔄 Krok 2: Ręczny Redeploy

Jeśli deployment się nie uruchomił automatycznie lub jest błąd:

### Metoda 1: Przez Dashboard Vercel

1. **Wejdź do projektu:**
   - Vercel Dashboard → `witamed-app`

2. **Otwórz zakładkę "Deployments"**

3. **Znajdź ostatni udany deployment** (zielony checkmark)

4. **Kliknij trzy kropki (⋯) przy deployment**

5. **Wybierz "Redeploy"**

6. **W oknie dialogowym:**
   - Możesz zostawić "Use existing Build Cache" zaznaczone
   - LUB odznacz, żeby zbudować od nowa (jeśli były problemy)
   - Kliknij "Redeploy"

7. **Poczekaj 1-2 minuty** na zakończenie builda

### Metoda 2: Przez Vercel CLI (jeśli masz zainstalowane)

```bash
# Zainstaluj Vercel CLI (jeśli nie masz)
npm i -g vercel

# Zaloguj się
vercel login

# Wdróż na produkcję
vercel --prod
```

### Metoda 3: Wymuś nowy deployment przez pusty commit

```bash
# W terminalu (w katalogu projektu)
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main
```

To wyśle pusty commit, który wymusi nowy deployment na Vercel.

---

## 🧹 Krok 3: Wyczyść cache

Jeśli deployment się udał, ale nadal widzisz stary kod:

### W Vercel:

1. **Settings → General**
2. **Scrolluj w dół do "Build & Development Settings"**
3. **Kliknij "Clear Build Cache"**
4. **Kliknij "Redeploy"**

### W przeglądarce:

1. **Hard refresh:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Lub wyczyść cache:**
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Firefox: Settings → Privacy → Clear Data → Cached Web Content

3. **Lub otwórz w trybie incognito/private**

---

## 🔍 Krok 4: Sprawdź czy kod jest poprawny

Sprawdź czy w build logach nie ma błędów:

1. **Vercel Dashboard → Projekt → Deployments**
2. **Kliknij na ostatni deployment**
3. **Sprawdź "Build Logs"**
4. **Szukaj błędów typu:**
   - `Module not found`
   - `TypeScript errors`
   - `Build failed`

---

## 🐛 Krok 5: Sprawdź zmienne środowiskowe

Upewnij się, że masz ustawione:

1. **Vercel Dashboard → Projekt → Settings → Environment Variables**
2. **Sprawdź czy są:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Jeśli nie ma - dodaj je:**
   - Z Supabase Dashboard → Project Settings → API
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`

---

## ✅ Krok 6: Weryfikacja

Po redeploy sprawdź:

1. **Otwórz aplikację na hostingu**
2. **Hard refresh (Ctrl+Shift+R)**
3. **Zaloguj się jako admin**
4. **Dodaj/edytuj mecz:**
   - Wprowadź godzinę np. `15:00`
   - Zapisz
   - Sprawdź czy wyświetla się `15:00` (nie `16:00` lub `14:00`)

---

## 🆘 Jeśli nadal nie działa

1. **Sprawdź build logs** - czy są błędy kompilacji?
2. **Sprawdź console w przeglądarce** (F12) - czy są błędy JavaScript?
3. **Sprawdź Network tab** - czy pliki JS się ładują?
4. **Sprawdź czy commit `5f25752` jest w deployment** - czy Vercel widzi najnowszy kod?

---

## 📝 Szybka komenda do wymuszenia deploymentu

Jeśli chcesz szybko wymusić nowy deployment:

```bash
git commit --allow-empty -m "Force Vercel redeploy for timezone fix"
git push origin main
```

To wyśle pusty commit, który wymusi nowy deployment.

