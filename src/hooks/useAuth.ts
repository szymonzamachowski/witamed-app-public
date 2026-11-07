import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error getting session:', error)
        setLoading(false)
      })

    // Listen for changes in auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }, [user])

  // Fetch user profile when user changes
  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setProfile(null)
    }
  }, [user, fetchProfile])

  const signIn = useCallback(async (login: string, password: string, _rememberMe: boolean = true) => {
    // Logowanie tylko loginem (nazwiskiem) - konto w auth to login@witamed.local.
    // Normalizujemy: małe litery, bez polskich znaków (np. "Wójcik" -> "wojcik")
    const normalizedLogin = login
      .trim()
      .toLowerCase()
      .replace(/ł/g, 'l')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')

    if (!normalizedLogin || normalizedLogin.includes('@')) {
      return { error: new Error('Podaj login (nazwisko), nie adres email.') }
    }

    const email = `${normalizedLogin}@witamed.local`

    // persistSession jest domyślnie true w Supabase, więc jeśli rememberMe jest false,
    // musimy użyć setSession z null po wylogowaniu lub użyć innego podejścia
    // Dla uproszczenia, zawsze używamy domyślnego zachowania (persistSession = true)
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password
    })
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    try {
      // Najpierw wyloguj z Supabase (może potrzebować danych z localStorage)
      const { error } = await supabase.auth.signOut()
      
      // Wyczyść localStorage i sessionStorage po wylogowaniu
      localStorage.clear()
      sessionStorage.clear()
      
      // Upewnij się, że stan jest zaktualizowany
      setUser(null)
      setProfile(null)
      
      if (error) {
        console.error('Error signing out:', error)
        return { error }
      }
      
      return { error: null }
    } catch (error) {
      console.error('Error signing out:', error)
      // Nawet jeśli wystąpi błąd, wyczyść storage i stan
      localStorage.clear()
      sessionStorage.clear()
      setUser(null)
      setProfile(null)
      return { error: error as Error }
    }
  }, [])

  return {
    user,
    profile,
    loading,
    signIn,
    signOut
  }
}