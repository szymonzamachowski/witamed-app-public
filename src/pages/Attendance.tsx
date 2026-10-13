import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { XMarkIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { useEvents } from '../hooks/useEvents'
import { useMatches } from '../hooks/useMatches'
import { useUserAttendance, useSetAttendanceStatus, useAttendance, useAttendanceCount, useAbsentCount, useDeleteEventAttendance } from '../hooks/useAttendance'
import { useUserMatchAttendance, useSetMatchAttendanceStatus, useMatchAttendance, useMatchAttendanceCount, useMatchAbsentCount, useDeleteMatchAttendance } from '../hooks/useMatchAttendance'
import { usePlayers } from '../hooks/usePlayers'
import type { AttendanceTab } from '../utils/attendanceTab'
import './attendance.css'

type Kind = 'event' | 'match'
type Status = 'present' | 'absent'

/** Wspólny kształt wydarzenia i meczu na tej stronie */
type AttendanceItem = {
  kind: Kind
  id: string
  title: string
  date: string
  location: string
  description?: string
  score?: string
}

const TABS: { id: AttendanceTab; label: string }[] = [
  { id: 'training', label: 'Treningi' },
  { id: 'sparing', label: 'Sparingi' },
  { id: 'match', label: 'Mecze ligowe' },
]

const EMPTY_TEXT: Record<AttendanceTab, string> = {
  training: 'Brak zaplanowanych treningów.',
  sparing: 'Brak zaplanowanych sparingów.',
  match: 'Brak zaplanowanych meczów ligowych.',
}

function isTab(value: string | null): value is AttendanceTab {
  return value === 'training' || value === 'sparing' || value === 'match'
}

function startOfToday() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

function isTodayOrLater(date: string) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d >= startOfToday()
}

export default function Attendance() {
  const { user, profile } = useAuth()
  const trainingOnly = !!profile?.training_only
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const focusId = searchParams.get('focus')
  const [requestedTab, setActiveTab] = useState<AttendanceTab>(isTab(tabParam) ? tabParam : 'training')
  // Zawodnik „tylko treningi” widzi wyłącznie treningi
  const activeTab: AttendanceTab = trainingOnly ? 'training' : requestedTab
  const visibleTabs = trainingOnly ? TABS.filter(tab => tab.id === 'training') : TABS
  const [selected, setSelected] = useState<{ kind: Kind; id: string } | null>(null)

  // Aktualizuj aktywną zakładkę gdy zmieni się parametr URL
  useEffect(() => {
    if (isTab(tabParam)) setActiveTab(tabParam)
  }, [tabParam])

  const { data: allEvents, isLoading: eventsLoading } = useEvents()
  const { data: allMatches, isLoading: matchesLoading } = useMatches()
  const setEventStatus = useSetAttendanceStatus()
  const setMatchStatus = useSetMatchAttendanceStatus()

  // Przyszłe (od dziś) wydarzenia z aktywnej zakładki
  const items = useMemo<AttendanceItem[]>(() => {
    if (activeTab === 'match') {
      return (allMatches ?? [])
        .filter(m => isTodayOrLater(m.date))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(m => ({ kind: 'match', id: m.id, title: `vs ${m.opponent}`, date: m.date, location: m.location, score: m.score }))
    }
    return (allEvents ?? [])
      .filter(e => (activeTab === 'training' ? e.type === 'training' : e.type === 'friendly' || e.type === 'other'))
      .filter(e => isTodayOrLater(e.date))
      .map(e => ({ kind: 'event', id: e.id, title: e.title, date: e.date, location: e.location, description: e.description }))
  }, [activeTab, allEvents, allMatches])

  const isLoading = eventsLoading || (activeTab === 'match' && matchesLoading)

  // Przewiń do wydarzenia wskazanego w ?focus= (np. po kliknięciu na stronie głównej)
  const focusedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!focusId || isLoading || focusedRef.current === focusId) return
    const el = document.getElementById(`attendance-${focusId}`)
    if (!el) return
    focusedRef.current = focusId
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('is-focused')
    const timer = window.setTimeout(() => el.classList.remove('is-focused'), 2200)
    return () => window.clearTimeout(timer)
  }, [focusId, isLoading, items])

  const handleSetStatus = (item: AttendanceItem, status: Status) => {
    if (!user) return
    if (item.kind === 'match') {
      setMatchStatus.mutate({ matchId: item.id, playerId: user.id, status })
    } else {
      setEventStatus.mutate({ eventId: item.id, playerId: user.id, status })
    }
  }

  const selectTab = (tab: AttendanceTab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const closeModal = () => {
    if (selected) {
      // Odśwież dane po zamknięciu okna
      queryClient.invalidateQueries({ queryKey: [selected.kind === 'match' ? 'match-attendance' : 'attendance', selected.id] })
    }
    setSelected(null)
  }

  return (
    <div className="page attendance">
      <header className="attendance-header">
        <h1>Obecność</h1>
        <p className="muted">Zaznacz, czy dasz radę przyjść.</p>
      </header>

      {!user && (
        <div className="attendance-login card">
          <p>Musisz być zalogowany, aby zaznaczać obecność.</p>
          <Link to={`/login?redirect=${encodeURIComponent(`/attendance?tab=${activeTab}`)}`} className="btn btn-primary">
            Zaloguj się
          </Link>
        </div>
      )}

      <div className="segmented" role="tablist" aria-label="Rodzaj wydarzenia">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => selectTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="muted attendance-empty">Ładowanie…</p>
      ) : items.length === 0 ? (
        <div className="card attendance-empty">
          <p className="muted">{EMPTY_TEXT[activeTab]}</p>
        </div>
      ) : (
        <div className="attendance-list">
          {items.map(item => (
            <AttendanceCard
              key={item.id}
              item={item}
              userId={user?.id}
              onSetStatus={status => handleSetStatus(item, status)}
              onShowAttendees={() => setSelected({ kind: item.kind, id: item.id })}
              isSaving={setEventStatus.isPending || setMatchStatus.isPending}
            />
          ))}
        </div>
      )}

      {selected && user && (
        <AttendeesModal kind={selected.kind} id={selected.id} isTraining={activeTab === 'training'} onClose={closeModal} />
      )}
    </div>
  )
}

