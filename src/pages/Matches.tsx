import { Link } from 'react-router-dom'
import { VideoCameraIcon, MapPinIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useMatches } from '../hooks/useMatches'
import { parseMatchScore, matchOutcome, OUTCOME_LABEL } from '../utils/matchScore'
import './matches.css'

export default function Matches() {
  const { data: matches, isLoading, error } = useMatches()

  // Tylko mecze z wynikiem (rozegrane); mecze bez wyniku są w Obecności / Terminarzu
  const playedMatches = matches?.filter(match => match.score && match.score.trim() !== '') ?? []

  return (
    <div className="page matches">
      <header className="matches-header">
        <h1>Mecze</h1>
        <p className="muted">Rozegrane mecze ligowe — kliknij, żeby zobaczyć wideo i statystyki.</p>
      </header>

      {isLoading ? (
        <p className="muted">Ładowanie meczów…</p>
      ) : error ? (
        <div className="card matches-empty">
          <p className="matches-error">Nie udało się wczytać meczów. Spróbuj odświeżyć stronę.</p>
        </div>
      ) : playedMatches.length === 0 ? (
        <div className="card matches-empty">
          <p className="muted">Brak rozegranych meczów w tym sezonie.</p>
        </div>
      ) : (
        <div className="matches-list">
          {playedMatches.map(match => {
            const result = parseMatchScore(match.score)
            const outcome = matchOutcome(result)
            const date = new Date(match.date)

            return (
              <Link key={match.id} to={`/matches/${match.id}`} className="card match-card">
                <div className={`match-result-badge ${outcome ? `is-${outcome}` : ''}`}>
                  <span className="display">{result ? `${result.ours}:${result.theirs}` : '–'}</span>
                  <span className="match-result-label">{outcome ? OUTCOME_LABEL[outcome] : 'Wynik'}</span>
                </div>

                <div className="match-card-body">
                  <h2 className="match-card-title display">vs {match.opponent}</h2>
                  <div className="match-card-meta muted">
                    <span>
                      {date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Warsaw' })}
                      {', '}
                      {date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' })}
                    </span>
                    {match.location && (
                      <span><MapPinIcon aria-hidden="true" />{match.location}</span>
                    )}
                  </div>
                  {result?.sets && <div className="match-card-sets muted">{result.sets}</div>}
                  {match.video_url && (
                    <span className="match-video-chip"><VideoCameraIcon aria-hidden="true" />Wideo</span>
                  )}
                </div>

                <ChevronRightIcon className="match-card-arrow" aria-hidden="true" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
