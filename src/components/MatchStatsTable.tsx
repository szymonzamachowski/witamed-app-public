import type { MatchStatisticsWithPlayer } from '../hooks/useMatchStatistics'
import type { MatchErrors } from '../types/database'
import './match-stats-table.css'

type Props = {
  statistics: MatchStatisticsWithPlayer[]
  matchErrors?: MatchErrors
}

export default function MatchStatsTable({ statistics, matchErrors }: Props) {
  // Debug
  console.log('MatchStatsTable - statistics:', statistics)
  console.log('MatchStatsTable - matchErrors:', matchErrors)

  if (!statistics || statistics.length === 0) {
    return (
      <div className="no-stats">
        <p>Brak statystyk do wyświetlenia</p>
      </div>
    )
  }

  // Oblicz sumy dla każdej kategorii
  const totals = statistics.reduce((acc, stat) => {
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
    ? Math.round(((totals.attack_points - totals.attack_errors) / totals.attack_total) * 100)
    : 0

  const getPlayerName = (stat: MatchStatisticsWithPlayer) => {
    return stat.profiles?.full_name || stat.profiles?.username || 'Nieznany zawodnik'
  }

  const calculateReceptionPercentage = (stat: MatchStatisticsWithPlayer) => {
    if (!stat.reception_total || stat.reception_total === 0) return 0
    return Math.round((stat.reception_positive || 0) / stat.reception_total * 100)
  }

  const calculateAttackPercentage = (stat: MatchStatisticsWithPlayer) => {
    if (!stat.attack_total || stat.attack_total === 0) return 0
    return Math.round(((stat.attack_points || 0) - (stat.attack_errors || 0)) / stat.attack_total * 100)
  }

  return (
    <div className="match-stats-container">
      <div className="stats-table-wrapper">
        <table className="stats-table">
          <thead>
            <tr>
              <th rowSpan={2} className="player-col">GRACZ</th>
              <th colSpan={3} className="category-header">ZAGRYWKA</th>
              <th colSpan={5} className="category-header">PRZYJĘCIE</th>
              <th colSpan={6} className="category-header">ATAK</th>
              <th rowSpan={2} className="category-header">BLOK</th>
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
            {statistics.map((stat) => (
              <tr key={stat.id}>
                <td className="player-name">{getPlayerName(stat)}</td>
                <td>{stat.serve_total || 0}</td>
                <td>{stat.serve_errors || 0}</td>
                <td>{stat.serve_aces || 0}</td>
                <td>{stat.reception_total || 0}</td>
                <td>{stat.reception_positive || 0}</td>
                <td>{stat.reception_other || 0}</td>
                <td>{stat.reception_errors || 0}</td>
                <td>{calculateReceptionPercentage(stat)}%</td>
                <td>{stat.attack_total || 0}</td>
                <td>{stat.attack_points || 0}</td>
                <td>{stat.attack_unfinished || 0}</td>
                <td>{stat.attack_errors || 0}</td>
                <td>{stat.attack_blocked || 0}</td>
                <td>{calculateAttackPercentage(stat)}%</td>
                <td>{stat.block_total || 0}</td>
              </tr>
            ))}
            <tr className="totals-row">
              <td className="player-name"><strong>RAZEM</strong></td>
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
          </tbody>
        </table>
      </div>

      {matchErrors && (
        <div className="match-errors-section">
          <div className="errors-group">
            <h3>BŁĘDY PRZECIWNIKA</h3>
            <div className="errors-table">
              <div className="error-row">
                <span className="error-label">TOTAL:</span>
                <span className="error-value">{matchErrors.opponent_errors_total || 0}</span>
              </div>
              {[1, 2, 3, 4, 5].map(set => {
                const value = matchErrors[`opponent_errors_set${set}` as keyof MatchErrors] as number | undefined
                if (value === undefined) return null
                return (
                  <div key={set} className="error-row">
                    <span className="error-label">{set} SET:</span>
                    <span className="error-value">{value}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="errors-group">
            <h3>WYBLOKI</h3>
            <div className="errors-table">
              <div className="error-row">
                <span className="error-label">TOTAL:</span>
                <span className="error-value">{matchErrors.blocks_against_total || 0}</span>
              </div>
              {[1, 2, 3, 4, 5].map(set => {
                const value = matchErrors[`blocks_against_set${set}` as keyof MatchErrors] as number | undefined
                if (value === undefined) return null
                return (
                  <div key={set} className="error-row">
                    <span className="error-label">{set} SET:</span>
                    <span className="error-value">{value}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="errors-group">
            <h3>BŁĘDY WŁASNE</h3>
            <div className="errors-table">
              <div className="error-row">
                <span className="error-label">TOTAL:</span>
                <span className="error-value">{matchErrors.own_errors_total || 0}</span>
              </div>
              {[1, 2, 3, 4, 5].map(set => {
                const errors = matchErrors[`own_errors_set${set}` as keyof MatchErrors] as number | undefined
                const other = matchErrors[`own_errors_other_set${set}` as keyof MatchErrors] as number | undefined
                if (errors === undefined) return null
                return (
                  <div key={set} className="error-row">
                    <span className="error-label">{set} SET:</span>
                    <span className="error-value">{errors}</span>
                    {other !== undefined && other > 0 && (
                      <span className="error-other">, INNE: {other}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

