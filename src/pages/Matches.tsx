import { useMatches } from '../hooks/useMatches'
import MatchCard from '../components/MatchCard'
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
          {playedMatches.map(match => (
            <MatchCard key={match.id} match={match} to={`/matches/${match.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}
