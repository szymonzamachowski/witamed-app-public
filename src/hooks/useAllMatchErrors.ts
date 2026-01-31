import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { MatchErrors } from '../types/database'

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
      let opponentTotal = 0
      let blocksTotal = 0
      let ownErrorsTotal = 0
      let ownErrorsOtherTotal = 0

      matches?.forEach((match) => {
        const errors = match.match_errors as MatchErrors | null
        if (!errors) return

        // Sumuj błędy przeciwnika
        for (let set = 1; set <= 5; set++) {
          const key = `opponent_errors_set${set}` as keyof MatchErrors
          opponentTotal += ((errors[key] as number) || 0)
        }

        // Sumuj wybloki
        for (let set = 1; set <= 5; set++) {
          const key = `blocks_against_set${set}` as keyof MatchErrors
          blocksTotal += ((errors[key] as number) || 0)
        }

        // Sumuj błędy własne (osobno normalne i inne)
        for (let set = 1; set <= 5; set++) {
          const errorsKey = `own_errors_set${set}` as keyof MatchErrors
          const otherKey = `own_errors_other_set${set}` as keyof MatchErrors
          ownErrorsTotal += ((errors[errorsKey] as number) || 0)
          ownErrorsOtherTotal += ((errors[otherKey] as number) || 0)
        }
      })

      return {
        opponent_errors_total: opponentTotal,
        blocks_against_total: blocksTotal,
        own_errors_total: ownErrorsTotal,
        own_errors_other_total: ownErrorsOtherTotal
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minut
  })
}

