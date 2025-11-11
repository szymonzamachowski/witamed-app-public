import { useState, useMemo } from 'react'
import { usePlayerStatistics } from '../hooks/usePlayerStatistics'
import { useAllMatchErrors } from '../hooks/useAllMatchErrors'
import type { PlayerStatistics } from '../hooks/usePlayerStatistics'
import './statistics.css'
import '../components/match-stats-table.css'

type SortField = 
  | 'player_name'
  | 'matches_played'
  | 'serve_total'
  | 'serve_errors'
  | 'serve_aces'
  | 'reception_total'
  | 'reception_positive'
  | 'reception_other'
  | 'reception_errors'
  | 'reception_percentage'
  | 'attack_total'
  | 'attack_points'
  | 'attack_unfinished'
  | 'attack_errors'
  | 'attack_blocked'
  | 'attack_percentage'
  | 'block_total'

type SortDirection = 'asc' | 'desc'

export default function Statistics() {
  const { data: playerStats, isLoading, error } = usePlayerStatistics()
  const { data: allMatchErrors } = useAllMatchErrors()
  const [filterText, setFilterText] = useState('')
  const [sortField, setSortField] = useState<SortField>('attack_points')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const sortedAndFilteredStats = useMemo(() => {
    if (!playerStats) return []

    let filtered = playerStats.filter(stat => {
      const playerName = stat.player?.full_name || stat.player?.username || ''
      return playerName.toLowerCase().includes(filterText.toLowerCase())
    })

    // Sortowanie
    filtered.sort((a, b) => {
      let aValue: number | string = 0
      let bValue: number | string = 0

      switch (sortField) {
        case 'player_name':
          aValue = a.player?.full_name || a.player?.username || ''
          bValue = b.player?.full_name || b.player?.username || ''
          break
        case 'matches_played':
          aValue = a.matches_played || 0
          bValue = b.matches_played || 0
          break
        case 'serve_total':
          aValue = a.serve_total || 0
          bValue = b.serve_total || 0
          break
        case 'serve_errors':
          aValue = a.serve_errors || 0
          bValue = b.serve_errors || 0
          break
        case 'serve_aces':
          aValue = a.serve_aces || 0
          bValue = b.serve_aces || 0
          break
        case 'reception_total':
          aValue = a.reception_total || 0
          bValue = b.reception_total || 0
          break
        case 'reception_positive':
          aValue = a.reception_positive || 0
          bValue = b.reception_positive || 0
          break
        case 'reception_other':
          aValue = a.reception_other || 0
          bValue = b.reception_other || 0
          break
        case 'reception_errors':
          aValue = a.reception_errors || 0
          bValue = b.reception_errors || 0
          break
        case 'reception_percentage':
          aValue = a.reception_total > 0 ? Math.round((a.reception_positive || 0) / a.reception_total * 100) : 0
          bValue = b.reception_total > 0 ? Math.round((b.reception_positive || 0) / b.reception_total * 100) : 0
          break
        case 'attack_total':
          aValue = a.attack_total || 0
          bValue = b.attack_total || 0
          break
        case 'attack_points':
          aValue = a.attack_points || 0
          bValue = b.attack_points || 0
          break
        case 'attack_unfinished':
          aValue = a.attack_unfinished || 0
          bValue = b.attack_unfinished || 0
          break
        case 'attack_errors':
          aValue = a.attack_errors || 0
          bValue = b.attack_errors || 0
          break
        case 'attack_blocked':
          aValue = a.attack_blocked || 0
          bValue = b.attack_blocked || 0
          break
        case 'attack_percentage':
          aValue = a.attack_total > 0 ? Math.round((a.attack_points || 0) / a.attack_total * 100) : 0
          bValue = b.attack_total > 0 ? Math.round((b.attack_points || 0) / b.attack_total * 100) : 0
          break
        case 'block_total':
          aValue = a.block_total || 0
          bValue = b.block_total || 0
          break
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })

    return filtered
  }, [playerStats, filterText, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }


  const getPlayerName = (stat: PlayerStatistics) => {
    return stat.player?.full_name || stat.player?.username || 'Nieznany zawodnik'
  }

  if (isLoading) {
    return (
      <div className="page statistics">
        <div className="loading">Ładowanie statystyk...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page statistics">
        <div className="error">Błąd przy ładowaniu statystyk</div>
      </div>
    )
  }

  return (
    <div className="page statistics">
      <h2>Statystyki ogólne</h2>
      <p className="statistics-subtitle">
        Łączne statystyki ze wszystkich meczów ligowych
      </p>

      <div className="statistics-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Szukaj zawodnika..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {!playerStats || playerStats.length === 0 ? (
        <div className="no-stats">
          <p>Brak statystyk do wyświetlenia</p>
        </div>
      ) : (
        <div className="match-stats-container">
          <div className="stats-table-wrapper">
            <table className="stats-table">
            <thead>
              <tr>
                <th 
                  rowSpan={2} 
                  className="player-col sortable"
                  onClick={() => handleSort('player_name')}
                >
                  GRACZ
                  {sortField === 'player_name' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  rowSpan={2}
                  className="sortable"
                  onClick={() => handleSort('matches_played')}
                >
                  MECZE
                  {sortField === 'matches_played' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th colSpan={3} className="category-header">ZAGRYWKA</th>
                <th colSpan={5} className="category-header">PRZYJĘCIE</th>
                <th colSpan={6} className="category-header">ATAK</th>
                <th 
                  rowSpan={2} 
                  className="category-header sortable"
                  onClick={() => handleSort('block_total')}
                >
                  BLOK
                  {sortField === 'block_total' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              </tr>
              <tr>
                <th 
                  className="sortable"
                  onClick={() => handleSort('serve_total')}
                >
                  TOTAL
                  {sortField === 'serve_total' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('serve_errors')}
                >
                  BŁĄD
                  {sortField === 'serve_errors' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('serve_aces')}
                >
                  AS
                  {sortField === 'serve_aces' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('reception_total')}
                >
                  TOTAL
                  {sortField === 'reception_total' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('reception_positive')}
                >
                  POZYTYWNE
                  {sortField === 'reception_positive' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('reception_other')}
                >
                  POZOSTAŁE
                  {sortField === 'reception_other' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('reception_errors')}
                >
                  BŁĄD
                  {sortField === 'reception_errors' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('reception_percentage')}
                >
                  %
                  {sortField === 'reception_percentage' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('attack_total')}
                >
                  TOTAL
                  {sortField === 'attack_total' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('attack_points')}
                >
                  PUNKTOWY
                  {sortField === 'attack_points' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('attack_unfinished')}
                >
                  NIESKOŃCZONY
                  {sortField === 'attack_unfinished' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('attack_errors')}
                >
                  BŁĄD
                  {sortField === 'attack_errors' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('attack_blocked')}
                >
                  ZABLOKOWANY
                  {sortField === 'attack_blocked' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('attack_percentage')}
                >
                  %
                  {sortField === 'attack_percentage' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredStats.map((stat) => {
                const calculateReceptionPercentage = () => {
                  if (!stat.reception_total || stat.reception_total === 0) return 0
                  return Math.round((stat.reception_positive || 0) / stat.reception_total * 100)
                }

                const calculateAttackPercentage = () => {
                  if (!stat.attack_total || stat.attack_total === 0) return 0
                  return Math.round((stat.attack_points || 0) / stat.attack_total * 100)
                }

                return (
                  <tr key={stat.player_id}>
                    <td className="player-name">{getPlayerName(stat)}</td>
                    <td>{stat.matches_played || 0}</td>
                    <td>{stat.serve_total || 0}</td>
                    <td>{stat.serve_errors || 0}</td>
                    <td>{stat.serve_aces || 0}</td>
                    <td>{stat.reception_total || 0}</td>
                    <td>{stat.reception_positive || 0}</td>
                    <td>{stat.reception_other || 0}</td>
                    <td>{stat.reception_errors || 0}</td>
                    <td>{calculateReceptionPercentage()}%</td>
                    <td>{stat.attack_total || 0}</td>
                    <td>{stat.attack_points || 0}</td>
                    <td>{stat.attack_unfinished || 0}</td>
                    <td>{stat.attack_errors || 0}</td>
                    <td>{stat.attack_blocked || 0}</td>
                    <td>{calculateAttackPercentage()}%</td>
                    <td>{stat.block_total || 0}</td>
                  </tr>
                )
              })}
              {sortedAndFilteredStats.length > 0 && (() => {
                // Oblicz sumy dla wszystkich statystyk
                const totals = sortedAndFilteredStats.reduce((acc, stat) => {
                  acc.serve_total += stat.serve_total || 0
                  acc.serve_errors += stat.serve_errors || 0
                  acc.serve_aces += stat.serve_aces || 0
                  acc.reception_total += stat.reception_total || 0
                  acc.reception_positive += stat.reception_positive || 0
                  acc.reception_other += stat.reception_other || 0
                  acc.reception_errors += stat.reception_errors || 0
                  acc.attack_total += stat.attack_total || 0
                  acc.attack_points += stat.attack_points || 0
                  acc.attack_unfinished += stat.attack_unfinished || 0
                  acc.attack_errors += stat.attack_errors || 0
                  acc.attack_blocked += stat.attack_blocked || 0
                  acc.block_total += stat.block_total || 0
                  return acc
                }, {
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
                })

                // Oblicz procenty dla sum
                const receptionPercentage = totals.reception_total > 0
                  ? Math.round((totals.reception_positive / totals.reception_total) * 100)
                  : 0

                const attackPercentage = totals.attack_total > 0
                  ? Math.round((totals.attack_points / totals.attack_total) * 100)
                  : 0

                return (
                  <tr className="totals-row">
                    <td className="player-name"><strong>RAZEM</strong></td>
                    <td><strong>-</strong></td>
                    <td><strong>{totals.serve_total}</strong></td>
                    <td><strong>{totals.serve_errors}</strong></td>
                    <td><strong>{totals.serve_aces}</strong></td>
                    <td><strong>{totals.reception_total}</strong></td>
                    <td><strong>{totals.reception_positive}</strong></td>
                    <td><strong>{totals.reception_other}</strong></td>
                    <td><strong>{totals.reception_errors}</strong></td>
                    <td><strong>{receptionPercentage}%</strong></td>
                    <td><strong>{totals.attack_total}</strong></td>
                    <td><strong>{totals.attack_points}</strong></td>
                    <td><strong>{totals.attack_unfinished}</strong></td>
                    <td><strong>{totals.attack_errors}</strong></td>
                    <td><strong>{totals.attack_blocked}</strong></td>
                    <td><strong>{attackPercentage}%</strong></td>
                    <td><strong>{totals.block_total}</strong></td>
                  </tr>
                )
              })()}
            </tbody>
          </table>
        </div>

        {/* Tabele błędów na dole */}
        {allMatchErrors && (
          <div className="match-errors-section">
            <div className="errors-tables-container">
              {/* Tabelka 1: Błędy przeciwników */}
              <div className="error-table-container">
                <h5>BŁĘDY PRZECIWNIKA</h5>
                <div className="errors-table-wrapper">
                  <table className="errors-table">
                    <thead>
                      <tr>
                        <th>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{allMatchErrors.opponent_errors_total || 0}</td>
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
                        <th>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{allMatchErrors.blocks_against_total || 0}</td>
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
                        <th>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="total-cell">
                          {(() => {
                            const ownTotal = allMatchErrors.own_errors_total || 0
                            const otherTotal = (allMatchErrors as any).own_errors_other_total || 0
                            return `${ownTotal}${otherTotal > 0 ? ` (+${otherTotal})` : ''}`
                          })()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  )
}
