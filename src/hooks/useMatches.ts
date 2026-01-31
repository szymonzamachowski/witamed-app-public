import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Match } from '../types/database'

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      console.log('🔍 Pobieranie meczów z bazy...')
      console.log('🔍 Supabase client:', supabase)
      
      const { data, error, status, statusText } = await supabase
        .from('matches')
        .select('*')
        .order('date', { ascending: false })

      console.log('📊 Response status:', status, statusText)
      console.log('📊 Response data:', data)
      console.log('📊 Response error:', error)

      if (error) {
        console.error('❌ Błąd przy pobieraniu meczów:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('✅ Pobrano meczów:', data?.length || 0)
      if (data && data.length > 0) {
        console.log('✅ Pierwszy mecz:', data[0])
      } else {
        console.warn('⚠️ Brak meczów w odpowiedzi (data jest pusta lub null)')
      }
      
      return (data || []) as Match[]
    },
    staleTime: 1000 * 60 * 5, // 5 minut
    retry: 1,
  })
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()

      if (error) {
        throw error
      }

      return data as Match
    },
    enabled: !!matchId,
  })
}