function AttendanceCard({
  item,
  userId,
  onSetStatus,
  onShowAttendees,
  isSaving,
}: {
  item: AttendanceItem
  userId?: string
  onSetStatus: (status: Status) => void
  onShowAttendees: () => void
  isSaving: boolean
}) {
  const isMatch = item.kind === 'match'
  const eventId = isMatch ? '' : item.id
  const matchId = isMatch ? item.id : ''

  // Hooki zawsze wywoływane; nieużywany wariant jest wyłączony pustym id
  const { data: eventAttendance } = useUserAttendance(eventId, userId)
  const { data: matchAttendance } = useUserMatchAttendance(matchId, userId)
  const { data: eventPresent } = useAttendanceCount(eventId)
  const { data: eventAbsent } = useAbsentCount(eventId)
  const { data: matchPresent } = useMatchAttendanceCount(matchId)
  const { data: matchAbsent } = useMatchAbsentCount(matchId)

  const status = (isMatch ? matchAttendance : eventAttendance)?.status
  const presentCount = (isMatch ? matchPresent : eventPresent) ?? 0
  const absentCount = (isMatch ? matchAbsent : eventAbsent) ?? 0

  const date = new Date(item.date)
  const day = date.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Warsaw' })
  const time = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' })

  return (
    <article id={`attendance-${item.id}`} className="card attendance-card">
      <div className="attendance-card-head">
        <div className="attendance-date">
          <span className="display">{date.toLocaleDateString('pl-PL', { day: 'numeric', timeZone: 'Europe/Warsaw' })}</span>
          <span>{date.toLocaleDateString('pl-PL', { month: 'short', timeZone: 'Europe/Warsaw' })}</span>
        </div>
        <div className="attendance-card-info">
          <h2 className="attendance-card-title display">{item.title}</h2>
          <div className="attendance-card-meta muted">
            <span><ClockIcon aria-hidden="true" />{day}, {time}</span>
            {item.location && <span><MapPinIcon aria-hidden="true" />{item.location}</span>}
          </div>
        </div>
      </div>

      {item.description && <p className="attendance-card-desc">{item.description}</p>}
      {item.score && <p className="attendance-card-desc">Wynik: <strong>{item.score}</strong></p>}

      <div className="attendance-counts">
        <span className="count count-present"><strong>{presentCount}</strong> będzie</span>
        <span className="count count-absent"><strong>{absentCount}</strong> nie będzie</span>
      </div>

      {userId && (
        <>
          <div className="attendance-buttons">
            <button
              type="button"
              className={`btn ${status === 'absent' ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => onSetStatus('present')}
              disabled={isSaving}
              aria-pressed={status === 'present'}
            >
              {status === 'present' ? '✓ Będę' : 'Będę'}
            </button>
            <button
              type="button"
              className={`btn ${status === 'absent' ? 'btn-absent' : 'btn-secondary'}`}
              onClick={() => onSetStatus('absent')}
              disabled={isSaving}
              aria-pressed={status === 'absent'}
            >
              {status === 'absent' ? '✓ Nie będę' : 'Nie będę'}
            </button>
          </div>
          <button type="button" className="btn btn-ghost attendance-who" onClick={onShowAttendees}>
            Sprawdź kto się zapisał
          </button>
        </>
      )}
    </article>
  )
}

function AttendeesModal({ kind, id, isTraining, onClose }: { kind: Kind; id: string; isTraining: boolean; onClose: () => void }) {
  const { user, profile, loading } = useAuth()
  const isMatch = kind === 'match'
  const eventId = isMatch ? '' : id
  const matchId = isMatch ? id : ''

  const { data: eventAttendance, isLoading: eventLoading } = useAttendance(eventId)
  const { data: matchAttendance, isLoading: matchLoading } = useMatchAttendance(matchId)
  const { data: allSystemPlayers } = usePlayers()
  const setEventStatus = useSetAttendanceStatus()
  const setMatchStatus = useSetMatchAttendanceStatus()
  const deleteEventAttendance = useDeleteEventAttendance()
  const deleteMatchAttendance = useDeleteMatchAttendance()

  const attendance = (isMatch ? matchAttendance : eventAttendance) ?? []
  const isLoading = isMatch ? matchLoading : eventLoading
  const isSaving = setEventStatus.isPending || setMatchStatus.isPending
  const isDeleting = deleteEventAttendance.isPending || deleteMatchAttendance.isPending

  // Zamknij okno klawiszem Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Dodatkowa ochrona - jeśli użytkownik nie jest zalogowany, nie wyświetlaj danych
  if (!user) return null

  const isAdmin = profile?.role === 'admin'

  const handleStatusChange = (playerId: string, status: Status) => {
    // Użytkownik może zmieniać tylko swój status, chyba że jest adminem
    if (!isAdmin && playerId !== user.id) return
    if (isMatch) {
      setMatchStatus.mutate({ matchId: id, playerId, status })
    } else {
      setEventStatus.mutate({ eventId: id, playerId, status })
    }
  }

  const handleDelete = (attendanceId: string) => {
    if (isMatch) {
      deleteMatchAttendance.mutate({ attendanceId, matchId: id })
    } else {
      deleteEventAttendance.mutate({ attendanceId, eventId: id })
    }
  }

  const present = attendance.filter(a => a.status === 'present')
  const absent = attendance.filter(a => a.status === 'absent')
  const other = attendance.filter(a => a.status !== 'present' && a.status !== 'absent')
  const notAnswered = (allSystemPlayers ?? [])
    .filter(p => isTraining || !p.training_only)
    .filter(p => !attendance.some(a => a.player_id === p.id))

  const renderRow = (att: (typeof attendance)[number]) => {
    const canEdit = isAdmin || att.player_id === user.id
    return (
      <li key={att.id} className={`attendee attendee-${att.status}`}>
        <span className="attendee-name">{att.profiles?.full_name || att.profiles?.username || 'Nieznany zawodnik'}</span>
        {canEdit && (
          <div className="attendee-actions">
            <button
              type="button"
              className={`status-button present ${att.status === 'present' ? 'active' : ''}`}
              onClick={() => handleStatusChange(att.player_id, 'present')}
              disabled={isSaving}
              title="Zaznacz obecność"
              aria-label="Zaznacz obecność"
            >
              ✓
            </button>
            <button
              type="button"
              className={`status-button absent ${att.status === 'absent' ? 'active' : ''}`}
              onClick={() => handleStatusChange(att.player_id, 'absent')}
              disabled={isSaving}
              title="Zaznacz nieobecność"
              aria-label="Zaznacz nieobecność"
            >
              ✗
            </button>
            <button
              type="button"
              className="status-button delete"
              onClick={() => handleDelete(att.id)}
              disabled={isDeleting}
              title="Usuń wpis obecności"
            >
              Usuń
            </button>
          </div>
        )}
      </li>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="attendees-title" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="attendees-title" className="display">Lista obecności</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Zamknij">
            <XMarkIcon aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          {isLoading || (loading && !profile) ? (
            <p className="muted">Ładowanie…</p>
          ) : attendance.length === 0 && !isAdmin ? (
            <p className="muted">Nikt się jeszcze nie zapisał.</p>
          ) : (
            <>
              <section className="attendees-group">
                <h3 className="label">Będą ({present.length})</h3>
                {present.length === 0 ? <p className="muted attendees-none">Nikt.</p> : <ul>{present.map(renderRow)}</ul>}
              </section>

              <section className="attendees-group">
                <h3 className="label label-absent">Nie będą ({absent.length})</h3>
                {absent.length === 0 ? <p className="muted attendees-none">Nikt.</p> : <ul>{absent.map(renderRow)}</ul>}
              </section>

              {other.length > 0 && (
                <section className="attendees-group">
                  <h3 className="label label-muted">Bez statusu ({other.length})</h3>
                  <ul>{other.map(renderRow)}</ul>
                </section>
              )}

              {isAdmin && allSystemPlayers && (
                <section className="attendees-group">
                  <h3 className="label label-muted">Nie zaznaczyli obecności ({notAnswered.length})</h3>
                  {notAnswered.length === 0 ? (
                    <p className="muted attendees-none">Wszyscy odpowiedzieli.</p>
                  ) : (
                    <ul>
                      {notAnswered.map(player => (
                        <li key={player.id} className="attendee attendee-unknown">
                          <span className="attendee-name">{player.full_name || player.username || 'Nieznany zawodnik'}</span>
                          <div className="attendee-actions">
                            <button
                              type="button"
                              className="status-button present"
                              onClick={() => handleStatusChange(player.id, 'present')}
                              disabled={isSaving}
                              title="Zaznacz obecność"
                              aria-label="Zaznacz obecność"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              className="status-button absent"
                              onClick={() => handleStatusChange(player.id, 'absent')}
                              disabled={isSaving}
                              title="Zaznacz nieobecność"
                              aria-label="Zaznacz nieobecność"
                            >
                              ✗
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
