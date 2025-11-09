import { useState, useMemo } from 'react'
import { usePlayerStatistics } from '../hooks/usePlayerStatistics'
import type { PlayerStatistics } from '../hooks/usePlayerStatistics'
import './statistics.css'

type SortField = 
  | 'player_name'
  | 'matches_played'
  | 'total_points'
  | 'total_aces'
  | 'total_blocks'
  | 'serve_percentage'
  | 'reception_percentage'
  | 'attack_percentage'
  | 'block_total'

type SortDirection = 'asc' | 'desc'

export default function Statistics() {
  const { data: playerStats, isLoading, error } = usePlayerStatistics()
  const [sortField, setSortField] = useState<SortField>('total_points')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterText, setFilterText] = useState('')

  const sortedAndFilteredStats = useMemo(() => {
    if (!playerStats) return []

    let filtered = playerStats.filter(stat => {
      const playerName = stat.player?.full_name || stat.player?.username || ''
      return playerName.toLowerCase().includes(filterText.toLowerCase())
    })

    filtered.sort((a, b) => {
      let aValue: number | string = 0
      let bValue: number | string = 0

      switch (sortField) {
        case 'player_name':
          aValue = a.player?.full_name || a.player?.username || ''
          bValue = b.player?.full_name || b.player?.username || ''
          break
        case 'matches_played':
          aValue = a.matches_played
          bValue = b.matches_played
          break
        case 'total_points':
          aValue = a.total_points
          bValue = b.total_points
          break
        case 'total_aces':
          aValue = a.total_aces
          bValue = b.total_aces
          break
        case 'total_blocks':
          aValue = a.total_blocks
          bValue = b.total_blocks
          break
        case 'serve_percentage':
          aValue = a.serve_percentage
          bValue = b.serve_percentage
          break
        case 'reception_percentage':
          aValue = a.reception_percentage
          bValue = b.reception_percentage
          break
        case 'attack_percentage':
          aValue = a.attack_percentage
          bValue = b.attack_percentage
          break
        case 'block_total':
          aValue = a.block_total
          bValue = b.block_total
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
  }, [playerStats, sortField, sortDirection, filterText])

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
        <div className="statistics-table-container">
          <table className="statistics-table">
            <thead>
              <tr>
                <th 
                  className="sortable"
                  onClick={() => handleSort('player_name')}
                >
                  Zawodnik
                  {sortField === 'player_name' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('matches_played')}
                >
                  Mecze
                  {sortField === 'matches_played' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('total_points')}
                >
                  Punkty
                  {sortField === 'total_points' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('total_aces')}
                >
                  Asy
                  {sortField === 'total_aces' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('total_blocks')}
                >
                  Bloki
                  {sortField === 'total_blocks' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th>Zagrywka</th>
                <th>Przyjęcie</th>
                <th>Atak</th>
                <th>Blok</th>
              </tr>
              <tr className="sub-header">
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th>
                  <div className="sub-header-row">
                    <span>Total</span>
                    <span>Błędy</span>
                    <span>Asy</span>
                    <span>%</span>
                  </div>
                </th>
                <th>
                  <div className="sub-header-row">
                    <span>Total</span>
                    <span>Pozytywne</span>
                    <span>Błędy</span>
                    <span>%</span>
                  </div>
                </th>
                <th>
                  <div className="sub-header-row">
                    <span>Total</span>
                    <span>Punkty</span>
                    <span>Błędy</span>
                    <span>%</span>
                  </div>
                </th>
                <th>
                  <div className="sub-header-row">
                    <span>Total</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredStats.map((stat, index) => (
                <tr key={stat.player_id}>
                  <td className="player-name">
                    <span className="rank">{index + 1}.</span>
                    {getPlayerName(stat)}
                  </td>
                  <td>{stat.matches_played}</td>
                  <td className="highlight">{stat.total_points}</td>
                  <td>{stat.total_aces}</td>
                  <td>{stat.total_blocks}</td>
                  <td>
                    <div className="stat-row">
                      <span>{stat.serve_total}</span>
                      <span>{stat.serve_errors}</span>
                      <span>{stat.serve_aces}</span>
                      <span className="percentage">{stat.serve_percentage}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="stat-row">
                      <span>{stat.reception_total}</span>
                      <span>{stat.reception_positive}</span>
                      <span>{stat.reception_errors}</span>
                      <span className="percentage">{stat.reception_percentage}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="stat-row">
                      <span>{stat.attack_total}</span>
                      <span>{stat.attack_points}</span>
                      <span>{stat.attack_errors}</span>
                      <span className="percentage">{stat.attack_percentage}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="stat-row">
                      <span>{stat.block_total}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
