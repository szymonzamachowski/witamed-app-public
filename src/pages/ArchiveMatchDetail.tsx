import { useParams, Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { LAST_SEASON, useArchiveMatch } from '../hooks/useSeasonArchive'
import MatchView from '../components/MatchView'
import './match-detail.css'

export default function ArchiveMatchDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useArchiveMatch(id || '')

  const backLink = (
    <Link to="/zeszly-sezon?tab=mecze" className="back-link">
      <ArrowLeftIcon aria-hidden="true" />
      Mecze sezonu {LAST_SEASON}
    </Link>
  )

  if (isLoading) {
    return (
      <div className="page match-detail">
        <p className="muted">Ładowanie meczu…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="page match-detail">
        {backLink}
        <div className="card match-detail-empty">
          <p className="muted">Nie znaleziono meczu.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page match-detail">
      {backLink}
      <MatchView
        match={data.match}
        label={`Sezon ${data.match.season}`}
        statistics={data.statistics}
        statsLoading={false}
        emptyStatsHint="W tym meczu nie zapisano statystyk."
      />
    </div>
  )
}
