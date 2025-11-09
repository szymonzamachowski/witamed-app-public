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

  const signIn = useCallback(async (usernameOrEmail: string, password: string, rememberMe: boolean = true) => {
    // Sprawdź czy to email czy username
    let email = usernameOrEmail.trim()
    
    // Jeśli nie zawiera @, to prawdopodobnie username - użyj username@witamed.local
    if (!email.includes('@')) {
      // Sprawdź czy użytkownik istnieje w profilach
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', email)
        .single()
      
      if (profile) {
        // Użyj username@witamed.local (zgodnie z konwencją z rejestracji)
        email = `${email}@witamed.local`
      } else {
        // Jeśli nie znaleziono użytkownika, spróbuj użyć jako email
        email = `${email}@witamed.local`
      }
    }

    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password,
      options: {
        persistSession: rememberMe
      }
    })
    return { error }
  }, [])

  const signUp = useCallback(async (email: string, password: string, userData: Omit<Profile, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: userData,
        emailRedirectTo: undefined // Wyłącz przekierowanie email
      }
    })
    return { data, error }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }, [])

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut
  }
}