import { useState, FormEvent } from 'react'
import { useMatches } from '../hooks/useMatches'
import { usePlayers } from '../hooks/usePlayers'
import { useMatchStatistics } from '../hooks/useMatchStatistics'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { MatchErrors } from '../types/database'
import './admin-match-stats.css'

export default function AdminMatchStats() {
  const { data: matches, isLoading: matchesLoading } = useMatches()
  const { data: players, isLoading: playersLoading } = usePlayers()
  const queryClient = useQueryClient()
  
  const [selectedMatchId, setSelectedMatchId] = useState<string>('')
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Statystyki zawodnika
  const [stats, setStats] = useState({
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
    block_total: 0,
  })

  // Błędy meczu
  const [matchErrors, setMatchErrors] = useState<MatchErrors>({
    opponent_errors_total: 0,
    opponent_errors_set1: 0,
    opponent_errors_set2: 0,
    opponent_errors_set3: 0,
    blocks_against_total: 0,
    blocks_against_set1: 0,
    blocks_against_set2: 0,
    blocks_against_set3: 0,
    own_errors_total: 0,
    own_errors_set1: 0,
    own_errors_set2: 0,
    own_errors_set3: 0,
    own_errors_other_set1: 0,
    own_errors_other_set2: 0,
    own_errors_other_set3: 0,
  })

  const { data: existingStats } = useMatchStatistics(selectedMatchId)
  const selectedMatch = matches?.find(m => m.id === selectedMatchId)

  const saveStatsMutation = useMutation({
    mutationFn: async ({ matchId, playerId, stats }: { matchId: string; playerId: string; stats: typeof stats }) => {
      // Sprawdź czy statystyki już istnieją
      const existing = existingStats?.find(s => s.player_id === playerId)
      
      if (existing) {
        // Aktualizuj istniejące
        const { data, error } = await supabase
          .from('match_statistics')
          .update(stats)
          .eq('id', existing.id)
          .select()
          .single()
        
        if (error) throw error
        return data
      } else {
        // Dodaj nowe
        const { data, error } = await supabase
          .from('match_statistics')
          .insert([{
            match_id: matchId,
            player_id: playerId,
            ...stats
          }])
          .select()
          .single()
        
        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
      setSuccess('Statystyki zostały zapisane!')
      setStats({
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
        block_total: 0,
      })
      queryClient.invalidateQueries({ queryKey: ['match-statistics', selectedMatchId] })
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (error: Error) => {
      setError(error.message || 'Wystąpił błąd')
      setSuccess(null)
    }
  })

  const saveMatchErrorsMutation = useMutation({
    mutationFn: async ({ matchId, errors }: { matchId: string; errors: MatchErrors }) => {
      const { data, error } = await supabase
        .from('matches')
        .update({ match_errors: errors })
        .eq('id', matchId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      setSuccess('Błędy meczu zostały zapisane!')
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['match', selectedMatchId] })
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (error: Error) => {
      setError(error.message || 'Wystąpił błąd')
      setSuccess(null)
    }
  })

  const handleMatchSelect = (matchId: string) => {
    setSelectedMatchId(matchId)
    const match = matches?.find(m => m.id === matchId)
    if (match?.match_errors) {
      setMatchErrors(match.match_errors as MatchErrors)
    }
    setError(null)
    setSuccess(null)
  }

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId)
    const existing = existingStats?.find(s => s.player_id === playerId)
    if (existing) {
      setStats({
        serve_total: existing.serve_total || 0,
        serve_errors: existing.serve_errors || 0,
        serve_aces: existing.serve_aces || 0,
        reception_total: existing.reception_total || 0,
        reception_positive: existing.reception_positive || 0,
        reception_other: existing.reception_other || 0,
        reception_errors: existing.reception_errors || 0,
        attack_total: existing.attack_total || 0,
        attack_points: existing.attack_points || 0,
        attack_unfinished: existing.attack_unfinished || 0,
        attack_errors: existing.attack_errors || 0,
        attack_blocked: existing.attack_blocked || 0,
        block_total: existing.block_total || 0,
      })
    } else {
      setStats({
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
        block_total: 0,
      })
    }
  }

  const handleStatsSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!selectedMatchId || !selectedPlayerId) {
      setError('Wybierz mecz i zawodnika')
      return
    }

    saveStatsMutation.mutate({
      matchId: selectedMatchId,
      playerId: selectedPlayerId,
      stats
    })
  }

  const handleErrorsSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!selectedMatchId) {
      setError('Wybierz mecz')
      return
    }

    // Oblicz total z setów
    const opponentTotal = (matchErrors.opponent_errors_set1 || 0) + 
                         (matchErrors.opponent_errors_set2 || 0) + 
                         (matchErrors.opponent_errors_set3 || 0) +
                         (matchErrors.opponent_errors_set4 || 0) +
                         (matchErrors.opponent_errors_set5 || 0)
    
    const blocksTotal = (matchErrors.blocks_against_set1 || 0) + 
                       (matchErrors.blocks_against_set2 || 0) + 
                       (matchErrors.blocks_against_set3 || 0) +
                       (matchErrors.blocks_against_set4 || 0) +
                       (matchErrors.blocks_against_set5 || 0)
    
    const ownErrorsTotal = (matchErrors.own_errors_set1 || 0) + 
                          (matchErrors.own_errors_set2 || 0) + 
                          (matchErrors.own_errors_set3 || 0) +
                          (matchErrors.own_errors_set4 || 0) +
                          (matchErrors.own_errors_set5 || 0)

    saveMatchErrorsMutation.mutate({
      matchId: selectedMatchId,
      errors: {
        ...matchErrors,
        opponent_errors_total: opponentTotal,
        blocks_against_total: blocksTotal,
        own_errors_total: ownErrorsTotal
      }
    })
  }

  if (matchesLoading || playersLoading) {
    return <div className="loading">Ładowanie...</div>
  }

  return (
    <div className="admin-match-stats">
      <h3>Zarządzanie statystykami meczów</h3>

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

      {/* Wybór meczu */}
      <div className="match-selector">
        <label htmlFor="match-select-stats">Wybierz mecz:</label>
        <select
          id="match-select-stats"
          value={selectedMatchId}
          onChange={(e) => handleMatchSelect(e.target.value)}
          className="match-select"
        >
          <option value="">-- Wybierz mecz --</option>
          {matches?.map(match => (
            <option key={match.id} value={match.id}>
              vs {match.opponent} - {new Date(match.date).toLocaleDateString('pl-PL')}
            </option>
          ))}
        </select>
      </div>

      {selectedMatchId && (
        <div className="stats-forms">
          {/* Formularz statystyk zawodnika */}
          <div className="player-stats-form">
            <h4>Statystyki zawodnika</h4>
            
            <div className="match-selector">
              <label htmlFor="player-select">Wybierz zawodnika:</label>
              <select
                id="player-select"
                value={selectedPlayerId}
                onChange={(e) => handlePlayerSelect(e.target.value)}
                className="match-select"
              >
                <option value="">-- Wybierz zawodnika --</option>
                {players?.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.full_name || player.username || 'Nieznany'}
                  </option>
                ))}
              </select>
            </div>

            {selectedPlayerId && (
              <form onSubmit={handleStatsSubmit} className="admin-form">
                <div className="stats-grid">
                  <div className="stats-category">
                    <h5>ZAGRYWKA</h5>
                    <div className="form-group">
                      <label>TOTAL</label>
                      <input
                        type="number"
                        min="0"
                        value={stats.serve_total}
                        onChange={(e) => setStats({...stats, serve_total: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="form-group">
                      <label>BŁĄD</label>
                      <input
                        type="number"
                        min="0"
                        value={stats.serve_errors}
                        onChange={(e) => setStats({...stats, serve_errors: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="form-group">
                      <label>AS</label>
                      <input
                        type="number"
                        min="0"
                        value={stats.serve_aces}
                        onChange={(e) => setStats({...stats, serve_aces: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="stats-category">
                    <h5>PRZYJĘCIE</h5>
                    <div className="form-group">
                      <label>TOTAL</label>
                      <input
                        type="number"
                        min="0"
                        value={stats.reception_total}
                        onChange={(e) => setStats({...stats, reception_total: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="form-group">
                      <label>POZYTYWNE</label>
                      <input
                        type="number"
                        min="0"
                        value={stats.reception_positive}
                        onChange={(e) => setStats({...stats, reception_positive: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="form-group">
                      <label>POZOSTAŁE</label>
                      <input
                        type="number"
                        min="0"
                        value={stats.reception_other}
                        onChange={(e) => setStats({...stats, reception_other: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="form-group">
                      <label>BŁĄD</label>
                      <input
                        type="number"
                        min="0"
                        value={stats.reception_errors}
                        onChange={(e) => setStats({...stats, reception_errors: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="stats-category">
                    <h5>ATAK</h5>
                    <div className="form-group">
                      <label>TOTAL</label>
                      <input
                        type="number"
                        min="0"
                        value={stats.attack_total}
                        onChange={(e) => setStats({...stats, attack_total: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="form-group">
                      <label>PUNKTOWY</label>
                      <input
                        type="number"
                        min="0"
                        value={stats.attack_points}
                        onChange={(e) => setStats({...stats, attack_points: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="form-group">
                      <label>NIESKOŃCZONY</label>
                      <input
                        type="number"
                        min="0"
                        value={stats.attack_unfinished}
                        onChange={(e) => setStats({...stats, attack_unfinished: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="form-group">
                      <label>BŁĄD</label>
                      <input
                        type="number"
                        min="0"
                        value={stats.attack_errors}
                        onChange={(e) => setStats({...stats, attack_errors: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="form-group">
                      <label>ZABLOKOWANY</label>
                      <input
                        type="number"
                        min="0"
                        value={stats.attack_blocked}
                        onChange={(e) => setStats({...stats, attack_blocked: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="stats-category">
                    <h5>BLOK</h5>
                    <div className="form-group">
                      <label>BLOK</label>
                      <input
                        type="number"
                        min="0"
                        value={stats.block_total}
                        onChange={(e) => setStats({...stats, block_total: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="admin-button"
                  disabled={saveStatsMutation.isPending}
                >
                  {saveStatsMutation.isPending ? 'Zapisywanie...' : 'Zapisz statystyki'}
                </button>
              </form>
            )}
          </div>

          {/* Formularz błędów meczu */}
          <div className="match-errors-form">
            <h4>Błędy meczu</h4>
            <form onSubmit={handleErrorsSubmit} className="admin-form">
              <div className="errors-grid">
                <div className="errors-category">
                  <h5>BŁĘDY PRZECIWNIKA</h5>
                  {[1, 2, 3, 4, 5].map(set => {
                    const key = `opponent_errors_set${set}` as keyof MatchErrors
                    return (
                      <div key={set} className="form-group">
                        <label>{set} SET</label>
                        <input
                          type="number"
                          min="0"
                          value={(matchErrors[key] as number) || 0}
                          onChange={(e) => setMatchErrors({
                            ...matchErrors,
                            [key]: parseInt(e.target.value) || 0
                          })}
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="errors-category">
                  <h5>WYBLOKI</h5>
                  {[1, 2, 3, 4, 5].map(set => {
                    const key = `blocks_against_set${set}` as keyof MatchErrors
                    return (
                      <div key={set} className="form-group">
                        <label>{set} SET</label>
                        <input
                          type="number"
                          min="0"
                          value={(matchErrors[key] as number) || 0}
                          onChange={(e) => setMatchErrors({
                            ...matchErrors,
                            [key]: parseInt(e.target.value) || 0
                          })}
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="errors-category">
                  <h5>BŁĘDY WŁASNE</h5>
                  {[1, 2, 3, 4, 5].map(set => {
                    const errorsKey = `own_errors_set${set}` as keyof MatchErrors
                    const otherKey = `own_errors_other_set${set}` as keyof MatchErrors
                    return (
                      <div key={set} className="form-group">
                        <label>{set} SET</label>
                        <input
                          type="number"
                          min="0"
                          value={(matchErrors[errorsKey] as number) || 0}
                          onChange={(e) => setMatchErrors({
                            ...matchErrors,
                            [errorsKey]: parseInt(e.target.value) || 0
                          })}
                        />
                        <input
                          type="number"
                          min="0"
                          placeholder="INNE"
                          value={(matchErrors[otherKey] as number) || 0}
                          onChange={(e) => setMatchErrors({
                            ...matchErrors,
                            [otherKey]: parseInt(e.target.value) || 0
                          })}
                          className="input-small"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              <button 
                type="submit" 
                className="admin-button"
                disabled={saveMatchErrorsMutation.isPending}
              >
                {saveMatchErrorsMutation.isPending ? 'Zapisywanie...' : 'Zapisz błędy meczu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

