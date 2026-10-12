import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Tworzenie klienta z fallback wartościami, aby aplikacja nie crashowała
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

/**
 * Testuje połączenie z bazą danych Supabase
 * @returns Promise z wynikiem testu połączenia
 */
export async function testConnection() {
  console.log('🔍 Testowanie połączenia z bazą danych...')
  console.log('URL:', supabaseUrl ? '✅ Ustawiony' : '❌ Brak')
  console.log('Key:', supabaseAnonKey ? '✅ Ustawiony' : '❌ Brak')

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      success: false,
      error: 'Brak zmiennych środowiskowych VITE_SUPABASE_URL lub VITE_SUPABASE_ANON_KEY',
      details: {
        url: supabaseUrl,
        key: supabaseAnonKey ? '***' : null
      }
    }
  }

  try {
    // Test 1: Sprawdzenie sesji auth
    console.log('📋 Test 1: Sprawdzanie sesji...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.warn('⚠️ Błąd sesji:', sessionError.message)
    } else {
      console.log('✅ Sesja:', sessionData.session ? 'Zalogowany' : 'Niezalogowany')
    }

    // Test 2: Proste zapytanie do bazy (np. profiles)
    console.log('📋 Test 2: Test zapytania do tabeli profiles...')
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (profilesError) {
      console.error('❌ Błąd zapytania:', profilesError.message)
      return {
        success: false,
        error: profilesError.message,
        details: {
          code: profilesError.code,
          hint: profilesError.hint,
          details: profilesError.details
        }
      }
    }

    console.log('✅ Zapytanie wykonane pomyślnie')

    // Test 3: Sprawdzenie innych tabel
    console.log('📋 Test 3: Sprawdzanie dostępności tabel...')
    const tables = ['matches', 'events', 'news']
    const tableResults: Record<string, boolean> = {}

    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1)
      tableResults[table] = !error
      if (error) {
        console.warn(`⚠️ Tabela ${table}:`, error.message)
      } else {
        console.log(`✅ Tabela ${table}: dostępna`)
      }
    }

    const result = {
      success: true,
      message: 'Połączenie z bazą działa poprawnie!',
      details: {
        session: sessionData.session ? 'Zalogowany' : 'Niezalogowany',
        tables: tableResults
      }
    }

    console.log('✅ Wszystkie testy zakończone pomyślnie!')
    return result

  } catch (error) {
    console.error('❌ Błąd podczas testowania:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nieznany błąd',
      details: error
    }
  }
}

/**
 * Dodaje testowego newsa do bazy danych
 * @param title - Tytuł newsa (opcjonalny, domyślnie "Testowy news")
 * @param content - Treść newsa (opcjonalny, domyślnie przykładowa treść)
 * @returns Promise z wynikiem operacji
 */
export async function addTestNews(title?: string, content?: string) {
  console.log('📰 Dodawanie testowego newsa...')

  const newsTitle = title || 'Testowy news'
  const newsContent = content || 'To jest testowy news dodany z konsoli przeglądarki. Jeśli widzisz ten tekst, oznacza to, że połączenie z bazą działa poprawnie! 🎉'

  try {
    // Użyj zalogowanego użytkownika
    console.log('🔍 Sprawdzanie zalogowanego użytkownika...')
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Musisz być zalogowany, aby dodać news.',
        hint: 'Zaloguj się najpierw.'
      }
    }

    const authorId = session.user.id
    console.log('✅ Używam ID zalogowanego użytkownika:', authorId)

    // Sprawdź czy użytkownik ma profil i czy jest adminem/coachem
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', authorId)
      .single()

    if (profileError || !profile) {
      return {
        success: false,
        error: 'Nie masz profilu. Uruchom makeCurrentUserAdmin() aby utworzyć profil z rolą admina.',
        hint: 'Wykonaj: await makeCurrentUserAdmin()'
      }
    }

    if (profile.role !== 'admin' && profile.role !== 'coach') {
      return {
        success: false,
        error: `Twoja rola to "${profile.role}". Tylko admini i trenerzy mogą dodawać newsy.`,
        hint: 'Uruchom makeCurrentUserAdmin() aby zmienić rolę na admina.'
      }
    }

    console.log(`✅ Profil znaleziony, rola: ${profile.role}`)

    // Dodaj news
    console.log('📝 Dodawanie newsa do bazy...')
    const { data, error } = await supabase
      .from('news')
      .insert({
        title: newsTitle,
        content: newsContent,
        author_id: authorId
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Błąd przy dodawaniu newsa:', error.message)
      return {
        success: false,
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint,
          details: error.details
        }
      }
    }

    console.log('✅ News dodany pomyślnie!', data)
    return {
      success: true,
      message: 'Testowy news został dodany do bazy danych!',
      data: data
    }

  } catch (error) {
    console.error('❌ Błąd podczas dodawania newsa:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nieznany błąd',
      details: error
    }
  }
}

/**
 * Pobiera wszystkie newsy z bazy danych
 * @returns Promise z listą newsów
 */
export async function getAllNews() {
  console.log('📰 Pobieranie wszystkich newsów...')

  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Błąd przy pobieraniu newsów:', error.message)
      return {
        success: false,
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint
        }
      }
    }

    console.log(`✅ Znaleziono ${data?.length || 0} newsów`)
    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    }

  } catch (error) {
    console.error('❌ Błąd podczas pobierania newsów:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nieznany błąd',
      details: error
    }
  }
}

/**
 * Loguje użytkownika (dostępne z konsoli)
 * @param email - Email użytkownika
 * @param password - Hasło
 * @returns Promise z wynikiem logowania
 */
