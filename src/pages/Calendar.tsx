import { useState, useMemo } from 'react'
import { useMatches } from '../hooks/useMatches'
import { Link } from 'react-router-dom'
import type { Match } from '../types/database'
import './calendar.css'

export default function CalendarPage() {
  const { data: matches, isLoading } = useMatches()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Filtruj tylko mecze ligowe (wszystkie mecze z tabeli matches to mecze ligowe)
  // i sortuj chronologicznie (rosnąco)
  const leagueMatches = useMemo(() => {
    if (!matches) return []
    return matches
      .filter(match => {
        const matchDate = new Date(match.date)
        return matchDate >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) &&
               matchDate < new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [matches, currentDate])

  // Generuj dni miesiąca
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() // 0 = niedziela, 1 = poniedziałek, etc.
    
    const days: Array<{ date: number; match: Match | null }> = []
    
    // Dni z poprzedniego miesiąca (jeśli miesiąc nie zaczyna się od poniedziałku)
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 // Konwertuj na poniedziałek = 0
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push({ date: 0, match: null })
    }
    
    // Dni bieżącego miesiąca
    for (let day = 1; day <= daysInMonth; day++) {
      const match = leagueMatches.find(m => {
        const matchDate = new Date(m.date)
        return matchDate.getDate() === day &&
               matchDate.getMonth() === month &&
               matchDate.getFullYear() === year
      }) || null
      days.push({ date: day, match })
    }
    
    return days
  }, [currentDate, leagueMatches])

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
        <h2>Terminarz meczów ligowych</h2>
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
        <div className="loading">Ładowanie meczów...</div>
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
                
                const hasMatch = day.match !== null
                const isSelected = selectedDay === day.date
                
                return (
                  <div
                    key={day.date}
                    className={`calendar-day ${hasMatch ? 'has-match' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDay(isSelected ? null : day.date)}
                  >
                    <div className="day-number">{day.date}</div>
                    {hasMatch && (
                      <div className="match-indicator">
                        <span className="match-dot"></span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {selectedDay !== null && (() => {
            const selectedMatch = leagueMatches.find(m => {
              const matchDate = new Date(m.date)
              return matchDate.getDate() === selectedDay &&
                     matchDate.getMonth() === currentDate.getMonth() &&
                     matchDate.getFullYear() === currentDate.getFullYear()
            })
            
            if (!selectedMatch) return null
            
            const matchDate = new Date(selectedMatch.date)
            
            return (
              <div className="match-popup-overlay" onClick={() => setSelectedDay(null)}>
                <div className="match-popup" onClick={(e) => e.stopPropagation()}>
                  <div className="match-popup-header">
                    <h3>vs {selectedMatch.opponent}</h3>
                    <button 
                      className="popup-close-button"
                      onClick={() => setSelectedDay(null)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="match-popup-content">
                    <div className="match-popup-row">
                      <span className="popup-label">Data i godzina:</span>
                      <span className="popup-value">
                        {matchDate.toLocaleDateString('pl-PL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <div className="match-popup-row">
                      <span className="popup-label">Lokalizacja:</span>
                      <span className="popup-value">{selectedMatch.location}</span>
                    </div>
                    
                    {selectedMatch.score && (
                      <div className="match-popup-row">
                        <span className="popup-label">Wynik:</span>
                        <span className="popup-value popup-score">{selectedMatch.score}</span>
                      </div>
                    )}
                    
                    <div className="match-popup-actions">
                      <Link 
                        to={`/matches/${selectedMatch.id}`}
                        className="popup-view-button"
                        onClick={() => setSelectedDay(null)}
                      >
                        Zobacz pełne szczegóły meczu
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {leagueMatches.length === 0 && (
            <div className="no-matches">
              <p>Brak meczów ligowych w tym miesiącu.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
