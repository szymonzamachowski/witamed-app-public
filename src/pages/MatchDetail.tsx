import { useParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useMatch } from '../hooks/useMatches'
import { useMatchStatistics } from '../hooks/useMatchStatistics'
import { useMatchAttendance } from '../hooks/useMatchAttendance'
import MatchStatsTable from '../components/MatchStatsTable'
import './match-detail.css'

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: match, isLoading: matchLoading, error: matchError } = useMatch(id || '')
  const { data: statistics, isLoading: statsLoading } = useMatchStatistics(id || '')
  const { data: matchAttendance, isLoading: attendanceLoading } = useMatchAttendance(id || '')
  
  // Filtruj statystyki tylko dla obecnych zawodników
  const presentPlayerIds = useMemo(() => {
    if (!matchAttendance) return new Set<string>()
    return new Set(
      matchAttendance
        .filter(a => a.status === 'present')
        .map(a => a.player_id)
    )
  }, [matchAttendance])
  
  // Filtruj statystyki - tylko dla obecnych zawodników
  const filteredStatistics = useMemo(() => {
    if (!statistics) return []
    return statistics.filter(stat => presentPlayerIds.has(stat.player_id))
  }, [statistics, presentPlayerIds])

  if (matchLoading) {
    return (
      <div className="page match-detail">
        <div className="loading">Ładowanie meczu...</div>
      </div>
    )
  }

  if (matchError || !match) {
    return (
      <div className="page match-detail">
        <div className="error">Nie znaleziono meczu</div>
        <Link to="/matches" className="back-link">← Powrót do listy meczów</Link>
      </div>
    )
  }

  // Funkcja do wyciągnięcia ID z YouTube URL
  const getYouTubeId = (url: string | undefined): string | null => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const youtubeId = getYouTubeId(match.video_url)

  return (
    <div className="page match-detail">
      <Link to="/matches" className="back-link">← Powrót do listy meczów</Link>
      
      <div className="match-header">
        <h1>vs {match.opponent}</h1>
        <div className="match-info">
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
          {match.score && (
            <div className="match-score-large">{match.score}</div>
          )}
        </div>
      </div>

      {youtubeId && (
        <div className="match-video-section">
          <h2>Wideo z meczu</h2>
          <div className="video-container">
            <iframe
              width="100%"
              height="500"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="Wideo z meczu"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <div className="match-stats-section">
        <h2>Statystyki meczu</h2>
        {(statsLoading || attendanceLoading) ? (
          <div className="loading">Ładowanie statystyk...</div>
        ) : filteredStatistics && filteredStatistics.length > 0 ? (
          <>
            <MatchStatsTable statistics={filteredStatistics} matchErrors={match.match_errors} />
            {/* Debug info */}
            {import.meta.env.DEV && (
              <details style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                <summary>Debug info</summary>
                <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
                  {JSON.stringify({ 
                    statisticsCount: filteredStatistics.length, 
                    allStatisticsCount: statistics?.length || 0,
                    presentPlayersCount: presentPlayerIds.size,
                    statistics: filteredStatistics, 
                    matchErrors: match.match_errors 
                  }, null, 2)}
                </pre>
              </details>
            )}
          </>
        ) : (
          <div className="no-stats">
            <p>Brak statystyk dla tego meczu</p>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
              {statistics && statistics.length > 0 && filteredStatistics.length === 0
                ? 'Brak obecnych zawodników na tym meczu lub statystyki nie zostały jeszcze dodane dla obecnych zawodników.'
                : 'Dodaj statystyki w Panelu Administratora → Zarządzanie statystykami'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

