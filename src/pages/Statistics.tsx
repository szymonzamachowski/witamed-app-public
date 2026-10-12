import { useMemo } from 'react'
import { usePlayerStatistics } from '../hooks/usePlayerStatistics'
import { useAllMatchErrors } from '../hooks/useAllMatchErrors'
import StatsBoard, { type StatsRow } from '../components/StatsBoard'
import './statistics.css'

export default function Statistics() {
  const { data: playerStats, isLoading, error } = usePlayerStatistics()
  const { data: allMatchErrors } = useAllMatchErrors()

  const rows = useMemo<StatsRow[]>(
    () =>
      (playerStats ?? []).map(stat => ({
        id: stat.player_id,
        name: stat.player?.full_name || stat.player?.username || 'Nieznany zawodnik',
        matches: stat.matches_played,
        stats: stat,
        previous: stat.before_last_match,
      })),
    [playerStats]
  )

  const ownTotal = allMatchErrors?.own_errors_total || 0
  const otherTotal = (allMatchErrors as { own_errors_other_total?: number } | undefined)?.own_errors_other_total || 0

  return (
    <div className="page statistics">
      <header className="statistics-header">
        <h1>Statystyki</h1>
        <p className="muted">Łącznie ze wszystkich meczów ligowych w sezonie.</p>
      </header>

      {isLoading ? (
        <p className="muted">Ładowanie statystyk…</p>
      ) : error ? (
        <div className="card statistics-empty">
          <p className="statistics-error">Nie udało się wczytać statystyk. Spróbuj odświeżyć stronę.</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="card statistics-empty">
          <p className="muted">Brak statystyk w tym sezonie.</p>
        </div>
      ) : (
        <>
          <StatsBoard rows={rows} showMatches searchable />

          {allMatchErrors && (
            <section className="statistics-errors">
              <h2>Błędy w sezonie</h2>
              <div className="error-summary">
                <div className="card error-summary-tile">
                  <span className="label">Błędy przeciwnika</span>
                  <span className="display">{allMatchErrors.opponent_errors_total || 0}</span>
                </div>
                <div className="card error-summary-tile">
                  <span className="label">Wybloki</span>
                  <span className="display">{allMatchErrors.blocks_against_total || 0}</span>
                </div>
                <div className="card error-summary-tile">
                  <span className="label">Błędy własne</span>
                  <span className="display">
                    {ownTotal}
                    {otherTotal > 0 && <small> (+{otherTotal})</small>}
                  </span>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
