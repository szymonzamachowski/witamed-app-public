import { useState, useMemo } from 'react'
import { useMatches } from '../hooks/useMatches'
import { useEvents } from '../hooks/useEvents'
import { Link, useNavigate } from 'react-router-dom'
import type { Match, Event } from '../types/database'
import './calendar.css'

type CalendarEvent = 
  | { type: 'match'; data: Match }
  | { type: 'training'; data: Event }
  | { type: 'friendly'; data: Event }

export default function CalendarPage() {
  const { data: matches, isLoading: matchesLoading } = useMatches()
  const { data: events, isLoading: eventsLoading } = useEvents()
  const [currentDate, setCurrentDate] = useState(new Date())
  const navigate = useNavigate()
  const isLoading = matchesLoading || eventsLoading

  // Połącz wszystkie wydarzenia (mecze, treningi, sparingi) dla bieżącego miesiąca
  const allEvents = useMemo(() => {
    const eventsList: CalendarEvent[] = []
    
    // Dodaj mecze ligowe
    if (matches) {
      matches.forEach(match => {
        const matchDate = new Date(match.date)
        if (matchDate >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) &&
            matchDate < new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)) {
          eventsList.push({ type: 'match', data: match })
        }
      })
    }
    
    // Dodaj treningi i sparingi
    if (events) {
      events.forEach(event => {
        if (event.type === 'training' || event.type === 'friendly') {
          const eventDate = new Date(event.date)
          if (eventDate >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) &&
              eventDate < new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)) {
            eventsList.push({ 
              type: event.type === 'training' ? 'training' : 'friendly', 
              data: event 
            })
          }
        }
      })
    }
    
    // Sortuj chronologicznie
    return eventsList.sort((a, b) => {
      const dateA = new Date(a.data.date).getTime()
      const dateB = new Date(b.data.date).getTime()
      return dateA - dateB
    })
  }, [matches, events, currentDate])

  // Generuj dni miesiąca
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() // 0 = niedziela, 1 = poniedziałek, etc.
    
    const days: Array<{ date: number; event: CalendarEvent | null }> = []
    
    // Dni z poprzedniego miesiąca (jeśli miesiąc nie zaczyna się od poniedziałku)
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 // Konwertuj na poniedziałek = 0
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push({ date: 0, event: null })
    }
    
    // Dni bieżącego miesiąca
    for (let day = 1; day <= daysInMonth; day++) {
      const event = allEvents.find(e => {
        const eventDate = new Date(e.data.date)
        return eventDate.getDate() === day &&
               eventDate.getMonth() === month &&
               eventDate.getFullYear() === year
      }) || null
      days.push({ date: day, event })
    }
    
    return days
  }, [currentDate, allEvents])

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ]

  const dayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie']

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  return (
    <div className="page calendar">
      <div className="calendar-header">
        <h2>Terminarz</h2>
        <div className="calendar-navigation">
          <button onClick={goToPreviousMonth} className="nav-button">‹</button>
          <div className="current-month">
            <span className="month-name">{monthNames[currentDate.getMonth()]}</span>
            <span className="year">{currentDate.getFullYear()}</span>
          </div>
          <button onClick={goToNextMonth} className="nav-button">›</button>
          <button onClick={goToToday} className="today-button">Dziś</button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Ładowanie wydarzeń...</div>
      ) : (
        <>
          <div className="calendar-grid">
            <div className="calendar-weekdays">
              {dayNames.map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
            
            <div className="calendar-days">
              {calendarDays.map((day, index) => {
                if (day.date === 0) {
                  return <div key={`empty-${index}`} className="calendar-day empty"></div>
                }
                
                const hasEvent = day.event !== null
                const isSelected = selectedDay === day.date
                const eventType = day.event?.type || null
                
                // Tekst do wyświetlenia w komórce
                let eventLabel = ''
                if (day.event) {
                  if (day.event.type === 'match') {
                    eventLabel = `vs ${day.event.data.opponent}`
                  } else if (day.event.type === 'training') {
                    eventLabel = 'Trening'
                  } else if (day.event.type === 'friendly') {
                    eventLabel = 'Sparing'
                  }
                }
                
                return (
                  <div
                    key={day.date}
                    className={`calendar-day ${hasEvent ? `has-event event-${eventType}` : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDay(isSelected ? null : day.date)}
                  >
                    <div className="day-number">{day.date}</div>
                    {hasEvent && (
                      <>
                        <div className={`event-indicator event-${eventType}`}>
                          <span className={`event-dot event-${eventType}`}></span>
                        </div>
                        <div className={`event-label event-${eventType}`}>
                          {eventLabel}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {selectedDay !== null && (() => {
            const selectedEvent = allEvents.find(e => {
              const eventDate = new Date(e.data.date)
              return eventDate.getDate() === selectedDay &&
                     eventDate.getMonth() === currentDate.getMonth() &&
                     eventDate.getFullYear() === currentDate.getFullYear()
            })
            
            if (!selectedEvent) return null
            
            const eventDate = new Date(selectedEvent.data.date)
            const isMatch = selectedEvent.type === 'match'
            const isTraining = selectedEvent.type === 'training'
            const isFriendly = selectedEvent.type === 'friendly'
            
            return (
              <div className="match-popup-overlay" onClick={() => setSelectedDay(null)}>
                <div className="match-popup" onClick={(e) => e.stopPropagation()}>
                  <div className="match-popup-header">
                    <h3>
                      {isMatch && `vs ${(selectedEvent.data as Match).opponent}`}
                      {isTraining && (selectedEvent.data as Event).title}
                      {isFriendly && (selectedEvent.data as Event).title}
                    </h3>
                    <button 
                      className="popup-close-button"
                      onClick={() => setSelectedDay(null)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="match-popup-content">
                    <div className="match-popup-row">
                      <span className="popup-label">Typ:</span>
                      <span className="popup-value">
                        {isMatch && 'Mecz ligowy'}
                        {isTraining && 'Trening'}
                        {isFriendly && 'Sparing'}
                      </span>
                    </div>
                    
                    <div className="match-popup-row">
                      <span className="popup-label">Data i godzina:</span>
                      <span className="popup-value">
                        {eventDate.toLocaleDateString('pl-PL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Europe/Warsaw'
                        })}
                      </span>
                    </div>
                    
                    <div className="match-popup-row">
                      <span className="popup-label">Lokalizacja:</span>
                      <span className="popup-value">{selectedEvent.data.location}</span>
                    </div>
                    
                    {isMatch && (selectedEvent.data as Match).score && (
                      <div className="match-popup-row">
                        <span className="popup-label">Wynik:</span>
                        <span className="popup-value popup-score">{(selectedEvent.data as Match).score}</span>
                      </div>
                    )}
                    
                    {(isTraining || isFriendly) && (selectedEvent.data as Event).description && (
                      <div className="match-popup-row">
                        <span className="popup-label">Opis:</span>
                        <span className="popup-value">{(selectedEvent.data as Event).description}</span>
                      </div>
                    )}
                    
                    <div className="match-popup-actions">
                      {isMatch && (
                        <Link 
                          to={`/matches/${(selectedEvent.data as Match).id}`}
                          className="popup-view-button"
                          onClick={() => setSelectedDay(null)}
                        >
                          Zobacz pełne szczegóły meczu
                        </Link>
                      )}
                      <button
                        className="popup-attendance-button"
                        onClick={() => {
                          let tab = 'training'
                          if (isMatch) {
                            tab = 'match'
                          } else if (isFriendly) {
                            tab = 'sparing'
                          }
                          setSelectedDay(null)
                          navigate(`/attendance?tab=${tab}`)
                        }}
                      >
                        Zobacz obecności
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {allEvents.length === 0 && (
            <div className="no-matches">
              <p>Brak wydarzeń w tym miesiącu.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
