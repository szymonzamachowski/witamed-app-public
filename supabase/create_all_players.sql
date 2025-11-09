-- SKRYPT DO UTWORZENIA WSZYSTKICH ZAWODNIKÓW
-- Uruchom ten skrypt w Supabase SQL Editor
-- Hasło dla wszystkich: HASLO_STARTOWE

-- ============================================
-- KROK 1: UPEWNIJ SIĘ, ŻE ROZSZERZENIE JEST WŁĄCZONE
-- ============================================
-- W Supabase SQL Editor uruchom najpierw:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- KROK 2: UTWORZENIE UŻYTKOWNIKÓW W AUTH.USERS
-- ============================================

-- Funkcja pomocnicza do tworzenia użytkownika
CREATE OR REPLACE FUNCTION create_player_user(
  p_username TEXT,
  p_full_name TEXT,
  p_league_license TEXT,
  p_password TEXT,
  p_is_admin BOOLEAN DEFAULT FALSE
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  -- Email w formacie username@witamed.local
  v_email := LOWER(p_username) || '@witamed.local';
  
  -- Utwórz użytkownika w auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    v_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'username', p_username,
      'full_name', p_full_name,
      'role', CASE WHEN p_is_admin THEN 'admin' ELSE 'player' END
    ),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO v_user_id;
  
  -- Utwórz profil
  INSERT INTO profiles (
    id,
    username,
    full_name,
    league_license_number,
    role
  ) VALUES (
    v_user_id,
    LOWER(p_username),
    p_full_name,
    p_league_license,
    CASE WHEN p_is_admin THEN 'admin' ELSE 'player' END
  );
  
  RETURN v_user_id;
EXCEPTION
  WHEN unique_violation THEN
    -- Użytkownik już istnieje, zwróć istniejący ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    IF v_user_id IS NOT NULL THEN
      -- Zaktualizuj profil jeśli istnieje
      UPDATE profiles
      SET 
        username = LOWER(p_username),
        full_name = p_full_name,
        league_license_number = p_league_license,
        role = CASE WHEN p_is_admin THEN 'admin' ELSE 'player' END
      WHERE id = v_user_id;
    END IF;
    RETURN v_user_id;
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- KROK 3: UTWORZENIE WSZYSTKICH ZAWODNIKÓW
-- ============================================

-- Włącz rozszerzenie pgcrypto jeśli nie jest włączone
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Wspólne hasło dla wszystkich
DO $$
DECLARE
  v_password TEXT := 'HASLO_STARTOWE';
BEGIN
  -- 1. Nowak Maciej
  PERFORM create_player_user('nowak', 'Nowak Maciej', '9000000009', v_password, FALSE);
  
  -- 2. Kozłowski Maciej
  PERFORM create_player_user('kozlowski', 'Kozłowski Maciej', '9000000002', v_password, FALSE);
  
  -- 3. Jankowski Michał
  PERFORM create_player_user('jankowski', 'Jankowski Michał', '9000000013', v_password, FALSE);
  
  -- 4. Lewandowski Mateusz
  PERFORM create_player_user('lewandowska', 'Lewandowski Mateusz', '9000000011', v_password, FALSE);
  
  -- 5. Woźniak Piotr
  PERFORM create_player_user('wozniak', 'Woźniak Piotr', '9000000004', v_password, FALSE);
  
  -- 6. Szymański Jakub
  PERFORM create_player_user('szymanska', 'Szymański Jakub', '9000000014', v_password, FALSE);
  
  -- 7. Kamiński Michał
  PERFORM create_player_user('kaminski', 'Kamiński Michał', '9000000007', v_password, FALSE);
  
  -- 8. Dąbrowski Mateusz
  PERFORM create_player_user('dabrowski', 'Dąbrowski Mateusz', '9000000010', v_password, FALSE);
  
  -- 9. Zieliński Marcin
  PERFORM create_player_user('zielinski', 'Zieliński Marcin', '9000000005', v_password, FALSE);
  
  -- 10. Michalski Dominik
  PERFORM create_player_user('michalski', 'Michalski Dominik', '9000000001', v_password, FALSE);
  
  -- 11. Kowalczyk Łukasz
  PERFORM create_player_user('kowalczyk', 'Kowalczyk Łukasz', '9000000006', v_password, FALSE);
  
  -- 12. Wójcik Weronika
  PERFORM create_player_user('wojcik', 'Wójcik Weronika', '9000000015', v_password, FALSE);
  
  -- 13. Zamachowski Szymon (ADMIN)
  PERFORM create_player_user('zamachowski', 'Zamachowski Szymon', '9000000012', v_password, TRUE);
END $$;

-- ============================================
-- KROK 4: SPRAWDZENIE WYNIKU
-- ============================================

SELECT 
  p.username,
  p.full_name,
  p.league_license_number,
  p.role,
  u.email,
  u.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.full_name;

-- ============================================
-- USUNIĘCIE FUNKCJI POMOCNICZEJ (OPCJONALNE)
-- ============================================
-- DROP FUNCTION IF EXISTS create_player_user(TEXT, TEXT, TEXT, TEXT, BOOLEAN);

