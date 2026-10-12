import { Link } from 'react-router-dom'
import type { Match } from '../types/database'
import { parseMatchScore, matchOutcome, OUTCOME_LABEL } from '../utils/matchScore'

export default function LastMatchCard({ match }: { match: Match }) {
  const result = parseMatchScore(match.score)
  const outcome = matchOutcome(result)
  const date = new Date(match.date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Warsaw',
  })

  return (
    <Link to={`/matches/${match.id}`} className="card last-match">
      <div>
        <span className="label">Ostatni mecz</span>
        <div className="last-match-opponent display">vs {match.opponent}</div>
        <div className="muted last-match-meta">{date}{match.location && ` · ${match.location}`}</div>
      </div>
      {result && (
        <div className={`last-match-score display is-${outcome}`}>
          {result.ours}:{result.theirs}
          <span className="last-match-result">{outcome && OUTCOME_LABEL[outcome]}</span>
        </div>
      )}
    </Link>
  )
}
