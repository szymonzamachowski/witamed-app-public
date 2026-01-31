/**
 * Skrypt do utworzenia wszystkich zawodników w Supabase
 * Uruchom: node scripts/create-all-players.js
 * 
 * Wymagane zmienne środowiskowe w .env.local:
 * - VITE_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (klucz service_role z Supabase Dashboard → Settings → API)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Wczytaj zmienne środowiskowe z .env.local lub .env
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let envVars = {}
// Najpierw spróbuj .env.local, potem .env
const envPaths = [
  join(__dirname, '..', '.env.local'),
  join(__dirname, '..', '.env')
]

for (const envPath of envPaths) {
  try {
    const envFile = readFileSync(envPath, 'utf-8')
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        // Nie nadpisuj wartości, jeśli już istnieją (priorytet dla .env.local)
        if (!envVars[key]) {
          envVars[key] = value
        }
      }
    })
    console.log(`✅ Wczytano zmienne z: ${envPath}`)
    break // Użyj pierwszego znalezionego pliku
  } catch (error) {
    // Kontynuuj do następnego pliku
  }
}

if (Object.keys(envVars).length === 0) {
  console.warn('⚠️  Nie znaleziono pliku .env.local ani .env, używam zmiennych środowiskowych systemowych')
}

const supabaseUrl = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Błąd: Brak SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych')
  console.error('   Dodaj je do pliku .env.local:')
  console.error('   VITE_SUPABASE_URL=twoj_url')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=twoj_service_role_key')
  process.exit(1)
}

// Utwórz klienta z uprawnieniami service_role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Lista zawodników
const PLAYERS = [
  { username: 'nowak', fullName: 'Nowak Maciej', leagueLicense: '9000000009', isAdmin: false },
  { username: 'kozlowski', fullName: 'Kozłowski Maciej', leagueLicense: '9000000002', isAdmin: false },
  { username: 'jankowski', fullName: 'Jankowski Michał', leagueLicense: '9000000013', isAdmin: false },
  { username: 'lewandowska', fullName: 'Lewandowski Mateusz', leagueLicense: '9000000011', isAdmin: false },
  { username: 'wozniak', fullName: 'Woźniak Piotr', leagueLicense: '9000000004', isAdmin: false },
  { username: 'szymanska', fullName: 'Szymański Jakub', leagueLicense: '9000000014', isAdmin: false },
  { username: 'kaminski', fullName: 'Kamiński Michał', leagueLicense: '9000000007', isAdmin: false },
  { username: 'dabrowski', fullName: 'Dąbrowski Mateusz', leagueLicense: '9000000010', isAdmin: false },
  { username: 'zielinski', fullName: 'Zieliński Marcin', leagueLicense: '9000000005', isAdmin: false },
  { username: 'kowalczyk', fullName: 'Kowalczyk Łukasz', leagueLicense: '9000000006', isAdmin: false },
  { username: 'wojcik', fullName: 'Wójcik Weronika', leagueLicense: '9000000015', isAdmin: false },
  { username: 'zamachowski', fullName: 'Zamachowski Szymon', leagueLicense: '9000000012', isAdmin: true },
]

const PASSWORD = 'HASLO_STARTOWE'

async function createPlayer(player) {
  const email = `${player.username}@witamed.local`
  
  try {
    // Utwórz użytkownika w auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: {
        username: player.username,
        full_name: player.fullName,
        role: player.isAdmin ? 'admin' : 'player'
      }
    })

    if (authError) {
      // Sprawdź czy użytkownik już istnieje
      if (authError.message.includes('already registered') || 
          authError.message.includes('already exists') ||
          authError.message.includes('email address has already been registered')) {
        console.log(`⚠️  ${player.username}: użytkownik już istnieje, aktualizuję profil...`)
        
        // Pobierz istniejącego użytkownika
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
        
        if (listError) {
          console.error(`❌ ${player.username}: błąd przy pobieraniu listy użytkowników:`, listError.message)
          return false
        }
        
        const existingUser = existingUsers?.users?.find(u => u.email === email)
        
        if (existingUser) {
          // Zaktualizuj profil
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: existingUser.id,
              username: player.username,
              full_name: player.fullName,
              league_license_number: player.leagueLicense,
              role: player.isAdmin ? 'admin' : 'player'
            }, {
              onConflict: 'id'
            })

          if (profileError) {
            console.error(`❌ ${player.username}: błąd przy aktualizacji profilu:`, profileError.message)
            return false
          }
          
          console.log(`✅ ${player.username}: profil zaktualizowany`)
          return true
        } else {
          console.error(`❌ ${player.username}: użytkownik istnieje, ale nie znaleziono go na liście`)
          return false
        }
      }
      
      console.error(`❌ ${player.username}: błąd przy tworzeniu użytkownika:`, authError.message)
      return false
    }

    if (!authData?.user) {
      console.error(`❌ ${player.username}: brak danych użytkownika`)
      return false
    }

    // Utwórz profil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: player.username,
        full_name: player.fullName,
        league_license_number: player.leagueLicense,
        role: player.isAdmin ? 'admin' : 'player'
      })

    if (profileError) {
      console.error(`❌ ${player.username}: błąd przy tworzeniu profilu:`, profileError.message)
      return false
    }

    console.log(`✅ ${player.username}: utworzono pomyślnie`)
    return true
  } catch (error) {
    console.error(`❌ ${player.username}: nieoczekiwany błąd:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Rozpoczynam tworzenie zawodników...\n')
  console.log(`📋 Liczba zawodników: ${PLAYERS.length}`)
  console.log(`🔑 Hasło dla wszystkich: ${PASSWORD}\n`)

  const results = {
    success: [],
    failed: []
  }

  for (const player of PLAYERS) {
    const success = await createPlayer(player)
    if (success) {
      results.success.push(player.username)
    } else {
      results.failed.push(player.username)
    }
    
    // Krótka przerwa między żądaniami
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 PODSUMOWANIE:')
  console.log('='.repeat(50))
  console.log(`✅ Utworzono/zaktualizowano: ${results.success.length}`)
  if (results.success.length > 0) {
    console.log(`   ${results.success.join(', ')}`)
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Błędy: ${results.failed.length}`)
    console.log(`   ${results.failed.join(', ')}`)
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Zakończono!')
  console.log('='.repeat(50))
}

main().catch(console.error)

