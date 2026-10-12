import { Fragment, useState, useMemo, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { MatchStatisticsWithPlayer } from '../hooks/useMatchStatistics'
import type { MatchErrors } from '../types/database'
import './admin-match-stats-table.css'

/** Błędy własne wpisywane per set w podziale na kategorie (jak w arkuszu statystyków). */
const OWN_ERROR_CATEGORIES = [
  { prefix: 'own_serve', label: 'SERWIS', playerField: 'serve_errors' },
  { prefix: 'own_reception', label: 'PRZYJĘCIE', playerField: 'reception_errors' },
  { prefix: 'own_attack', label: 'ATAK', playerField: 'attack_errors' },
  { prefix: 'own_blocked', label: 'ZABLOKOWANE', playerField: 'attack_blocked' },
] as const

/** Suma błędów własnych w secie = suma kategorii (gdy kategorie są wpisane). */
function withOwnErrorSums(errors: MatchErrors): MatchErrors {
  const next: MatchErrors = { ...errors }
  for (let set = 1; set <= 5; set++) {
    const parts = OWN_ERROR_CATEGORIES.map(c => errors[`${c.prefix}_set${set}` as keyof MatchErrors] as number | undefined)
    if (parts.some(v => v !== undefined && v !== null)) {
      ;(next as Record<string, number>)[`own_errors_set${set}`] = parts.reduce<number>((sum, v) => sum + (v || 0), 0)
    }
  }
  return next
}

type PlayerStatsEdit = {
  player_id: string
  player_name: string
  serve_total: number
  serve_errors: number
  serve_aces: number
  reception_total: number
  reception_positive: number
  reception_other: number
  reception_errors: number
  attack_total: number
  attack_points: number
  attack_unfinished: number
  attack_errors: number
  attack_blocked: number
  block_total: number
  existing_id?: string
}

type Props = {
  matchId: string
  players: Array<{ id: string; full_name: string | null; username: string | null }>
  existingStats: MatchStatisticsWithPlayer[]
  matchErrors?: MatchErrors
  onErrorsChange: (errors: MatchErrors) => void
  onErrorsSave: (errors: MatchErrors) => Promise<void>
}

export default function AdminMatchStatsTable({
  matchId,
  players,
  existingStats,
  matchErrors = {},
  onErrorsChange,
  onErrorsSave
}: Props) {
  const queryClient = useQueryClient()
  const [savingPlayerId, setSavingPlayerId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Inicjalizuj statystyki dla wszystkich zawodników
  const allPlayerStats = useMemo(() => {
    const statsMap = new Map<string, PlayerStatsEdit>()

    players.forEach(player => {
      const existing = existingStats.find(s => s.player_id === player.id)
      const playerName = player.full_name || player.username || 'Nieznany'

      statsMap.set(player.id, {
        player_id: player.id,
        player_name: playerName,
        serve_total: existing?.serve_total || 0,
        serve_errors: existing?.serve_errors || 0,
        serve_aces: existing?.serve_aces || 0,
        reception_total: existing?.reception_total || 0,
        reception_positive: existing?.reception_positive || 0,
        reception_other: existing?.reception_other || 0,
        reception_errors: existing?.reception_errors || 0,
        attack_total: existing?.attack_total || 0,
        attack_points: existing?.attack_points || 0,
        attack_unfinished: existing?.attack_unfinished || 0,
        attack_errors: existing?.attack_errors || 0,
        attack_blocked: existing?.attack_blocked || 0,
        block_total: existing?.block_total || 0,
        existing_id: existing?.id
      })
    })

    return statsMap
  }, [players, existingStats])

  const [playerStats, setPlayerStats] = useState<Map<string, PlayerStatsEdit>>(allPlayerStats)

  // Aktualizuj statystyki gdy existingStats się zmienia
  useEffect(() => {
    setPlayerStats(allPlayerStats)
  }, [allPlayerStats])

  const savePlayerStatsMutation = useMutation({
    mutationFn: async ({ playerId, stats }: { playerId: string; stats: PlayerStatsEdit }) => {
      const statsData = {
        serve_total: stats.serve_total,
        serve_errors: stats.serve_errors,
        serve_aces: stats.serve_aces,
        reception_total: stats.reception_total,
        reception_positive: stats.reception_positive,
        reception_other: stats.reception_other,
        reception_errors: stats.reception_errors,
        attack_total: stats.attack_total,
        attack_points: stats.attack_points,
        attack_unfinished: stats.attack_unfinished,
        attack_errors: stats.attack_errors,
        attack_blocked: stats.attack_blocked,
        block_total: stats.block_total,
      }

      if (stats.existing_id) {
        // Aktualizuj istniejące statystyki
        const { data, error } = await supabase
          .from('match_statistics')
          .update(statsData)
          .eq('id', stats.existing_id)
          .select()
          .single()
        
        if (error) throw error
        return data
      } else {
        // Dodaj nowe statystyki
        const { data, error } = await supabase
          .from('match_statistics')
          .insert([{
            match_id: matchId,
            player_id: playerId,
            ...statsData
          }])
          .select()
          .single()
        
        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-statistics', matchId] })
      setSuccess('Statystyki zostały zapisane!')
      setTimeout(() => setSuccess(null), 2000)
    },
    onError: (err: any) => {
      setError(err.message || 'Błąd przy zapisywaniu statystyk')
      setTimeout(() => setError(null), 5000)
    }
  })

  const handleStatChange = (playerId: string, field: keyof PlayerStatsEdit, value: number) => {
    const newStats = new Map(playerStats)
    const current = newStats.get(playerId)!
    newStats.set(playerId, { ...current, [field]: value })
    setPlayerStats(newStats)
  }

  const handleSavePlayer = async (playerId: string) => {
    setSavingPlayerId(playerId)
    setError(null)
    const stats = playerStats.get(playerId)!
    try {
      const saved = await savePlayerStatsMutation.mutateAsync({ playerId, stats })
      // Aktualizuj existing_id po zapisaniu
      const newStats = new Map(playerStats)
      const current = newStats.get(playerId)!
      newStats.set(playerId, { ...current, existing_id: saved.id })
      setPlayerStats(newStats)
    } catch (err) {
      // Błąd już jest obsłużony w mutation
    } finally {
      setSavingPlayerId(null)
    }
  }

  const handleSaveAll = async () => {
    setError(null)
    setSuccess(null)
    
    const newStats = new Map(playerStats)
    
    for (const [playerId, stats] of playerStats.entries()) {
      setSavingPlayerId(playerId)
      try {
        const saved = await savePlayerStatsMutation.mutateAsync({ playerId: stats.player_id, stats })
        // Aktualizuj existing_id po zapisaniu
        const current = newStats.get(playerId)!
        newStats.set(playerId, { ...current, existing_id: saved.id })
      } catch (err) {
        console.error(`Błąd przy zapisywaniu statystyk dla ${stats.player_name}:`, err)
      }
    }
    
    setPlayerStats(newStats)
    setSavingPlayerId(null)
    setSuccess('Wszystkie statystyki zostały zapisane!')
    setTimeout(() => setSuccess(null), 3000)
  }

  const calculateReceptionPercentage = (stats: PlayerStatsEdit) => {
    if (stats.reception_total === 0) return 0
    return Math.round((stats.reception_positive / stats.reception_total) * 100)
  }

  const calculateAttackPercentage = (stats: PlayerStatsEdit) => {
    if (stats.attack_total === 0) return 0
    // Procent ataku = punkty punktowe / total (skuteczność)
    return Math.round((stats.attack_points / stats.attack_total) * 100)
  }

  // Oblicz sumy
  const totals = useMemo(() => {
    const totals = {
      serve_total: 0,
      serve_errors: 0,
      serve_aces: 0,
      reception_total: 0,
      reception_positive: 0,
      reception_other: 0,
      reception_errors: 0,
      attack_total: 0,
      attack_points: 0,
      attack_unfinished: 0,
      attack_errors: 0,
      attack_blocked: 0,
      block_total: 0
    }

    playerStats.forEach(stats => {
      totals.serve_total += stats.serve_total
      totals.serve_errors += stats.serve_errors
      totals.serve_aces += stats.serve_aces
      totals.reception_total += stats.reception_total
      totals.reception_positive += stats.reception_positive
      totals.reception_other += stats.reception_other
      totals.reception_errors += stats.reception_errors
      totals.attack_total += stats.attack_total
      totals.attack_points += stats.attack_points
      totals.attack_unfinished += stats.attack_unfinished
      totals.attack_errors += stats.attack_errors
      totals.attack_blocked += stats.attack_blocked
      totals.block_total += stats.block_total
    })

    return totals
  }, [playerStats])

  const totalReceptionPercentage = totals.reception_total > 0
    ? Math.round((totals.reception_positive / totals.reception_total) * 100)
    : 0

  const totalAttackPercentage = totals.attack_total > 0
    ? Math.round((totals.attack_points / totals.attack_total) * 100)
    : 0

  const [localMatchErrors, setLocalMatchErrors] = useState<MatchErrors>(matchErrors || {})
  const [savingErrors, setSavingErrors] = useState(false)
  
  // Stan dla liczby setów (wspólny dla wszystkich kategorii, min 3, max 5)
  const [numberOfSets, setNumberOfSets] = useState<number>(3)

  // Aktualizuj localMatchErrors gdy matchErrors się zmienia
  useEffect(() => {
    if (matchErrors) {
      setLocalMatchErrors(matchErrors)
      // Określ liczbę setów na podstawie najwyższego setu z wartością (min 3, max 5)
      const getMaxSet = (prefix: string) => {
        let maxSet = 0
        for (let set = 1; set <= 5; set++) {
          const key = `${prefix}_set${set}` as keyof MatchErrors
          if (matchErrors[key] !== undefined && matchErrors[key] !== null) {
            maxSet = set
          }
        }
        return Math.max(3, Math.min(5, maxSet || 3))
      }
      
      // Użyj najwyższej liczby setów ze wszystkich kategorii
      const maxSets = Math.max(
        getMaxSet('opponent_errors'),
        getMaxSet('blocks_against'),
        getMaxSet('own_errors')
      )
      setNumberOfSets(maxSets)
    }
  }, [matchErrors])

  const handleErrorsSave = async () => {
    setSavingErrors(true)
    setError(null)
    try {
      // Oblicz total z setów (tylko widoczne sety)
      const opponentTotal = Array.from({ length: numberOfSets }, (_, i) => i + 1).reduce((sum, set) => 
        sum + ((localMatchErrors[`opponent_errors_set${set}` as keyof MatchErrors] as number) || 0), 0
      )
      
      const blocksTotal = Array.from({ length: numberOfSets }, (_, i) => i + 1).reduce((sum, set) => 
        sum + ((localMatchErrors[`blocks_against_set${set}` as keyof MatchErrors] as number) || 0), 0
      )
      
      const summed = withOwnErrorSums(localMatchErrors)
      const ownErrorsTotal = Array.from({ length: numberOfSets }, (_, i) => i + 1).reduce((sum, set) => 
        sum + ((summed[`own_errors_set${set}` as keyof MatchErrors] as number) || 0), 0
      )

      const errorsWithTotals = {
        ...withOwnErrorSums(localMatchErrors),
        opponent_errors_total: opponentTotal,
        blocks_against_total: blocksTotal,
        own_errors_total: ownErrorsTotal
      }

      await onErrorsSave(errorsWithTotals)
      setSuccess('Inne statystyki meczu zostały zapisane!')
      setTimeout(() => setSuccess(null), 2000)
    } catch (err: any) {
      setError(err.message || 'Błąd przy zapisywaniu błędów meczu')
      setTimeout(() => setError(null), 5000)
    } finally {
      setSavingErrors(false)
    }
  }

  return (
    <div className="admin-stats-table-container">
      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-success">
          {success}
        </div>
      )}

      <div className="table-controls">
        <button
          onClick={handleSaveAll}
          className="admin-button"
          disabled={savePlayerStatsMutation.isPending}
        >
          {savePlayerStatsMutation.isPending ? 'Zapisywanie...' : 'Zapisz wszystkie statystyki'}
        </button>
      </div>

      <div className="stats-table-wrapper">
        <table className="admin-stats-table">
          <thead>
            <tr>
              <th rowSpan={2} className="player-col">GRACZ</th>
              <th colSpan={3}>ZAGRYWKA</th>
              <th colSpan={5}>PRZYJĘCIE</th>
              <th colSpan={6}>ATAK</th>
              <th rowSpan={2}>BLOK</th>
              <th rowSpan={2} className="actions-col">AKCJE</th>
            </tr>
            <tr>
              <th>TOTAL</th>
              <th>BŁĄD</th>
              <th>AS</th>
              <th>TOTAL</th>
              <th>POZYTYWNE</th>
              <th>POZOSTAŁE</th>
              <th>BŁĄD</th>
              <th>%</th>
              <th>TOTAL</th>
              <th>PUNKTOWY</th>
              <th>NIESKOŃCZONY</th>
              <th>BŁĄD</th>
              <th>ZABLOKOWANY</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(playerStats.values()).map((stats) => (
              <tr key={stats.player_id}>
                <td className="player-name">{stats.player_name}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={stats.serve_total}
                    onChange={(e) => handleStatChange(stats.player_id, 'serve_total', parseInt(e.target.value) || 0)}
                    className="stat-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={stats.serve_errors}
                    onChange={(e) => handleStatChange(stats.player_id, 'serve_errors', parseInt(e.target.value) || 0)}
                    className="stat-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={stats.serve_aces}
                    onChange={(e) => handleStatChange(stats.player_id, 'serve_aces', parseInt(e.target.value) || 0)}
                    className="stat-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={stats.reception_total}
                    onChange={(e) => handleStatChange(stats.player_id, 'reception_total', parseInt(e.target.value) || 0)}
                    className="stat-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={stats.reception_positive}
                    onChange={(e) => handleStatChange(stats.player_id, 'reception_positive', parseInt(e.target.value) || 0)}
                    className="stat-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={stats.reception_other}
                    onChange={(e) => handleStatChange(stats.player_id, 'reception_other', parseInt(e.target.value) || 0)}
                    className="stat-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={stats.reception_errors}
                    onChange={(e) => handleStatChange(stats.player_id, 'reception_errors', parseInt(e.target.value) || 0)}
                    className="stat-input"
                  />
                </td>
                <td className="percentage">{calculateReceptionPercentage(stats)}%</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={stats.attack_total}
                    onChange={(e) => handleStatChange(stats.player_id, 'attack_total', parseInt(e.target.value) || 0)}
                    className="stat-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={stats.attack_points}
                    onChange={(e) => handleStatChange(stats.player_id, 'attack_points', parseInt(e.target.value) || 0)}
                    className="stat-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={stats.attack_unfinished}
                    onChange={(e) => handleStatChange(stats.player_id, 'attack_unfinished', parseInt(e.target.value) || 0)}
                    className="stat-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={stats.attack_errors}
                    onChange={(e) => handleStatChange(stats.player_id, 'attack_errors', parseInt(e.target.value) || 0)}
                    className="stat-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={stats.attack_blocked}
                    onChange={(e) => handleStatChange(stats.player_id, 'attack_blocked', parseInt(e.target.value) || 0)}
                    className="stat-input"
                  />
                </td>
                <td className="percentage">{calculateAttackPercentage(stats)}%</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={stats.block_total}
                    onChange={(e) => handleStatChange(stats.player_id, 'block_total', parseInt(e.target.value) || 0)}
                    className="stat-input"
                  />
                </td>
                <td className="actions">
                  <button
                    onClick={() => handleSavePlayer(stats.player_id)}
                    className="save-btn"
                    disabled={savingPlayerId === stats.player_id}
                  >
                    {savingPlayerId === stats.player_id ? '...' : 'Zapisz'}
                  </button>
                </td>
              </tr>
            ))}
            <tr className="totals-row">
              <td className="player-name">RAZEM</td>
              <td>{totals.serve_total}</td>
              <td>{totals.serve_errors}</td>
              <td>{totals.serve_aces}</td>
              <td>{totals.reception_total}</td>
              <td>{totals.reception_positive}</td>
              <td>{totals.reception_other}</td>
              <td>{totals.reception_errors}</td>
              <td className="percentage">{totalReceptionPercentage}%</td>
              <td>{totals.attack_total}</td>
              <td>{totals.attack_points}</td>
              <td>{totals.attack_unfinished}</td>
              <td>{totals.attack_errors}</td>
              <td>{totals.attack_blocked}</td>
              <td className="percentage">{totalAttackPercentage}%</td>
              <td>{totals.block_total}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Formularz błędów meczu - 3 osobne tabelki */}
      <div className="match-errors-section">
        <div className="match-errors-header">
          <h4>Inne statystyki meczu</h4>
          <div className="sets-controls">
            {numberOfSets > 3 && (
              <button
                type="button"
                onClick={() => setNumberOfSets(prev => Math.max(3, prev - 1))}
                className="set-control-btn"
                title="Usuń set (wszystkie kategorie)"
              >
                <span className="set-control-icon">−</span>
                <span className="set-control-text">Usuń set</span>
              </button>
            )}
            {numberOfSets < 5 && (
              <button
                type="button"
                onClick={() => setNumberOfSets(prev => Math.min(5, prev + 1))}
                className="set-control-btn"
                title="Dodaj set (wszystkie kategorie)"
              >
                <span className="set-control-icon">+</span>
                <span className="set-control-text">Dodaj set</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="errors-tables-container">
          {/* Tabelka 1: Błędy przeciwników */}
          <div className="error-table-container">
            <h5>BŁĘDY PRZECIWNIKA</h5>
            <div className="errors-table-wrapper">
              <table className="errors-table">
                <thead>
                  <tr>
                    {Array.from({ length: numberOfSets }, (_, i) => i + 1).map(set => (
                      <th key={set}>{set} SET</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {Array.from({ length: numberOfSets }, (_, i) => i + 1).map(set => {
                      const key = `opponent_errors_set${set}` as keyof MatchErrors
                      return (
                        <td key={set}>
                          <input
                            type="number"
                            min="0"
                            value={(localMatchErrors[key] as number) ?? 0}
                            onChange={(e) => {
                              const newErrors = { ...localMatchErrors, [key]: parseInt(e.target.value) || 0 }
                              setLocalMatchErrors(newErrors)
                              onErrorsChange(newErrors)
                            }}
                            className="error-input"
                            placeholder="0"
                          />
                        </td>
                      )
                    })}
                  </tr>
                  <tr className="total-row">
                    <td colSpan={numberOfSets} className="total-cell">
                      TOTAL: {Array.from({ length: numberOfSets }, (_, i) => i + 1).reduce((sum, set) => 
                        sum + ((localMatchErrors[`opponent_errors_set${set}` as keyof MatchErrors] as number) || 0), 0
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabelka 2: Wybloki */}
          <div className="error-table-container">
            <h5>WYBLOKI</h5>
            <div className="errors-table-wrapper">
              <table className="errors-table">
                <thead>
                  <tr>
                    {Array.from({ length: numberOfSets }, (_, i) => i + 1).map(set => (
                      <th key={set}>{set} SET</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {Array.from({ length: numberOfSets }, (_, i) => i + 1).map(set => {
                      const key = `blocks_against_set${set}` as keyof MatchErrors
                      return (
                        <td key={set}>
                          <input
                            type="number"
                            min="0"
                            value={(localMatchErrors[key] as number) ?? 0}
                            onChange={(e) => {
                              const newErrors = { ...localMatchErrors, [key]: parseInt(e.target.value) || 0 }
                              setLocalMatchErrors(newErrors)
                              onErrorsChange(newErrors)
                            }}
                            className="error-input"
                            placeholder="0"
                          />
                        </td>
                      )
                    })}
                  </tr>
                  <tr className="total-row">
                    <td colSpan={numberOfSets} className="total-cell">
                      TOTAL: {Array.from({ length: numberOfSets }, (_, i) => i + 1).reduce((sum, set) => 
                        sum + ((localMatchErrors[`blocks_against_set${set}` as keyof MatchErrors] as number) || 0), 0
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabelka 3: Błędy własne */}
          <div className="error-table-container">
            <h5>BŁĘDY WŁASNE</h5>
            <div className="errors-table-wrapper">
              <table className="errors-table">
                <thead>
                  <tr>
                    {Array.from({ length: numberOfSets }, (_, i) => i + 1).map(set => (
                      <th key={set}>{set} SET</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {OWN_ERROR_CATEGORIES.map(cat => {
                    const catTotal = Array.from({ length: numberOfSets }, (_, i) => i + 1).reduce(
                      (sum, set) => sum + ((localMatchErrors[`${cat.prefix}_set${set}` as keyof MatchErrors] as number) || 0),
                      0
                    )
                    const playersTotal = Array.from(playerStats.values()).reduce((sum, ps) => sum + (Number(ps[cat.playerField]) || 0), 0)
                    return (
                      <Fragment key={cat.prefix}>
                        <tr className="error-category">
                          <td colSpan={numberOfSets} className="error-category-label">
                            {cat.label}
                            {catTotal !== playersTotal && (
                              <span className="own-errors-mismatch"> · zawodnicy mają {playersTotal}, w setach {catTotal}</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          {Array.from({ length: numberOfSets }, (_, i) => i + 1).map(set => {
                            const key = `${cat.prefix}_set${set}` as keyof MatchErrors
                            return (
                              <td key={set}>
                                <input
                                  type="number"
                                  min="0"
                                  value={(localMatchErrors[key] as number) ?? 0}
                                  onChange={(e) => {
                                    const newErrors = withOwnErrorSums({ ...localMatchErrors, [key]: parseInt(e.target.value) || 0 })
                                    setLocalMatchErrors(newErrors)
                                    onErrorsChange(newErrors)
                                  }}
                                  className="error-input"
                                  placeholder="0"
                                />
                              </td>
                            )
                          })}
                        </tr>
                      </Fragment>
                    )
                  })}
                  <tr className="error-category">
                    <td colSpan={numberOfSets} className="error-category-label">INNE</td>
                  </tr>
                  <tr>
                    {Array.from({ length: numberOfSets }, (_, i) => i + 1).map(set => {
                      const errorsKey = `own_errors_other_set${set}` as keyof MatchErrors
                      return (
                        <td key={set}>
                          <input
                            type="number"
                            min="0"
                            value={(localMatchErrors[errorsKey] as number) ?? 0}
                            onChange={(e) => {
                              const newErrors = { ...localMatchErrors, [errorsKey]: parseInt(e.target.value) || 0 }
                              setLocalMatchErrors(newErrors)
                              onErrorsChange(newErrors)
                            }}
                            className="error-input"
                            placeholder="0"
                          />
                        </td>
                      )
                    })}
                  </tr>
                  <tr className="total-row">
                    <td colSpan={numberOfSets} className="total-cell">
                      TOTAL: {(() => {
                        const ownTotal = Array.from({ length: numberOfSets }, (_, i) => i + 1).reduce((sum, set) => 
                          sum + ((localMatchErrors[`own_errors_set${set}` as keyof MatchErrors] as number) || 0), 0
                        )
                        const otherTotal = Array.from({ length: numberOfSets }, (_, i) => i + 1).reduce((sum, set) => 
                          sum + ((localMatchErrors[`own_errors_other_set${set}` as keyof MatchErrors] as number) || 0), 0
                        )
                        return `${ownTotal}${otherTotal > 0 ? ` (+${otherTotal})` : ''}`
                      })()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <button
          onClick={handleErrorsSave}
          className="admin-button"
          disabled={savingErrors}
        >
          {savingErrors ? 'Zapisywanie...' : 'Zapisz inne statystyki meczu'}
        </button>
      </div>
    </div>
  )
}

