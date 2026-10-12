import { useParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import { ArrowLeftIcon, MapPinIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { useMatch } from '../hooks/useMatches'
import { useMatchStatistics } from '../hooks/useMatchStatistics'
import { useMatchAttendance } from '../hooks/useMatchAttendance'
import MatchStatsTable from '../components/MatchStatsTable'
import { getYouTubeEmbedUrl } from '../utils/youtube'
import { parseMatchScore, matchOutcome, OUTCOME_LABEL } from '../utils/matchScore'
import './match-detail.css'

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: match, isLoading: matchLoading, error: matchError } = useMatch(id || '')
  const { data: statistics, isLoading: statsLoading } = useMatchStatistics(id || '')
  const { data: matchAttendance, isLoading: attendanceLoading } = useMatchAttendance(id || '')

  // Statystyki pokazujemy tylko dla zawodników obecnych na meczu
  const presentPlayerIds = useMemo(() => {
    if (!matchAttendance) return new Set<string>()
    return new Set(matchAttendance.filter(a => a.status === 'present').map(a => a.player_id))
  }, [matchAttendance])

  const filteredStatistics = useMemo(() => {
    if (!statistics) return []
    return statistics.filter(stat => presentPlayerIds.has(stat.player_id))
  }, [statistics, presentPlayerIds])

  const backLink = (
    <Link to="/matches" className="back-link">
      <ArrowLeftIcon aria-hidden="true" />
      Wszystkie mecze
    </Link>
  )

  if (matchLoading) {
    return (
      <div className="page match-detail">
        <p className="muted">Ładowanie meczu…</p>
      </div>
    )
  }

  if (matchError || !match) {
    return (
      <div className="page match-detail">
        {backLink}
        <div className="card match-detail-empty">
          <p className="muted">Nie znaleziono meczu.</p>
        </div>
      </div>
    )
  }

  const youtubeEmbedUrl = getYouTubeEmbedUrl(match.video_url)
  const result = parseMatchScore(match.score)
  const outcome = matchOutcome(result)
  const date = new Date(match.date)

  return (
    <div className="page match-detail">
      {backLink}

      <header className="card match-hero">
        <div className="match-hero-info">
          <span className="label">Mecz ligowy</span>
          <h1 className="match-hero-title">vs {match.opponent}</h1>
          <div className="match-hero-meta muted">
            <span>
              {date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Warsaw' })}
              {', '}
              {date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' })}
            </span>
            {match.location && <span><MapPinIcon aria-hidden="true" />{match.location}</span>}
          </div>
        </div>

        {result ? (
          <div className={`match-hero-score is-${outcome}`}>
            <span className="display">{result.ours}:{result.theirs}</span>
            <span className="match-hero-result">{outcome && OUTCOME_LABEL[outcome]}</span>
            {result.sets && <span className="match-hero-sets muted">{result.sets}</span>}
          </div>
        ) : match.score ? (
          <div className="match-hero-score"><span className="display">{match.score}</span></div>
        ) : null}
      </header>

      {match.video_url && (
        <section className="match-section">
          <h2>Wideo</h2>
          {youtubeEmbedUrl ? (
            <div className="video-frame">
              <iframe
                src={youtubeEmbedUrl}
                title="Wideo z meczu"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="card">
              <p className="muted">Nie udało się osadzić wideo, ale możesz otworzyć nagranie bezpośrednio.</p>
            </div>
          )}
          <a href={match.video_url} target="_blank" rel="noopener noreferrer" className="video-link">
            Otwórz na YouTube
            <ArrowTopRightOnSquareIcon aria-hidden="true" />
          </a>
        </section>
      )}

      <section className="match-section">
        <h2>Statystyki meczu</h2>
        {statsLoading || attendanceLoading ? (
          <p className="muted">Ładowanie statystyk…</p>
        ) : filteredStatistics.length > 0 ? (
          <MatchStatsTable statistics={filteredStatistics} matchErrors={match.match_errors} />
        ) : (
          <div className="card match-detail-empty">
            <p>Brak statystyk dla tego meczu.</p>
            <p className="muted">
              {statistics && statistics.length > 0
                ? 'Statystyki nie zostały jeszcze dodane dla obecnych zawodników.'
                : 'Statystyki pojawią się, gdy admin je doda.'}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
