import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useEvents } from '../hooks/useEvents'
import { useMatches } from '../hooks/useMatches'
import { useUserAttendance, useToggleAttendance, useAttendance, useAttendanceCount } from '../hooks/useAttendance'
import { useUserMatchAttendance, useToggleMatchAttendance, useMatchAttendance, useMatchAttendanceCount } from '../hooks/useMatchAttendance'
import './attendance.css'

type TabType = 'training' | 'sparing' | 'match'

export default function Attendance() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('training')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  
  const { data: allEvents, isLoading: eventsLoading } = useEvents()
  const { data: allMatches, isLoading: matchesLoading } = useMatches()
  const toggleAttendanceMutation = useToggleAttendance()
  const toggleMatchAttendanceMutation = useToggleMatchAttendance()

  // Filtruj wydarzenia według typu
  const getEventsByTab = () => {
    if (!allEvents) return []
    
    switch (activeTab) {
      case 'training':
        return allEvents.filter(e => e.type === 'training')
      case 'sparing':
        return allEvents.filter(e => e.type === 'friendly' || e.type === 'other')
      case 'match':
        return [] // Mecze ligowe będą z tabeli matches
      default:
        return []
    }
  }

  // Pobierz mecze ligowe dla zakładki "Mecze ligowe"
  const getLeagueMatches = () => {
    if (!allMatches) return []
    // Sortuj chronologicznie (rosnąco - najbliższe najpierw)
    return [...allMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const events = getEventsByTab()
  const leagueMatches = activeTab === 'match' ? getLeagueMatches() : []

  const handleToggleAttendance = (eventId: string) => {
    if (!user) return

    toggleAttendanceMutation.mutate({
      eventId,
      playerId: user.id
    })
  }

  const handleToggleMatchAttendance = (matchId: string) => {
    if (!user) return

    toggleMatchAttendanceMutation.mutate({
      matchId,
      playerId: user.id
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
          onClick={() => setActiveTab('training')}
        >
          Treningi
        </button>
        <button
          className={`tab ${activeTab === 'sparing' ? 'active' : ''}`}
          onClick={() => setActiveTab('sparing')}
        >
          Sparingi
        </button>
        <button
          className={`tab ${activeTab === 'match' ? 'active' : ''}`}
          onClick={() => setActiveTab('match')}
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
                onToggleAttendance={handleToggleMatchAttendance}
                onShowAttendees={() => setSelectedMatchId(match.id)}
                isToggling={toggleMatchAttendanceMutation.isPending}
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
              onToggleAttendance={handleToggleAttendance}
              onShowAttendees={() => setSelectedEventId(event.id)}
              isToggling={toggleAttendanceMutation.isPending}
            />
          ))}
        </div>
      )}

      {selectedEventId && user && (
        <AttendeesModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}

      {selectedMatchId && user && (
        <MatchAttendeesModal
          matchId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
        />
      )}
    </div>
  )
}

function EventCard({ 
  event, 
  userId, 
  onToggleAttendance, 
  onShowAttendees,
  isToggling 
}: { 
  event: any
  userId?: string
  onToggleAttendance: (eventId: string) => void
  onShowAttendees: () => void
  isToggling: boolean
}) {
  const { data: userAttendance } = useUserAttendance(event.id, userId)
  const { data: attendanceCount } = useAttendanceCount(event.id)
  const isPresent = userAttendance?.status === 'present'

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
        <div className="attendance-count">
          <span className="count-number">{attendanceCount || 0}</span>
          <span className="count-label">zapisanych</span>
        </div>
        
        {userId && (
          <button
            className={`attendance-button ${isPresent ? 'present' : ''}`}
            onClick={() => onToggleAttendance(event.id)}
            disabled={isToggling}
          >
            {isPresent ? '✓ Obecny' : 'Zaznacz obecność'}
          </button>
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
  onToggleAttendance, 
  onShowAttendees,
  isToggling 
}: { 
  match: any
  userId?: string
  onToggleAttendance: (matchId: string) => void
  onShowAttendees: () => void
  isToggling: boolean
}) {
  const { data: userAttendance } = useUserMatchAttendance(match.id, userId)
  const { data: attendanceCount } = useMatchAttendanceCount(match.id)
  const isPresent = userAttendance?.status === 'present'

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
        <div className="attendance-count">
          <span className="count-number">{attendanceCount || 0}</span>
          <span className="count-label">zapisanych</span>
        </div>
        
        {userId && (
          <button
            className={`attendance-button ${isPresent ? 'present' : ''}`}
            onClick={() => onToggleAttendance(match.id)}
            disabled={isToggling}
          >
            {isPresent ? '✓ Obecny' : 'Zaznacz obecność'}
          </button>
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
  const { user } = useAuth()
  const { data: attendance, isLoading } = useAttendance(eventId)
  const presentPlayers = attendance?.filter(a => a.status === 'present') || []

  // Dodatkowa ochrona - jeśli użytkownik nie jest zalogowany, nie wyświetlaj danych
  if (!user) {
    return null
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Zapisani zawodnicy</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {isLoading ? (
            <div className="loading">Ładowanie...</div>
          ) : presentPlayers.length === 0 ? (
            <p className="no-attendees">Nikt się jeszcze nie zapisał.</p>
          ) : (
            <ul className="attendees-list">
              {presentPlayers.map((att) => (
                <li key={att.id}>
                  {att.profiles?.full_name || att.profiles?.username || 'Nieznany zawodnik'}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function MatchAttendeesModal({ matchId, onClose }: { matchId: string; onClose: () => void }) {
  const { user } = useAuth()
  const { data: attendance, isLoading } = useMatchAttendance(matchId)
  const presentPlayers = attendance?.filter(a => a.status === 'present') || []

  // Dodatkowa ochrona - jeśli użytkownik nie jest zalogowany, nie wyświetlaj danych
  if (!user) {
    return null
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Zapisani zawodnicy</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {isLoading ? (
            <div className="loading">Ładowanie...</div>
          ) : presentPlayers.length === 0 ? (
            <p className="no-attendees">Nikt się jeszcze nie zapisał.</p>
          ) : (
            <ul className="attendees-list">
              {presentPlayers.map((att) => (
                <li key={att.id}>
                  {att.profiles?.full_name || att.profiles?.username || 'Nieznany zawodnik'}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
