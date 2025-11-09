import { Link } from 'react-router-dom'
import { useMatches } from '../hooks/useMatches'
import './matches.css'

export default function Matches() {
  const { data: matches, isLoading, error } = useMatches()

  // Debug
  console.log('Matches component - isLoading:', isLoading, 'error:', error, 'matches:', matches)

  if (isLoading) {
    return (
      <div className="page matches">
        <div className="loading">Ładowanie meczów...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page matches">
        <h2>Rozegrane mecze</h2>
        <div className="error">
          Błąd przy ładowaniu meczów: {error instanceof Error ? error.message : 'Nieznany błąd'}
        </div>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '1rem' }}>
          Sprawdź konsolę przeglądarki (F12) aby zobaczyć szczegóły błędu.
        </p>
      </div>
    )
  }

  // Filtruj tylko mecze z wynikiem (rozegrane)
  const playedMatches = matches?.filter(match => match.score && match.score.trim() !== '') || []

  if (!matches || matches.length === 0) {
    return (
      <div className="page matches">
        <h2>Rozegrane mecze</h2>
        <p>Brak meczów do wyświetlenia.</p>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '1rem', fontSize: '0.9rem' }}>
          Upewnij się, że uruchomiłeś skrypt SQL w Supabase SQL Editor.
        </p>
      </div>
    )
  }

  if (playedMatches.length === 0) {
    return (
      <div className="page matches">
        <h2>Rozegrane mecze</h2>
        <p>Brak rozegranych meczów do wyświetlenia.</p>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '1rem', fontSize: '0.9rem' }}>
          Mecze bez wyniku nie są wyświetlane w tej zakładce.
        </p>
      </div>
    )
  }

  return (
    <div className="page matches">
      <h2>Rozegrane mecze</h2>
      <div className="matches-list">
        {playedMatches.map((match) => (
          <Link key={match.id} to={`/matches/${match.id}`} className="match-card">
            <div className="match-card-header">
              <h3>vs {match.opponent}</h3>
              {match.score && (
                <div className="match-score">{match.score}</div>
              )}
            </div>
            <div className="match-card-meta">
              <div className="match-date">
                {new Date(match.date).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Europe/Warsaw'
                })}
              </div>
              <div className="match-location">{match.location}</div>
            </div>
            {match.video_url && (
              <div className="match-video-indicator">
                📹 Wideo dostępne
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
