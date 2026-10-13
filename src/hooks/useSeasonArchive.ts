import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Match } from '../types/database'
import type { RawStats } from '../stats/statConfig'
import { aggregatePlayerStats, sumMatchErrors } from '../stats/aggregate'

/** Zakończone sezony trzymamy w osobnych tabelach season_archive_* (tylko odczyt). */
export const LAST_SEASON = '2025/26'

export type ArchiveMatch = Omit<Match, 'created_at'> & { season: string }

export type ArchiveStatRow = RawStats & {
  id: string
  season: string
  match_id: string
  player_id: string | null
  player_name: string
}

const ARCHIVE_STALE_TIME = 1000 * 60 * 60 // archiwum się nie zmienia

export function useArchiveMatches(season: string) {
  return useQuery({
    queryKey: ['archive-matches', season],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('season_archive_matches')
        .select('*')
        .eq('season', season)
        .order('date', { ascending: false })
      if (error) throw error
      return (data ?? []) as ArchiveMatch[]
    },
    staleTime: ARCHIVE_STALE_TIME,
  })
}

/** Statystyki zawodników i drużyny za cały sezon z archiwum. */
export function useArchiveSeasonStats(season: string) {
  return useQuery({
    queryKey: ['archive-season-stats', season],
    queryFn: async () => {
      const [{ data: matches, error: matchesError }, { data: stats, error: statsError }] = await Promise.all([
        supabase.from('season_archive_matches').select('id, date, opponent, match_errors').eq('season', season),
        supabase.from('season_archive_statistics').select('*').eq('season', season),
      ])
      if (matchesError) throw matchesError
      if (statsError) throw statsError

      const matchById = new Map((matches ?? []).map(m => [m.id, m]))
      // W archiwum są już tylko statystyki zawodników obecnych na meczu
      const players = aggregatePlayerStats(
        ((stats ?? []) as ArchiveStatRow[]).map(stat => ({
          // Zawodnicy bez konta: grupujemy po nazwisku
          player_id: stat.player_id ?? stat.player_name,
          player: { full_name: stat.player_name, username: null },
          match_id: stat.match_id,
          date: matchById.get(stat.match_id)?.date ?? '',
          opponent: matchById.get(stat.match_id)?.opponent ?? '',
          stat,
        }))
      )

      return { players, errors: sumMatchErrors((matches ?? []).map(m => m.match_errors)) }
    },
    staleTime: ARCHIVE_STALE_TIME,
  })
}

export function useArchiveMatch(matchId: string) {
  return useQuery({
    queryKey: ['archive-match', matchId],
    queryFn: async () => {
      const [{ data: match, error: matchError }, { data: stats, error: statsError }] = await Promise.all([
        supabase.from('season_archive_matches').select('*').eq('id', matchId).single(),
        supabase.from('season_archive_statistics').select('*').eq('match_id', matchId),
      ])
      if (matchError) throw matchError
      if (statsError) throw statsError

      return {
        match: match as ArchiveMatch,
        statistics: ((stats ?? []) as ArchiveStatRow[]).map(stat => ({
          ...stat,
          profiles: { full_name: stat.player_name, username: null },
        })),
      }
    },
    enabled: !!matchId,
    staleTime: ARCHIVE_STALE_TIME,
  })
}
