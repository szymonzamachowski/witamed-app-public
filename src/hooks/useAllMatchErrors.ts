import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { MatchErrors } from '../types/database'
import { sumMatchErrors } from '../stats/aggregate'

export function useAllMatchErrors() {
  return useQuery({
    queryKey: ['all-match-errors'],
    queryFn: async () => {
      const { data: matches, error } = await supabase
        .from('matches')
        .select('match_errors')
        .not('match_errors', 'is', null)

      if (error) {
        console.error('Błąd przy pobieraniu błędów meczu:', error)
        throw error
      }

      // Zsumuj wszystkie błędy ze wszystkich meczy
      return sumMatchErrors((matches ?? []).map(match => match.match_errors as MatchErrors | null))
    },
    staleTime: 1000 * 60 * 5, // 5 minut
  })
}
