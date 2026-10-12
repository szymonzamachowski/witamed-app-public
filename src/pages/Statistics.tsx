import { useMemo } from 'react'
import { usePlayerStatistics } from '../hooks/usePlayerStatistics'
import { useAllMatchErrors } from '../hooks/useAllMatchErrors'
import StatsBoard, { type StatsRow } from '../components/StatsBoard'
import TeamSummary from '../components/TeamSummary'
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
        series: stat.per_match,
      })),
    [playerStats]
  )

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
              <h2>Drużyna w sezonie</h2>
              <TeamSummary
                players={rows.map(r => r.stats)}
                opponentErrors={allMatchErrors.opponent_errors_total || 0}
                ownByCategory={allMatchErrors.own_by_category}
                ownOther={allMatchErrors.own_errors_other_total || 0}
              />
              <p className="muted statistics-blocks">Wybloki w sezonie: <strong>{allMatchErrors.blocks_against_total || 0}</strong></p>
            </section>
          )}
        </>
      )}
    </div>
  )
}
