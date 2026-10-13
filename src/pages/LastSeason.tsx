import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LAST_SEASON, useArchiveMatches, useArchiveSeasonStats } from '../hooks/useSeasonArchive'
import StatsBoard, { type StatsRow } from '../components/StatsBoard'
import TeamSummary from '../components/TeamSummary'
import MatchCard from '../components/MatchCard'
import { parseMatchScore, matchOutcome } from '../utils/matchScore'
import './statistics.css'
import './matches.css'
import './last-season.css'

type Tab = 'statystyki' | 'mecze'

export default function LastSeason() {
  // Zakładka w adresie, żeby „wstecz” ze szczegółów meczu wracało na listę meczów
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = searchParams.get('tab') === 'mecze' ? 'mecze' : 'statystyki'

  const { data: matches, isLoading: matchesLoading, error: matchesError } = useArchiveMatches(LAST_SEASON)
  const { data: season, isLoading: statsLoading, error: statsError } = useArchiveSeasonStats(LAST_SEASON)

  const rows = useMemo<StatsRow[]>(
    () =>
      (season?.players ?? []).map(stat => ({
        id: stat.player_id,
        name: stat.player?.full_name || 'Nieznany zawodnik',
        matches: stat.matches_played,
        stats: stat,
        previous: stat.before_last_match,
        series: stat.per_match,
      })),
    [season]
  )

  // Bilans sezonu: wygrane / remisy / porażki
  const record = useMemo(() => {
    const counts = { win: 0, draw: 0, loss: 0 }
    matches?.forEach(match => {
      const outcome = matchOutcome(parseMatchScore(match.score))
      if (outcome) counts[outcome] += 1
    })
    return counts
  }, [matches])

  return (
    <div className="page statistics last-season">
      <header className="statistics-header">
        <h1>Sezon {LAST_SEASON}</h1>
        <p className="muted">Archiwum zeszłego sezonu — statystyki i wszystkie rozegrane mecze.</p>
      </header>

      {matches && matches.length > 0 && (
        <div className="last-season-record">
          <div className="card last-season-kpi">
            <span className="display">{matches.length}</span>
            <span className="label">Mecze</span>
          </div>
          <div className="card last-season-kpi is-win">
            <span className="display">{record.win}</span>
            <span className="label">Wygrane</span>
          </div>
          <div className="card last-season-kpi">
            <span className="display">{record.draw}</span>
            <span className="label">Remisy</span>
          </div>
          <div className="card last-season-kpi is-loss">
            <span className="display">{record.loss}</span>
            <span className="label">Porażki</span>
          </div>
        </div>
      )}

      <div className="segmented last-season-tabs" role="tablist" aria-label="Zeszły sezon">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'statystyki'}
          className={tab === 'statystyki' ? 'active' : ''}
          onClick={() => setSearchParams({}, { replace: true })}
        >
          Statystyki
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'mecze'}
          className={tab === 'mecze' ? 'active' : ''}
          onClick={() => setSearchParams({ tab: 'mecze' }, { replace: true })}
        >
          Mecze{matches ? ` (${matches.length})` : ''}
        </button>
      </div>

      {tab === 'statystyki' ? (
        statsLoading ? (
          <p className="muted">Ładowanie statystyk…</p>
        ) : statsError ? (
          <div className="card statistics-empty">
            <p className="statistics-error">Nie udało się wczytać statystyk. Spróbuj odświeżyć stronę.</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="card statistics-empty">
            <p className="muted">Brak statystyk z tego sezonu.</p>
          </div>
        ) : (
          <>
            <StatsBoard rows={rows} showMatches searchable />

            {season && (
              <section className="statistics-errors">
                <h2>Drużyna w sezonie</h2>
                <TeamSummary
                  players={rows.map(r => r.stats)}
                  opponentErrors={season.errors.opponent_errors_total}
                  ownByCategory={season.errors.own_by_category}
                  ownOther={season.errors.own_errors_other_total}
                />
                <p className="muted statistics-blocks">Wybloki w sezonie: <strong>{season.errors.blocks_against_total}</strong></p>
              </section>
            )}
          </>
        )
      ) : matchesLoading ? (
        <p className="muted">Ładowanie meczów…</p>
      ) : matchesError ? (
        <div className="card matches-empty">
          <p className="matches-error">Nie udało się wczytać meczów. Spróbuj odświeżyć stronę.</p>
        </div>
      ) : (
        <div className="matches-list last-season-matches">
          {matches?.map(match => (
            <MatchCard key={match.id} match={match} to={`/zeszly-sezon/${match.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}
