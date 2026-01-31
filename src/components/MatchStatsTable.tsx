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
    ? Math.round((totals.attack_points / totals.attack_total) * 100)
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
    // Procent ataku = punkty punktowe / total (skuteczność)
    return Math.round((stat.attack_points || 0) / stat.attack_total * 100)
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

      {matchErrors && (() => {
        // Określ liczbę setów dla każdej kategorii (min 3, max 5)
        // Sprawdź najwyższy set z wartością (lub minimum 3)
        const getVisibleSets = (prefix: string) => {
          let maxSet = 0
          for (let set = 1; set <= 5; set++) {
            const key = `${prefix}_set${set}` as keyof MatchErrors
            if (matchErrors[key] !== undefined && matchErrors[key] !== null) {
              maxSet = set
            }
            // Dla błędów własnych sprawdź też błędy inne
            if (prefix === 'own_errors') {
              const otherKey = `own_errors_other_set${set}` as keyof MatchErrors
              if (matchErrors[otherKey] !== undefined && matchErrors[otherKey] !== null) {
                maxSet = Math.max(maxSet, set)
              }
            }
          }
          return Math.max(3, Math.min(5, maxSet || 3))
        }

        const opponentSets = getVisibleSets('opponent_errors')
        const blocksSets = getVisibleSets('blocks_against')
        const ownSets = getVisibleSets('own_errors')

        return (
          <div className="match-errors-section">
            <div className="errors-tables-container">
              {/* Tabelka 1: Błędy przeciwników */}
              <div className="error-table-container">
                <h5>BŁĘDY PRZECIWNIKA</h5>
                <div className="errors-table-wrapper">
                  <table className="errors-table">
                    <thead>
                      <tr>
                        {Array.from({ length: opponentSets }, (_, i) => i + 1).map(set => (
                          <th key={set}>{set} SET</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {Array.from({ length: opponentSets }, (_, i) => i + 1).map(set => {
                          const value = matchErrors[`opponent_errors_set${set}` as keyof MatchErrors] as number | undefined
                          return (
                            <td key={set}>{value ?? 0}</td>
                          )
                        })}
                      </tr>
                      <tr className="total-row">
                        <td colSpan={opponentSets} className="total-cell">
                          TOTAL: {Array.from({ length: opponentSets }, (_, i) => i + 1).reduce((sum, set) => 
                            sum + ((matchErrors[`opponent_errors_set${set}` as keyof MatchErrors] as number) || 0), 0
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
                        {Array.from({ length: blocksSets }, (_, i) => i + 1).map(set => (
                          <th key={set}>{set} SET</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {Array.from({ length: blocksSets }, (_, i) => i + 1).map(set => {
                          const value = matchErrors[`blocks_against_set${set}` as keyof MatchErrors] as number | undefined
                          return (
                            <td key={set}>{value ?? 0}</td>
                          )
                        })}
                      </tr>
                      <tr className="total-row">
                        <td colSpan={blocksSets} className="total-cell">
                          TOTAL: {Array.from({ length: blocksSets }, (_, i) => i + 1).reduce((sum, set) => 
                            sum + ((matchErrors[`blocks_against_set${set}` as keyof MatchErrors] as number) || 0), 0
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
                        {Array.from({ length: ownSets }, (_, i) => i + 1).map(set => (
                          <th key={set}>{set} SET</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {Array.from({ length: ownSets }, (_, i) => i + 1).map(set => {
                          const errors = matchErrors[`own_errors_set${set}` as keyof MatchErrors] as number | undefined
                          return (
                            <td key={set}>{errors ?? 0}</td>
                          )
                        })}
                      </tr>
                      <tr className="error-category">
                        <td colSpan={ownSets} className="error-category-label">INNE</td>
                      </tr>
                      <tr>
                        {Array.from({ length: ownSets }, (_, i) => i + 1).map(set => {
                          const errors = matchErrors[`own_errors_other_set${set}` as keyof MatchErrors] as number | undefined
                          return (
                            <td key={set}>{errors ?? 0}</td>
                          )
                        })}
                      </tr>
                      <tr className="total-row">
                        <td colSpan={ownSets} className="total-cell">
                          TOTAL: {(() => {
                            const ownTotal = Array.from({ length: ownSets }, (_, i) => i + 1).reduce((sum, set) => 
                              sum + ((matchErrors[`own_errors_set${set}` as keyof MatchErrors] as number) || 0), 0
                            )
                            const otherTotal = Array.from({ length: ownSets }, (_, i) => i + 1).reduce((sum, set) => 
                              sum + ((matchErrors[`own_errors_other_set${set}` as keyof MatchErrors] as number) || 0), 0
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
          </div>
        )
      })()}
    </div>
  )
}

