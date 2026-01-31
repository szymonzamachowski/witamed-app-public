import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'

export type PlayerStatistics = {
  player_id: string
  player: Profile | null
  matches_played: number
  // Podstawowe statystyki
  total_points: number
  total_aces: number
  total_blocks: number
  total_spikes: number
  total_digs: number
  // Szczegółowe statystyki - zagrywka
  serve_total: number
  serve_errors: number
  serve_aces: number
  serve_percentage: number
  // Szczegółowe statystyki - przyjęcie
  reception_total: number
  reception_positive: number
  reception_other: number
  reception_errors: number
  reception_percentage: number
  // Szczegółowe statystyki - atak
  attack_total: number
  attack_points: number
  attack_unfinished: number
  attack_errors: number
  attack_blocked: number
  attack_percentage: number
  // Szczegółowe statystyki - blok
  block_total: number
}

export function usePlayerStatistics() {
  return useQuery({
    queryKey: ['player-statistics'],
    queryFn: async () => {
      // Pobierz wszystkie statystyki z informacjami o zawodnikach
      const { data: allStats, error: statsError } = await supabase
        .from('match_statistics')
        .select('*, profiles(*), matches(id)')

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

      // Utwórz mapę obecności: match_id -> Set<player_id>
      const attendanceMap = new Map<string, Set<string>>()
      allAttendance?.forEach((att: any) => {
        if (!attendanceMap.has(att.match_id)) {
          attendanceMap.set(att.match_id, new Set())
        }
        attendanceMap.get(att.match_id)!.add(att.player_id)
      })

      // Agreguj statystyki per zawodnik, uwzględniając tylko mecze z obecnością
      const playerStatsMap = new Map<string, PlayerStatistics>()

      allStats.forEach((stat: any) => {
        const playerId = stat.player_id
        const matchId = stat.match_id
        const player = stat.profiles as Profile | null

        // Sprawdź czy zawodnik był obecny na tym meczu
        const matchAttendance = attendanceMap.get(matchId)
        if (!matchAttendance || !matchAttendance.has(playerId)) {
          // Pomiń statystyki z meczów, na których zawodnik nie był obecny
          return
        }

        if (!playerStatsMap.has(playerId)) {
          playerStatsMap.set(playerId, {
            player_id: playerId,
            player: player,
            matches_played: 0,
            total_points: 0,
            total_aces: 0,
            total_blocks: 0,
            total_spikes: 0,
            total_digs: 0,
            serve_total: 0,
            serve_errors: 0,
            serve_aces: 0,
            serve_percentage: 0,
            reception_total: 0,
            reception_positive: 0,
            reception_other: 0,
            reception_errors: 0,
            reception_percentage: 0,
            attack_total: 0,
            attack_points: 0,
            attack_unfinished: 0,
            attack_errors: 0,
            attack_blocked: 0,
            attack_percentage: 0,
            block_total: 0,
          })
        }

        const playerStats = playerStatsMap.get(playerId)!
        playerStats.matches_played += 1

        // Podstawowe statystyki (dla kompatybilności wstecznej)
        playerStats.total_spikes += stat.spikes || 0
        playerStats.total_digs += stat.digs || 0

        // Zagrywka
        playerStats.serve_total += stat.serve_total || 0
        playerStats.serve_errors += stat.serve_errors || 0
        playerStats.serve_aces += stat.serve_aces || 0

        // Przyjęcie
        playerStats.reception_total += stat.reception_total || 0
        playerStats.reception_positive += stat.reception_positive || 0
        playerStats.reception_other += stat.reception_other || 0
        playerStats.reception_errors += stat.reception_errors || 0

        // Atak
        playerStats.attack_total += stat.attack_total || 0
        playerStats.attack_points += stat.attack_points || 0
        playerStats.attack_unfinished += stat.attack_unfinished || 0
        playerStats.attack_errors += stat.attack_errors || 0
        playerStats.attack_blocked += stat.attack_blocked || 0

        // Blok
        playerStats.block_total += stat.block_total || 0
      })

      // Oblicz procenty i punkty dla każdego zawodnika
      const aggregatedStats: PlayerStatistics[] = Array.from(playerStatsMap.values()).map(stats => {
        // Procent zagrywki (aces / total)
        stats.serve_percentage = stats.serve_total > 0
          ? Math.round((stats.serve_aces / stats.serve_total) * 100)
          : 0

        // Procent przyjęcia
        stats.reception_percentage = stats.reception_total > 0
          ? Math.round((stats.reception_positive / stats.reception_total) * 100)
          : 0

        // Procent ataku (punkty punktowe / total) - skuteczność
        stats.attack_percentage = stats.attack_total > 0
          ? Math.round((stats.attack_points / stats.attack_total) * 100)
          : 0

        // Punkty = skończone ataki + asy + bloki
        stats.total_points = (stats.attack_points || 0) + (stats.serve_aces || 0) + (stats.block_total || 0)
        
        // Dla kompatybilności wstecznej (ale nie używane w UI)
        stats.total_aces = stats.serve_aces || 0
        stats.total_blocks = stats.block_total || 0

        return stats
      })

      return aggregatedStats
    },
    staleTime: 1000 * 60 * 5, // 5 minut
  })
}

