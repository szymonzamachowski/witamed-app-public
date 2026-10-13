import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { aggregatePlayerStats, type PlayerStatistics, type StatEntry } from '../stats/aggregate'

export type { PlayerStatistics }

export function usePlayerStatistics() {
  return useQuery({
    queryKey: ['player-statistics'],
    queryFn: async () => {
      // Pobierz wszystkie statystyki z informacjami o zawodnikach
      const { data: allStats, error: statsError } = await supabase
        .from('match_statistics')
        .select('*, profiles(*), matches(id, date, opponent)')

      if (statsError) {
        console.error('❌ Błąd przy pobieraniu statystyk:', statsError)
        throw statsError
      }

      if (!allStats || allStats.length === 0) {
        return [] as PlayerStatistics[]
      }

      // Pobierz wszystkie obecności na mecze (tylko status='present')
      const matchIds = [...new Set(allStats.map((stat: any) => stat.match_id))]
      const { data: allAttendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('match_id, player_id, status')
        .in('match_id', matchIds)
        .eq('status', 'present')

      if (attendanceError) {
        console.error('❌ Błąd przy pobieraniu obecności:', attendanceError)
        throw attendanceError
      }

      // Liczymy tylko statystyki z meczów, na których zawodnik był obecny
      const present = new Set(allAttendance?.map((att: any) => `${att.match_id}|${att.player_id}`))

      const entries: StatEntry[] = allStats
        .filter((stat: any) => present.has(`${stat.match_id}|${stat.player_id}`))
        .map((stat: any) => ({
          player_id: stat.player_id,
          player: stat.profiles,
          match_id: stat.match_id,
          date: stat.matches?.date ?? '',
          opponent: stat.matches?.opponent ?? '',
          stat,
        }))

      return aggregatePlayerStats(entries)
    },
    staleTime: 1000 * 60 * 5, // 5 minut
  })
}
