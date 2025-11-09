import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { MatchStatistics, Profile } from '../types/database'

export type MatchStatisticsWithPlayer = MatchStatistics & {
  profiles: {
    id: string
    username: string | null
    full_name: string | null
    phone_number: string | null
    league_license_number: string | null
    role: 'player' | 'admin' | 'coach'
    created_at: string
  } | null
}

export function useMatchStatistics(matchId: string) {
  return useQuery({
    queryKey: ['match-statistics', matchId],
    queryFn: async () => {
      console.log('🔍 Pobieranie statystyk dla meczu:', matchId)
      const { data, error } = await supabase
        .from('match_statistics')
        .select('*, profiles(*)')
        .eq('match_id', matchId)

      console.log('📊 Statystyki response:', { data, error })

      if (error) {
        console.error('❌ Błąd przy pobieraniu statystyk:', error)
        throw error
      }

      console.log('✅ Pobrano statystyk:', data?.length || 0, data)
      return data as MatchStatisticsWithPlayer[]
    },
    enabled: !!matchId,
  })
}

