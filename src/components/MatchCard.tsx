import { Link } from 'react-router-dom'
import { VideoCameraIcon, MapPinIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import type { Match } from '../types/database'
import { parseMatchScore, matchOutcome, OUTCOME_LABEL } from '../utils/matchScore'
import '../pages/matches.css'

type MatchCardData = Pick<Match, 'opponent' | 'date' | 'location' | 'score' | 'video_url'>

/** Karta rozegranego meczu na liście (wynik, data, sety, wideo). */
export default function MatchCard({ match, to }: { match: MatchCardData; to: string }) {
  const result = parseMatchScore(match.score)
  const outcome = matchOutcome(result)
  const date = new Date(match.date)

  return (
    <Link to={to} className="card match-card">
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
}
