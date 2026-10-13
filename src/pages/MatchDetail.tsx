import { useParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useMatch } from '../hooks/useMatches'
import { useMatchStatistics } from '../hooks/useMatchStatistics'
import { useMatchAttendance } from '../hooks/useMatchAttendance'
import MatchView from '../components/MatchView'
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

  return (
    <div className="page match-detail">
      {backLink}
      <MatchView
        match={match}
        label="Mecz ligowy"
        statistics={filteredStatistics}
        statsLoading={statsLoading || attendanceLoading}
        emptyStatsHint={
          statistics && statistics.length > 0
            ? 'Statystyki nie zostały jeszcze dodane dla obecnych zawodników.'
            : 'Statystyki pojawią się, gdy admin je doda.'
        }
      />
    </div>
  )
}
