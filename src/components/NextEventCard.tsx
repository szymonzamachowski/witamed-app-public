import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Event, Match } from '../types/database'
import { useAuth } from '../hooks/useAuth'
import { useUserAttendance, useSetAttendanceStatus, useAttendanceCount, useAbsentCount } from '../hooks/useAttendance'
import {
  useUserMatchAttendance,
  useSetMatchAttendanceStatus,
  useMatchAttendanceCount,
  useMatchAbsentCount,
} from '../hooks/useMatchAttendance'
import { attendanceTabFor } from '../utils/attendanceTab'
import './next-event-card.css'

export type UpcomingEvent = Event | (Match & { type: 'match'; title: string })

type Status = 'present' | 'absent'

const TYPE_LABELS: Record<string, string> = {
  training: 'Trening',
  friendly: 'Sparing',
  other: 'Wydarzenie',
  match: 'Mecz ligowy',
}

function formatDay(date: Date) {
  return date.toLocaleDateString('pl-PL', { weekday: 'long', timeZone: 'Europe/Warsaw' })
}

function formatDateTime(date: Date) {
  const day = date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', timeZone: 'Europe/Warsaw' })
  const time = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' })
  return `${day} · ${time}`
}

export default function NextEventCard({ event }: { event: UpcomingEvent }) {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const isMatch = event.type === 'match'
  const eventId = isMatch ? '' : event.id
  const matchId = isMatch ? event.id : ''

  // Hooki zawsze wywoływane; nieużywany wariant jest wyłączony pustym id
  const { data: eventAttendance } = useUserAttendance(eventId, user?.id)
  const { data: matchAttendance } = useUserMatchAttendance(matchId, user?.id)
  const { data: eventPresent } = useAttendanceCount(eventId)
  const { data: eventAbsent } = useAbsentCount(eventId)
  const { data: matchPresent } = useMatchAttendanceCount(matchId)
  const { data: matchAbsent } = useMatchAbsentCount(matchId)
  const setEventStatus = useSetAttendanceStatus()
  const setMatchStatus = useSetMatchAttendanceStatus()

  const currentStatus = (isMatch ? matchAttendance : eventAttendance)?.status
  const presentCount = (isMatch ? matchPresent : eventPresent) ?? 0
  const absentCount = (isMatch ? matchAbsent : eventAbsent) ?? 0
  const totalAnswers = presentCount + absentCount
  const isSaving = setEventStatus.isPending || setMatchStatus.isPending

  const tab = attendanceTabFor(event)
  // Zawodnik „tylko treningi” nie zaznacza obecności na meczach i sparingach
  const canMark = !profile?.training_only || tab === 'training'
  const date = new Date(event.date)
  const title = isMatch && 'opponent' in event ? `vs ${event.opponent}` : event.title
  const description = !isMatch && 'description' in event ? event.description : undefined

  const handleAttendance = async (status: Status) => {
    setError(null)
    const target = `/attendance?tab=${tab}&focus=${event.id}`

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/attendance?tab=${tab}`)}`)
      return
    }

    try {
      if (isMatch) {
        await setMatchStatus.mutateAsync({ matchId: event.id, playerId: user.id, status })
      } else {
        await setEventStatus.mutateAsync({ eventId: event.id, playerId: user.id, status })
      }
      navigate(target)
    } catch (e) {
      console.error('Błąd zapisu obecności:', e)
      setError('Nie udało się zapisać obecności. Spróbuj ponownie.')
    }
  }

  return (
    <article className="card next-event">
      <div className="next-event-top">
        <span className="label">Najbliżej · {formatDay(date)}</span>
        <span className={`type-chip type-${tab}`}>{TYPE_LABELS[event.type] ?? 'Wydarzenie'}</span>
      </div>

      <h2 className="next-event-title display">{title}</h2>
      <p className="muted">
        {formatDateTime(date)}
        {event.location && <> · {event.location}</>}
      </p>
      {description && <p className="next-event-desc">{description}</p>}

      <div className="next-event-bar" aria-hidden="true">
        {totalAnswers > 0 && (
          <>
            <span className="bar-present" style={{ flexGrow: presentCount }} />
            <span className="bar-absent" style={{ flexGrow: absentCount }} />
          </>
        )}
      </div>
      <p className="next-event-counts muted">
        <strong>{presentCount}</strong> będzie · <strong>{absentCount}</strong> nie będzie
      </p>

      {canMark && (
      <div className="next-event-actions">
        <button
          type="button"
          className={`btn ${currentStatus === 'absent' ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => handleAttendance('present')}
          disabled={isSaving}
          aria-pressed={currentStatus === 'present'}
        >
          {currentStatus === 'present' && '✓ '}Będę
        </button>
        <button
          type="button"
          className={`btn ${currentStatus === 'absent' ? 'btn-absent' : 'btn-secondary'}`}
          onClick={() => handleAttendance('absent')}
          disabled={isSaving}
          aria-pressed={currentStatus === 'absent'}
        >
          {currentStatus === 'absent' && '✓ '}Nie będę
        </button>
      </div>
      )}

      {error && <p className="next-event-error">{error}</p>}

      <div className="next-event-links">
        {canMark && <Link to={`/attendance?tab=${tab}&focus=${event.id}`}>Kto będzie?</Link>}
        <Link to="/calendar">Zobacz terminarz</Link>
      </div>
    </article>
  )
}