export async function quickLogin(email: string, password: string) {
  console.log('🔐 Logowanie użytkownika...')
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('❌ Błąd logowania:', error.message)
      return {
        success: false,
        error: error.message
      }
    }

    console.log('✅ Zalogowano pomyślnie!', data.user?.email)
    return {
      success: true,
      user: data.user,
      message: 'Zalogowano pomyślnie!'
    }
  } catch (error) {
    console.error('❌ Błąd:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }
  }
}

/**
 * Sprawdza aktualnie zalogowanego użytkownika
 * @returns Promise z informacją o użytkowniku
 */
export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Błąd:', error.message)
      return {
        success: false,
        error: error.message
      }
    }

    if (!session) {
      console.log('ℹ️ Brak zalogowanego użytkownika')
      return {
        success: true,
        loggedIn: false,
        message: 'Brak zalogowanego użytkownika'
      }
    }

    console.log('✅ Zalogowany użytkownik:', session.user.email)
    return {
      success: true,
      loggedIn: true,
      user: session.user,
      email: session.user.email
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }
  }
}

/**
 * Wylogowuje użytkownika
 * @returns Promise z wynikiem wylogowania
 */
export async function quickLogout() {
  console.log('🚪 Wylogowywanie...')
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('❌ Błąd wylogowania:', error.message)
    return {
      success: false,
      error: error.message
    }
  }

  console.log('✅ Wylogowano pomyślnie')
  return {
    success: true,
    message: 'Wylogowano pomyślnie'
  }
}

/**
 * Tworzy profil użytkownika jeśli nie istnieje, a następnie zmienia rolę na admina
 * @returns Promise z wynikiem operacji
 */
export async function makeCurrentUserAdmin() {
  console.log('👑 Zmienianie roli użytkownika na admina...')
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return {
        success: false,
        error: 'Musisz być zalogowany, aby zmienić rolę'
      }
    }

    const userId = session.user.id
    const userEmail = session.user.email || 'user@example.com'
    console.log('📝 Sprawdzanie profilu użytkownika:', userId)

    // Najpierw sprawdź czy profil istnieje
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    let profile

    if (fetchError || !existingProfile) {
      // Profil nie istnieje - utwórz go
      console.log('📝 Profil nie istnieje, tworzenie nowego profilu...')
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: userEmail.split('@')[0],
          full_name: session.user.user_metadata?.full_name || 'Admin User',
          phone_number: '',
          league_license_number: '',
          role: 'admin'
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Błąd przy tworzeniu profilu:', createError.message)
        return {
          success: false,
          error: `Błąd przy tworzeniu profilu: ${createError.message}`,
          details: {
            code: createError.code,
            hint: createError.hint
          }
        }
      }

      profile = newProfile
      console.log('✅ Profil utworzony z rolą admina!', profile)
    } else {
      // Profil istnieje - zaktualizuj rolę
      console.log('📝 Aktualizowanie roli w istniejącym profilu...')
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Błąd przy zmianie roli:', updateError.message)
        return {
          success: false,
          error: updateError.message,
          details: {
            code: updateError.code,
            hint: updateError.hint
          }
        }
      }

      profile = updatedProfile
      console.log('✅ Rola zmieniona na admina!', profile)
    }

    console.log('⚠️ Odśwież stronę, aby zobaczyć zmiany')
    
    return {
      success: true,
      message: 'Rola zmieniona na admina! Odśwież stronę.',
      profile: profile
    }
  } catch (error) {
    console.error('❌ Błąd:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }
  }
}

/**
 * Zmienia rolę użytkownika po emailu (tylko jeśli jesteś adminem)
 * @param email - Email użytkownika
 * @param role - Nowa rola ('player' | 'admin' | 'coach')
 * @returns Promise z wynikiem operacji
 */
export async function changeUserRole(email: string, role: 'player' | 'admin' | 'coach') {
  console.log(`🔄 Zmienianie roli użytkownika ${email} na ${role}...`)
  
  try {
    // Sprawdź czy zalogowany użytkownik to admin
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return {
        success: false,
        error: 'Musisz być zalogowany'
      }
    }

    // Pobierz profil zalogowanego użytkownika
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (currentProfile?.role !== 'admin') {
      return {
        success: false,
        error: 'Tylko administratorzy mogą zmieniać role innych użytkowników'
      }
    }

    // Znajdź użytkownika po emailu
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      // Jeśli nie mamy uprawnień admin, spróbuj przez profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .ilike('username', `%${email.split('@')[0]}%`)
        .limit(5)

      if (!profiles || profiles.length === 0) {
        return {
          success: false,
          error: 'Nie znaleziono użytkownika. Użyj makeCurrentUserAdmin() aby zmienić swoją rolę.'
        }
      }

      console.log('Znaleziono użytkowników:', profiles)
      return {
        success: false,
        error: 'Użyj makeCurrentUserAdmin() aby zmienić swoją rolę, lub zaktualizuj bezpośrednio w bazie danych.'
      }
    }

    const targetUser = users.find(u => u.email === email)
    if (!targetUser) {
      return {
        success: false,
        error: 'Nie znaleziono użytkownika z tym emailem'
      }
    }

    // Zmień rolę
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', targetUser.id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    console.log('✅ Rola zmieniona!', data)
    return {
      success: true,
      message: `Rola użytkownika ${email} zmieniona na ${role}`,
      profile: data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }
  }
}

// Eksportuj funkcje do globalnego obiektu window dla łatwego dostępu z konsoli
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testConnection
  ;(window as any).addTestNews = addTestNews
  ;(window as any).getAllNews = getAllNews
  ;(window as any).quickLogin = quickLogin
  ;(window as any).getCurrentUser = getCurrentUser
  ;(window as any).quickLogout = quickLogout
  ;(window as any).makeCurrentUserAdmin = makeCurrentUserAdmin
  ;(window as any).changeUserRole = changeUserRole
}