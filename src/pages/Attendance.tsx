import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { useEvents } from '../hooks/useEvents'
import { useMatches } from '../hooks/useMatches'
import { useUserAttendance, useToggleAttendance, useSetAttendanceStatus, useAttendance, useAttendanceCount, useAbsentCount, useDeleteEventAttendance } from '../hooks/useAttendance'
import { useUserMatchAttendance, useToggleMatchAttendance, useSetMatchAttendanceStatus, useMatchAttendance, useMatchAttendanceCount, useMatchAbsentCount, useDeleteMatchAttendance } from '../hooks/useMatchAttendance'
import './attendance.css'

type TabType = 'training' | 'sparing' | 'match'

export default function Attendance() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as TabType | null
  const [activeTab, setActiveTab] = useState<TabType>(tabParam && ['training', 'sparing', 'match'].includes(tabParam) ? tabParam : 'training')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  
  // Aktualizuj aktywną zakładkę gdy zmieni się parametr URL
  useEffect(() => {
    if (tabParam && ['training', 'sparing', 'match'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])
  
  const { data: allEvents, isLoading: eventsLoading } = useEvents()
  const { data: allMatches, isLoading: matchesLoading } = useMatches()
  const toggleAttendanceMutation = useToggleAttendance()
  const toggleMatchAttendanceMutation = useToggleMatchAttendance()
  const setAttendanceStatusMutation = useSetAttendanceStatus()
  const setMatchAttendanceStatusMutation = useSetMatchAttendanceStatus()

  // Filtruj wydarzenia według typu i usuń przeszłe wydarzenia
  const getEventsByTab = () => {
    if (!allEvents) return []
    
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Ustaw na początek dnia dla porównania
    
    let filtered: typeof allEvents = []
    
    switch (activeTab) {
      case 'training':
        filtered = allEvents.filter(e => e.type === 'training')
        break
      case 'sparing':
        filtered = allEvents.filter(e => e.type === 'friendly' || e.type === 'other')
        break
      case 'match':
        return [] // Mecze ligowe będą z tabeli matches
      default:
        return []
    }
    
    // Filtruj tylko przyszłe wydarzenia (data >= dzisiaj)
    return filtered.filter(e => {
      const eventDate = new Date(e.date)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate >= now
    })
  }

  // Pobierz mecze ligowe dla zakładki "Mecze ligowe" (tylko przyszłe)
  const getLeagueMatches = () => {
    if (!allMatches) return []
    
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Ustaw na początek dnia dla porównania
    
    // Filtruj tylko przyszłe mecze (data >= dzisiaj)
    const futureMatches = allMatches.filter(m => {
      const matchDate = new Date(m.date)
      matchDate.setHours(0, 0, 0, 0)
      return matchDate >= now
    })
    
    // Sortuj chronologicznie (rosnąco - najbliższe najpierw)
    return [...futureMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const events = getEventsByTab()
  const leagueMatches = activeTab === 'match' ? getLeagueMatches() : []

  const handleSetAttendanceStatus = (eventId: string, status: 'present' | 'absent') => {
    if (!user) return

    setAttendanceStatusMutation.mutate({
      eventId,
      playerId: user.id,
      status
    })
  }

  const handleSetMatchAttendanceStatus = (matchId: string, status: 'present' | 'absent') => {
    if (!user) return

    setMatchAttendanceStatusMutation.mutate({
      matchId,
      playerId: user.id,
      status
    })
  }

  return (
    <div className="page attendance">
      <div className="attendance-header">
      <h2>Obecność</h2>
      <p>Zaznacz czy dasz radę przyjść na wydarzenie.</p>
      </div>

      {!user && (
        <div className="attendance-warning">
          <p>Musisz być zalogowany, aby zaznaczać obecność.</p>
        </div>
      )}

      <div className="attendance-tabs">
        <button
          className={`tab ${activeTab === 'training' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('training')
            setSearchParams({ tab: 'training' })
          }}
        >
          Treningi
        </button>
        <button
          className={`tab ${activeTab === 'sparing' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('sparing')
            setSearchParams({ tab: 'sparing' })
          }}
        >
          Sparingi
        </button>
        <button
          className={`tab ${activeTab === 'match' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('match')
            setSearchParams({ tab: 'match' })
          }}
        >
          Mecze ligowe
        </button>
      </div>

      {(eventsLoading || (activeTab === 'match' && matchesLoading)) ? (
        <div className="loading">Ładowanie...</div>
      ) : activeTab === 'match' ? (
        leagueMatches.length === 0 ? (
          <div className="no-events">
            <p>Brak meczów ligowych.</p>
          </div>
        ) : (
          <div className="events-list">
            {leagueMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                userId={user?.id}
                onSetAttendanceStatus={handleSetMatchAttendanceStatus}
                onShowAttendees={() => setSelectedMatchId(match.id)}
                isToggling={toggleMatchAttendanceMutation.isPending || setMatchAttendanceStatusMutation.isPending}
              />
            ))}
          </div>
        )
      ) : events.length === 0 ? (
        <div className="no-events">
          <p>Brak wydarzeń w tej kategorii.</p>
        </div>
      ) : (
        <div className="events-list">
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              userId={user?.id}
              onSetAttendanceStatus={handleSetAttendanceStatus}
              onShowAttendees={() => setSelectedEventId(event.id)}
              isToggling={toggleAttendanceMutation.isPending || setAttendanceStatusMutation.isPending}
            />
          ))}
        </div>
      )}

      {selectedEventId && user && (
        <AttendeesModal
          eventId={selectedEventId}
          onClose={() => {
            setSelectedEventId(null)
            // Odśwież dane po zamknięciu modala
            queryClient.invalidateQueries({ queryKey: ['attendance', selectedEventId] })
          }}
        />
      )}

      {selectedMatchId && user && (
        <MatchAttendeesModal
          matchId={selectedMatchId}
          onClose={() => {
            setSelectedMatchId(null)
            // Odśwież dane po zamknięciu modala
            queryClient.invalidateQueries({ queryKey: ['match-attendance', selectedMatchId] })
          }}
        />
      )}
    </div>
  )
}

function EventCard({ 
  event, 
  userId, 
  onSetAttendanceStatus,
  onShowAttendees,
  isToggling 
}: { 
  event: any
  userId?: string
  onSetAttendanceStatus: (eventId: string, status: 'present' | 'absent') => void
  onShowAttendees: () => void
  isToggling: boolean
}) {
  const { data: userAttendance } = useUserAttendance(event.id, userId)
  const { data: attendanceCount } = useAttendanceCount(event.id)
  const { data: absentCount } = useAbsentCount(event.id)
  const isPresent = userAttendance?.status === 'present'
  const isAbsent = userAttendance?.status === 'absent'

  return (
    <div className="event-card">
      <div className="event-info">
        <h3>{event.title}</h3>
        <div className="event-meta">
          <span className="event-date">
            {new Date(event.date).toLocaleDateString('pl-PL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Europe/Warsaw'
            })}
          </span>
          <span className="event-location">{event.location}</span>
        </div>
        {event.description && (
          <p className="event-description">{event.description}</p>
        )}
      </div>
      
      <div className="event-actions">
        <div className="attendance-stats">
          <div className="attendance-count">
            <span className="count-number">{attendanceCount || 0}</span>
            <span className="count-label">zapisanych</span>
          </div>
          {absentCount !== undefined && absentCount > 0 && (
            <div className="absent-count">
              <span className="count-number">{absentCount}</span>
              <span className="count-label">nieobecnych</span>
            </div>
          )}
        </div>
        
        {userId && (
          <div className="attendance-buttons">
            <button
              className={`attendance-button ${isPresent ? 'present' : ''}`}
              onClick={() => onSetAttendanceStatus(event.id, 'present')}
              disabled={isToggling}
            >
              {isPresent ? '✓ Obecny' : 'Zaznacz obecność'}
            </button>
            <button
              className={`attendance-button absent ${isAbsent ? 'active' : ''}`}
              onClick={() => onSetAttendanceStatus(event.id, 'absent')}
              disabled={isToggling}
            >
              {isAbsent ? '✗ Nieobecny' : 'Nieobecny'}
            </button>
          </div>
        )}
        
        {userId && (
          <button
            className="view-attendees-button"
            onClick={onShowAttendees}
          >
            Sprawdź kto się zapisał
          </button>
        )}
      </div>
    </div>
  )
}

function MatchCard({ 
  match, 
  userId, 
  onSetAttendanceStatus,
  onShowAttendees,
  isToggling 
}: { 
  match: any
  userId?: string
  onSetAttendanceStatus: (matchId: string, status: 'present' | 'absent') => void
  onShowAttendees: () => void
  isToggling: boolean
}) {
  const { data: userAttendance } = useUserMatchAttendance(match.id, userId)
  const { data: attendanceCount } = useMatchAttendanceCount(match.id)
  const { data: absentCount } = useMatchAbsentCount(match.id)
  const isPresent = userAttendance?.status === 'present'
  const isAbsent = userAttendance?.status === 'absent'

  return (
    <div className="event-card">
      <div className="event-info">
        <h3>vs {match.opponent}</h3>
        <div className="event-meta">
          <span className="event-date">
            {new Date(match.date).toLocaleDateString('pl-PL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Europe/Warsaw'
            })}
          </span>
          <span className="event-location">{match.location}</span>
        </div>
        {match.score && (
          <p className="event-description">Wynik: <strong>{match.score}</strong></p>
        )}
      </div>
      
      <div className="event-actions">
        <div className="attendance-stats">
          <div className="attendance-count">
            <span className="count-number">{attendanceCount || 0}</span>
            <span className="count-label">zapisanych</span>
          </div>
          {absentCount !== undefined && absentCount > 0 && (
            <div className="absent-count">
              <span className="count-number">{absentCount}</span>
              <span className="count-label">nieobecnych</span>
            </div>
          )}
        </div>
        
        {userId && (
          <div className="attendance-buttons">
            <button
              className={`attendance-button ${isPresent ? 'present' : ''}`}
              onClick={() => onSetAttendanceStatus(match.id, 'present')}
              disabled={isToggling}
            >
              {isPresent ? '✓ Obecny' : 'Zaznacz obecność'}
            </button>
            <button
              className={`attendance-button absent ${isAbsent ? 'active' : ''}`}
              onClick={() => onSetAttendanceStatus(match.id, 'absent')}
              disabled={isToggling}
            >
              {isAbsent ? '✗ Nieobecny' : 'Nieobecny'}
            </button>
          </div>
        )}
        
        {userId && (
          <button
            className="view-attendees-button"
            onClick={onShowAttendees}
          >
            Sprawdź kto się zapisał
          </button>
        )}
      </div>
    </div>
  )
}

function AttendeesModal({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const { user, profile } = useAuth()
  const { data: attendance, isLoading } = useAttendance(eventId)
  const setAttendanceStatusMutation = useSetAttendanceStatus()
  const deleteAttendanceMutation = useDeleteEventAttendance()
  const allPlayers = attendance || []

  // Dodatkowa ochrona - jeśli użytkownik nie jest zalogowany, nie wyświetlaj danych
  if (!user) {
    return null
  }

  const isAdmin = profile?.role === 'admin'

  const handleStatusChange = (playerId: string, newStatus: 'present' | 'absent') => {
    // Użytkownik może zmieniać tylko swój status, chyba że jest adminem
    if (!isAdmin && playerId !== user.id) {
      return
    }

    setAttendanceStatusMutation.mutate({
      eventId,
      playerId,
      status: newStatus
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Lista obecności</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {isLoading ? (
            <div className="loading">Ładowanie...</div>
          ) : (
            <>
              <div className="attendees-section">
                <h4 className="attendees-section-title">Lista zawodników ({allPlayers.length})</h4>
                {allPlayers.length === 0 ? (
                  <p className="no-attendees">Nikt się jeszcze nie zapisał.</p>
                ) : (
                  <ul className="attendees-list">
                    {allPlayers.map((att) => {
                      const isPresent = att.status === 'present'
                      const isAbsent = att.status === 'absent'
                      const canEdit = isAdmin || att.player_id === user.id
                      
                      return (
                        <li key={att.id} className={isPresent ? 'present' : isAbsent ? 'absent' : ''}>
                          <div className="attendee-item">
                            <div className="attendee-info">
                              <span className="attendee-status-icon">
                                {isPresent ? (
                                  <span className="status-icon present">✓</span>
                                ) : isAbsent ? (
                                  <span className="status-icon absent">✗</span>
                                ) : (
                                  <span className="status-icon unknown">?</span>
                                )}
                              </span>
                              <span className="attendee-name">
                                {att.profiles?.full_name || att.profiles?.username || 'Nieznany zawodnik'}
                              </span>
                            </div>
                            <div className="attendee-actions">
                              {canEdit && (
                                <>
                                  <button
                                    className={`status-button present ${isPresent ? 'active' : ''}`}
                                    onClick={() => handleStatusChange(att.player_id, 'present')}
                                    disabled={setAttendanceStatusMutation.isPending}
                                    title="Zaznacz obecność"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    className={`status-button absent ${isAbsent ? 'active' : ''}`}
                                    onClick={() => handleStatusChange(att.player_id, 'absent')}
                                    disabled={setAttendanceStatusMutation.isPending}
                                    title="Zaznacz nieobecność"
                                  >
                                    ✗
                                  </button>
                                </>
                              )}
                              {isAdmin && (
                                <button
                                  className="status-button delete"
                                  onClick={() => {
                                    deleteAttendanceMutation.mutate({ attendanceId: att.id, eventId })
                                  }}
                                  disabled={deleteAttendanceMutation.isPending}
                                  title="Usuń wpis obecności"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MatchAttendeesModal({ matchId, onClose }: { matchId: string; onClose: () => void }) {
  const { user, profile } = useAuth()
  const { data: attendance, isLoading } = useMatchAttendance(matchId)
  const setMatchAttendanceStatusMutation = useSetMatchAttendanceStatus()
  const deleteMatchAttendanceMutation = useDeleteMatchAttendance()
  const allPlayers = attendance || []

  // Dodatkowa ochrona - jeśli użytkownik nie jest zalogowany, nie wyświetlaj danych
  if (!user) {
    return null
  }

  const isAdmin = profile?.role === 'admin'

  const handleStatusChange = (playerId: string, newStatus: 'present' | 'absent') => {
    // Użytkownik może zmieniać tylko swój status, chyba że jest adminem
    if (!isAdmin && playerId !== user.id) {
      return
    }

    setMatchAttendanceStatusMutation.mutate({
      matchId,
      playerId,
      status: newStatus
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Lista obecności</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {isLoading ? (
            <div className="loading">Ładowanie...</div>
          ) : (
            <>
              <div className="attendees-section">
                <h4 className="attendees-section-title">Lista zawodników ({allPlayers.length})</h4>
                {allPlayers.length === 0 ? (
                  <p className="no-attendees">Nikt się jeszcze nie zapisał.</p>
                ) : (
                  <ul className="attendees-list">
                    {allPlayers.map((att) => {
                      const isPresent = att.status === 'present'
                      const isAbsent = att.status === 'absent'
                      const canEdit = isAdmin || att.player_id === user.id
                      
                      return (
                        <li key={att.id} className={isPresent ? 'present' : isAbsent ? 'absent' : ''}>
                          <div className="attendee-item">
                            <div className="attendee-info">
                              <span className="attendee-status-icon">
                                {isPresent ? (
                                  <span className="status-icon present">✓</span>
                                ) : isAbsent ? (
                                  <span className="status-icon absent">✗</span>
                                ) : (
                                  <span className="status-icon unknown">?</span>
                                )}
                              </span>
                              <span className="attendee-name">
                                {att.profiles?.full_name || att.profiles?.username || 'Nieznany zawodnik'}
                              </span>
                            </div>
                            <div className="attendee-actions">
                              {canEdit && (
                                <>
                                  <button
                                    className={`status-button present ${isPresent ? 'active' : ''}`}
                                    onClick={() => handleStatusChange(att.player_id, 'present')}
                                    disabled={setMatchAttendanceStatusMutation.isPending}
                                    title="Zaznacz obecność"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    className={`status-button absent ${isAbsent ? 'active' : ''}`}
                                    onClick={() => handleStatusChange(att.player_id, 'absent')}
                                    disabled={setMatchAttendanceStatusMutation.isPending}
                                    title="Zaznacz nieobecność"
                                  >
                                    ✗
                                  </button>
                                </>
                              )}
                              {isAdmin && (
                                <button
                                  className="status-button delete"
                                  onClick={() => {
                                    deleteMatchAttendanceMutation.mutate({ attendanceId: att.id, matchId })
                                  }}
                                  disabled={deleteMatchAttendanceMutation.isPending}
                                  title="Usuń wpis obecności"
                                >
                                  ×
                                </button>
                              )}
                            </div>
            </div>
          </li>
                      )
                    })}
      </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
