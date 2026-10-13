import type { ReactNode } from 'react'
import { MapPinIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import type { Match } from '../types/database'
import MatchStatsTable, { type MatchStatRow } from './MatchStatsTable'
import { getYouTubeEmbedUrl } from '../utils/youtube'
import { parseMatchScore, matchOutcome, OUTCOME_LABEL } from '../utils/matchScore'
import '../pages/match-detail.css'

type MatchViewData = Pick<Match, 'opponent' | 'date' | 'location' | 'score' | 'video_url' | 'match_errors'>

/** Szczegóły meczu: nagłówek z wynikiem, wideo i statystyki (bieżący sezon i archiwum). */
export default function MatchView({
  match,
  label,
  statistics,
  statsLoading,
  emptyStatsHint,
}: {
  match: MatchViewData
  label: string
  statistics: MatchStatRow[]
  statsLoading: boolean
  emptyStatsHint: ReactNode
}) {
  const youtubeEmbedUrl = getYouTubeEmbedUrl(match.video_url)
  const result = parseMatchScore(match.score)
  const outcome = matchOutcome(result)
  const date = new Date(match.date)

  return (
    <>
      <header className="card match-hero">
        <div className="match-hero-info">
          <span className="label">{label}</span>
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
        {statsLoading ? (
          <p className="muted">Ładowanie statystyk…</p>
        ) : statistics.length > 0 ? (
          <MatchStatsTable statistics={statistics} matchErrors={match.match_errors} />
        ) : (
          <div className="card match-detail-empty">
            <p>Brak statystyk dla tego meczu.</p>
            <p className="muted">{emptyStatsHint}</p>
          </div>
        )}
      </section>
    </>
  )
}
