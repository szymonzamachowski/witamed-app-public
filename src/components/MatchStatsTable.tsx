import type { MatchStatisticsWithPlayer } from '../hooks/useMatchStatistics'
import type { MatchErrors } from '../types/database'
import StatsBoard, { type StatsRow } from './StatsBoard'
import TeamSummary from './TeamSummary'
import '../styles/data-table.css'

type Props = {
  statistics: MatchStatisticsWithPlayer[]
  matchErrors?: MatchErrors
}

export default function MatchStatsTable({ statistics, matchErrors }: Props) {
  if (!statistics || statistics.length === 0) {
    return <p className="muted">Brak statystyk do wyświetlenia.</p>
  }

  const rows: StatsRow[] = statistics.map(stat => ({
    id: stat.id,
    name: stat.profiles?.full_name || stat.profiles?.username || 'Nieznany zawodnik',
    stats: stat,
  }))

  return (
    <div className="match-stats">
      <StatsBoard rows={rows} />

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

        const sum = (prefix: string, sets: number) =>
          Array.from({ length: sets }, (_, i) => i + 1).reduce(
            (total, set) => total + ((matchErrors[`${prefix}_set${set}` as keyof MatchErrors] as number) || 0),
            0
          )
        const otherTotal = sum('own_errors_other', ownSets)
        const byCategory = {
          own_serve: sum('own_serve', ownSets),
          own_reception: sum('own_reception', ownSets),
          own_attack: sum('own_attack', ownSets),
          own_blocked: sum('own_blocked', ownSets),
        }
        const categoriesEntered = Object.values(byCategory).some(v => v > 0)
        const ownTotal = categoriesEntered ? Object.values(byCategory).reduce((a, b) => a + b, 0) : sum('own_errors', ownSets)

        return (
          <>
          <h3 className="match-team-title display">Drużyna</h3>
          <TeamSummary
            players={statistics}
            opponentErrors={sum('opponent_errors', opponentSets)}
            ownByCategory={categoriesEntered ? byCategory : null}
            ownOther={otherTotal}
          />
          <div className="match-errors-grid">
            <ErrorTable title="Błędy przeciwnika" sets={opponentSets} rows={[{ prefix: 'opponent_errors' }]} matchErrors={matchErrors} total={`${sum('opponent_errors', opponentSets)}`} />
            <ErrorTable title="Wybloki" sets={blocksSets} rows={[{ prefix: 'blocks_against' }]} matchErrors={matchErrors} total={`${sum('blocks_against', blocksSets)}`} />
            <ErrorTable
              title="Błędy własne"
              sets={ownSets}
              rows={
                categoriesEntered
                  ? [
                      { prefix: 'own_serve', label: 'Serwis' },
                      { prefix: 'own_reception', label: 'Przyjęcie' },
                      { prefix: 'own_attack', label: 'Atak' },
                      { prefix: 'own_blocked', label: 'Zablok.' },
                      { prefix: 'own_errors_other', label: 'Inne' },
                    ]
                  : [{ prefix: 'own_errors' }, { prefix: 'own_errors_other', label: 'Inne' }]
              }
              matchErrors={matchErrors}
              total={`${ownTotal}${otherTotal > 0 ? ` (+${otherTotal})` : ''}`}
            />
          </div>
          </>
        )
      })()}
    </div>
  )
}


function ErrorTable({
  title,
  sets,
  rows,
  matchErrors,
  total,
}: {
  title: string
  sets: number
  rows: { prefix: string; label?: string }[]
  matchErrors: MatchErrors
  total: string
}) {
  const setNumbers = Array.from({ length: sets }, (_, i) => i + 1)

  return (
    <div className="card error-card">
      <div className="error-card-head">
        <h3 className="label">{title}</h3>
        <span className="error-card-total display">{total}</span>
      </div>
      <table className="set-table">
        <thead>
          <tr>
            {rows.length > 1 && <th aria-label="Rodzaj" />}
            {setNumbers.map(set => (
              <th key={set}>{set} set</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.prefix}>
              {rows.length > 1 && <th scope="row">{row.label ?? 'Błędy'}</th>}
              {setNumbers.map(set => (
                <td key={set}>{(matchErrors[`${row.prefix}_set${set}` as keyof MatchErrors] as number | undefined) ?? 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
