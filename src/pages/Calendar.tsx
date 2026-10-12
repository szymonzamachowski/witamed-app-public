import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useMatches } from '../hooks/useMatches'
import { useEvents } from '../hooks/useEvents'
import { attendanceTabFor, type AttendanceTab } from '../utils/attendanceTab'
import { parseMatchScore } from '../utils/matchScore'
import './calendar.css'

type CalendarItem = {
  id: string
  kind: 'match' | 'event'
  tab: AttendanceTab
  title: string
  date: Date
  location: string
  description?: string
  score?: string
}

const MONTH_NAMES = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
]
const DAY_NAMES = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie']
const TYPE_LABEL: Record<AttendanceTab, string> = { training: 'Trening', sparing: 'Sparing', match: 'Mecz ligowy' }

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

const timeOf = (d: Date) => d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })

export default function CalendarPage() {
  const { data: matches, isLoading: matchesLoading } = useMatches()
  const { data: events, isLoading: eventsLoading } = useEvents()
  const today = useMemo(() => new Date(), [])
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  // null = lista całego miesiąca; dzień wybierany po kliknięciu (lub dziś, jeśli coś się dzieje)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [autoSelected, setAutoSelected] = useState(false)
  const isLoading = matchesLoading || eventsLoading

  // Wszystkie wydarzenia (mecze ligowe, treningi, sparingi i inne)
  const allItems = useMemo<CalendarItem[]>(() => {
    const items: CalendarItem[] = []
    matches?.forEach(m =>
      items.push({
        id: m.id, kind: 'match', tab: 'match', title: `vs ${m.opponent}`,
        date: new Date(m.date), location: m.location, score: m.score,
      })
    )
    events?.forEach(e => {
      if (e.type === 'match') return // mecze ligowe są w tabeli matches
      items.push({
        id: e.id, kind: 'event', tab: attendanceTabFor(e), title: e.title,
        date: new Date(e.date), location: e.location, description: e.description,
      })
    })
    return items.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [matches, events])

  const monthItems = useMemo(
    () => allItems.filter(i => i.date.getFullYear() === month.getFullYear() && i.date.getMonth() === month.getMonth()),
    [allItems, month]
  )

  // Po wczytaniu: jeśli dziś coś się dzieje, pokaż od razu ten dzień
  useEffect(() => {
    if (autoSelected || isLoading) return
    setAutoSelected(true)
    if (allItems.some(i => sameDay(i.date, today))) setSelectedDay(today)
  }, [autoSelected, isLoading, allItems, today])

  // Siatka: tygodnie od poniedziałku
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const offset = (first.getDay() + 6) % 7 // poniedziałek = 0
    const result: (Date | null)[] = Array.from({ length: offset }, () => null)
    for (let d = 1; d <= daysInMonth; d++) result.push(new Date(month.getFullYear(), month.getMonth(), d))
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [month])

  const changeMonth = (delta: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1)
    setMonth(next)
    setSelectedDay(null)
  }

  const goToToday = () => {
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDay(allItems.some(i => sameDay(i.date, today)) ? today : null)
  }

  // Przesunięcie palcem zmienia miesiąc
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) changeMonth(dx < 0 ? 1 : -1)
  }

  const isCurrentMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth()
  const dayItems = selectedDay ? monthItems.filter(i => sameDay(i.date, selectedDay)) : []
  const listItems = selectedDay ? dayItems : monthItems

  return (
    <div className="page calendar">
      <header className="calendar-top">
        <h1>Terminarz</h1>
        <div className="calendar-legend">
          <span className="legend-item"><i className="dot dot-training" />Trening</span>
          <span className="legend-item"><i className="dot dot-sparing" />Sparing</span>
          <span className="legend-item"><i className="dot dot-match" />Mecz</span>
        </div>
      </header>

      <div className="calendar-layout">
        <section className="card calendar-card" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="calendar-nav">
            <button type="button" className="icon-button" onClick={() => changeMonth(-1)} aria-label="Poprzedni miesiąc">
              <ChevronLeftIcon aria-hidden="true" />
            </button>
            <div className="calendar-month">
              <span className="display">{MONTH_NAMES[month.getMonth()]}</span>
              <span className="muted">{month.getFullYear()}</span>
            </div>
            <button type="button" className="icon-button" onClick={() => changeMonth(1)} aria-label="Następny miesiąc">
              <ChevronRightIcon aria-hidden="true" />
            </button>
            <button type="button" className="btn btn-secondary calendar-today" onClick={goToToday} disabled={isCurrentMonth}>
              Dziś
            </button>
          </div>

          <div className="calendar-grid" role="grid" aria-label={`${MONTH_NAMES[month.getMonth()]} ${month.getFullYear()}`}>
            {DAY_NAMES.map(d => (
              <div key={d} className="calendar-weekday" role="columnheader">{d}</div>
            ))}
            {cells.map((date, i) => {
              if (!date) return <div key={`e-${i}`} className="calendar-cell is-empty" aria-hidden="true" />
              const items = monthItems.filter(it => sameDay(it.date, date))
              const isToday = sameDay(date, today)
              const isSelected = !!selectedDay && sameDay(date, selectedDay)
              const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
              return (
                <button
                  key={date.getDate()}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-label={`${date.getDate()} ${MONTH_NAMES[month.getMonth()]}${items.length ? `, ${items.map(it => TYPE_LABEL[it.tab]).join(', ')}` : ''}`}
                  className={[
                    'calendar-cell',
                    isToday && 'is-today',
                    isSelected && 'is-selected',
                    isPast && 'is-past',
                    items.length > 0 && 'has-items',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setSelectedDay(isSelected ? null : date)}
                >
                  <span className="cell-day">{date.getDate()}</span>
                  {items.length > 0 && (
                    <>
                      <span className="cell-dots" aria-hidden="true">
                        {items.slice(0, 3).map(it => <i key={it.id} className={`dot dot-${it.tab}`} />)}
                      </span>
                      <span className="cell-pills" aria-hidden="true">
                        {items.slice(0, 2).map(it => (
                          <span key={it.id} className={`cell-pill pill-${it.tab}`}>
                            <span className="cell-pill-time">{timeOf(it.date)}</span>
                            <span className="cell-pill-title">{it.kind === 'match' ? it.title : TYPE_LABEL[it.tab]}</span>
                          </span>
                        ))}
                        {items.length > 2 && <span className="cell-more">+{items.length - 2}</span>}
                      </span>
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <section className="calendar-agenda" aria-live="polite">
          <div className="agenda-head">
            <h2>
              {selectedDay
                ? selectedDay.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })
                : `Cały ${MONTH_NAMES[month.getMonth()].toLowerCase()}`}
            </h2>
            {selectedDay && monthItems.length > 0 && (
              <button type="button" className="btn btn-ghost agenda-all" onClick={() => setSelectedDay(null)}>
                Pokaż miesiąc
              </button>
            )}
          </div>

          {isLoading ? (
            <p className="muted">Ładowanie wydarzeń…</p>
          ) : listItems.length === 0 ? (
            <div className="card agenda-empty">
              <p className="muted">
                {selectedDay ? 'Tego dnia nic się nie dzieje.' : 'Brak wydarzeń w tym miesiącu.'}
              </p>
            </div>
          ) : (
            <div className="agenda-list">
              {listItems.map(item => (
                <AgendaCard key={item.id} item={item} showDate={!selectedDay} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function AgendaCard({ item, showDate }: { item: CalendarItem; showDate: boolean }) {
  const result = parseMatchScore(item.score)
  const isUpcoming = item.date.getTime() > Date.now() - 3 * 60 * 60 * 1000

  return (
    <article className={`card agenda-card agenda-${item.tab}`}>
      <div className="agenda-card-top">
        <span className={`type-chip type-${item.tab}`}>{TYPE_LABEL[item.tab]}</span>
        {result && <span className="display agenda-score">{result.ours}:{result.theirs}</span>}
      </div>
      <h3 className="agenda-title display">{item.title}</h3>
      <div className="agenda-meta muted">
        <span>
          <ClockIcon aria-hidden="true" />
          {showDate && `${item.date.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' })}, `}
          {timeOf(item.date)}
        </span>
        {item.location && <span><MapPinIcon aria-hidden="true" />{item.location}</span>}
      </div>
      {item.description && <p className="agenda-desc">{item.description}</p>}

      <div className="agenda-actions">
        <Link
          to={`/attendance?tab=${item.tab}${isUpcoming ? `&focus=${item.id}` : ''}`}
          className={`btn ${isUpcoming ? 'btn-primary' : 'btn-secondary'}`}
        >
          Obecność
        </Link>
        {item.kind === 'match' && (
          <Link to={`/matches/${item.id}`} className="btn btn-secondary">
            Szczegóły
          </Link>
        )}
      </div>
    </article>
  )
}
