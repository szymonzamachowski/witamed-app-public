/**
 * Liczenie statystyk sezonu z pojedynczych wierszy mecz × zawodnik.
 * Wspólne dla bieżącego sezonu (match_statistics) i archiwum (season_archive_statistics).
 */
import type { MatchErrors } from '../types/database'
import { RAW_FIELDS, type RawStats } from './statConfig'

export type PlayerStatistics = {
  player_id: string
  player: { full_name: string | null; username: string | null } | null
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
  /** Suma statystyk sezonu bez ostatniego meczu zawodnika (do strzałek trendu); null przy < 2 meczach */
  before_last_match: RawStats | null
  /** Statystyki z każdego meczu (rosnąco po dacie) — wykres formy */
  per_match: { matchId: string; date: string; opponent: string; stats: RawStats }[]
}

/** Jeden wiersz statystyk zawodnika z meczu, na którym był obecny. */
export type StatEntry = {
  player_id: string
  player: PlayerStatistics['player']
  match_id: string
  date: string
  opponent: string
  stat: RawStats & { spikes?: number | null; digs?: number | null }
}

export function aggregatePlayerStats(entries: StatEntry[]): PlayerStatistics[] {
  const playerStatsMap = new Map<string, PlayerStatistics>()
  // Ostatni mecz każdego zawodnika (do strzałek trendu)
  const lastMatchRow = new Map<string, { date: number; stat: StatEntry['stat'] }>()

  entries.forEach(({ player_id: playerId, player, match_id: matchId, date, opponent, stat }) => {
    if (!playerStatsMap.has(playerId)) {
      playerStatsMap.set(playerId, {
        player_id: playerId,
        player,
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
        before_last_match: null,
        per_match: [],
      })
    }

    const playerStats = playerStatsMap.get(playerId)!
    playerStats.per_match.push({ matchId, date, opponent, stats: stat })

    const matchDate = new Date(date || 0).getTime()
    const previousLast = lastMatchRow.get(playerId)
    if (!previousLast || matchDate > previousLast.date) {
      lastMatchRow.set(playerId, { date: matchDate, stat })
    }

    playerStats.matches_played += 1

    // Podstawowe statystyki (dla kompatybilności wstecznej)
    playerStats.total_spikes += stat.spikes || 0
    playerStats.total_digs += stat.digs || 0

    for (const field of RAW_FIELDS) {
      playerStats[field] += stat[field] || 0
    }
  })

  // Oblicz procenty i punkty dla każdego zawodnika
  return Array.from(playerStatsMap.values()).map(stats => {
    // Procent zagrywki (aces / total)
    stats.serve_percentage = stats.serve_total > 0 ? Math.round((stats.serve_aces / stats.serve_total) * 100) : 0

    // Procent przyjęcia
    stats.reception_percentage =
      stats.reception_total > 0 ? Math.round((stats.reception_positive / stats.reception_total) * 100) : 0

    // Procent ataku (punkty punktowe / total) - skuteczność
    stats.attack_percentage = stats.attack_total > 0 ? Math.round((stats.attack_points / stats.attack_total) * 100) : 0

    // Punkty = skończone ataki + asy + bloki
    stats.total_points = (stats.attack_points || 0) + (stats.serve_aces || 0) + (stats.block_total || 0)

    stats.per_match.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Sezon bez ostatniego meczu - do porównania „po ostatnim meczu lepiej/gorzej”
    const last = lastMatchRow.get(stats.player_id)
    if (last && stats.matches_played >= 2) {
      const before: RawStats = {}
      for (const field of RAW_FIELDS) {
        before[field] = (stats[field] || 0) - (last.stat[field] || 0)
      }
      stats.before_last_match = before
    }

    // Dla kompatybilności wstecznej (ale nie używane w UI)
    stats.total_aces = stats.serve_aces || 0
    stats.total_blocks = stats.block_total || 0

    return stats
  })
}

export type MatchErrorsSummary = {
  opponent_errors_total: number
  blocks_against_total: number
  own_errors_total: number
  own_errors_other_total: number
  own_by_category: { own_serve: number; own_reception: number; own_attack: number; own_blocked: number }
}

/** Zsumuj błędy ze wszystkich meczów sezonu (pola per set z matches.match_errors). */
export function sumMatchErrors(list: (MatchErrors | null | undefined)[]): MatchErrorsSummary {
  let opponentTotal = 0
  let blocksTotal = 0
  let ownErrorsTotal = 0
  let ownErrorsOtherTotal = 0
  const byCategory = { own_serve: 0, own_reception: 0, own_attack: 0, own_blocked: 0 }
  const get = (errors: MatchErrors, key: string) => (errors[key as keyof MatchErrors] as number) || 0

  list.forEach(errors => {
    if (!errors) return
    for (let set = 1; set <= 5; set++) {
      opponentTotal += get(errors, `opponent_errors_set${set}`)
      blocksTotal += get(errors, `blocks_against_set${set}`)
      // Błędy własne (osobno normalne i inne)
      ownErrorsTotal += get(errors, `own_errors_set${set}`)
      ownErrorsOtherTotal += get(errors, `own_errors_other_set${set}`)
      for (const cat of Object.keys(byCategory) as (keyof typeof byCategory)[]) {
        byCategory[cat] += get(errors, `${cat}_set${set}`)
      }
    }
  })

  return {
    opponent_errors_total: opponentTotal,
    blocks_against_total: blocksTotal,
    own_errors_total: ownErrorsTotal,
    own_errors_other_total: ownErrorsOtherTotal,
    own_by_category: byCategory,
  }
}
