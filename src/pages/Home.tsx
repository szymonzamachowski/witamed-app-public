import { useMemo } from 'react'
import EventCard from '../components/EventCard'
import NewsList from '../components/NewsList'
import { useNews } from '../hooks/useNews'
import { useEvents } from '../hooks/useEvents'
import { useMatches } from '../hooks/useMatches'
import type { Event, Match } from '../types/database'
import './home.css'

type UpcomingEvent = Event | (Match & { type: 'match'; title: string })

export default function Home(){
  const { data: news, isLoading, error } = useNews()
  const { data: events, isLoading: eventsLoading } = useEvents()
  const { data: matches, isLoading: matchesLoading } = useMatches()

  // Znajdź następne wydarzenie (z events i matches)
  const nextEvent = useMemo<UpcomingEvent | null>(() => {
    const now = new Date()
    const upcoming: UpcomingEvent[] = []

    // Dodaj przyszłe wydarzenia
    if (events) {
      events.forEach(event => {
        const eventDate = new Date(event.date)
        if (eventDate > now) {
          upcoming.push(event)
        }
      })
    }

    // Dodaj przyszłe mecze (tylko te bez wyniku - jeszcze nie rozegrane)
    if (matches) {
      matches.forEach(match => {
        const matchDate = new Date(match.date)
        if (matchDate > now && !match.score) {
          upcoming.push({
            ...match,
            type: 'match' as const,
            title: `Mecz ligowy vs ${match.opponent}`
          })
        }
      })
    }

    // Sortuj chronologicznie i zwróć pierwsze
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return upcoming[0] || null
  }, [events, matches])

  const isLoadingNextEvent = eventsLoading || matchesLoading

  return (
    <div className="home-page">
      <header className="hero">
        <div className="hero-bg" />
  {/* main hero heading (matches supplied image) */}
  <h1 className="hero-heading">Jedziemy kurwa! Fire!</h1>

        <div className="hero-overlay">
            <div className="hero-next">
              {/* player image positioned relative to this box so it appears on top */}
              <img src="/photos/hero.png" alt="zawodnik" className="hero-player" />

              <h2>Następne ważne wydarzenie</h2>
              {isLoadingNextEvent ? (
                <p>Ładowanie...</p>
              ) : nextEvent ? (
                <EventCard event={nextEvent} />
              ) : (
                <p>Brak zaplanowanych wydarzeń.</p>
              )}
            </div>
          </div>
      </header>

      <main className="home-content container">
        {isLoading && <p style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Ładowanie aktualności...</p>}
        {error && <p style={{ color: '#ff6b6b', textAlign: 'center', padding: '2rem' }}>Błąd przy ładowaniu aktualności</p>}
        {news && <NewsList items={news} />}
      </main>
    </div>
  )
}
