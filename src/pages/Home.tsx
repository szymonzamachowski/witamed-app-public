import { useMemo } from 'react'
import NextEventCard, { type UpcomingEvent } from '../components/NextEventCard'
import LastMatchCard from '../components/LastMatchCard'
import NewsList from '../components/NewsList'
import NotificationsBanner from '../components/NotificationsBanner'
import { useNews } from '../hooks/useNews'
import { useEvents } from '../hooks/useEvents'
import { useMatches } from '../hooks/useMatches'
import './home.css'

export default function Home() {
  const { data: news, isLoading: newsLoading, error: newsError } = useNews()
  const { data: events, isLoading: eventsLoading } = useEvents()
  const { data: matches, isLoading: matchesLoading } = useMatches()

  // Najbliższe wydarzenie: przyszłe wydarzenia + przyszłe mecze bez wyniku
  const nextEvent = useMemo<UpcomingEvent | null>(() => {
    const now = new Date()
    const upcoming: UpcomingEvent[] = []

    events?.forEach(event => {
      if (new Date(event.date) > now) upcoming.push(event)
    })

    matches?.forEach(match => {
      if (new Date(match.date) > now && !match.score) {
        upcoming.push({ ...match, type: 'match' as const, title: `Mecz ligowy vs ${match.opponent}` })
      }
    })

    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return upcoming[0] || null
  }, [events, matches])

  // Ostatni rozegrany mecz (z wynikiem); useMatches sortuje malejąco po dacie
  const lastMatch = useMemo(() => {
    const now = new Date()
    return matches?.find(match => match.score && new Date(match.date) <= now) ?? null
  }, [matches])

  return (
    <div className="page home">
      <section className="home-cards">
        <NotificationsBanner />

        {eventsLoading || matchesLoading ? (
          <div className="card home-placeholder muted">Ładowanie…</div>
        ) : nextEvent ? (
          <NextEventCard event={nextEvent} />
        ) : (
          <div className="card home-placeholder">
            <span className="label">Najbliżej</span>
            <p className="muted">Brak zaplanowanych wydarzeń.</p>
          </div>
        )}

        {lastMatch && <LastMatchCard match={lastMatch} />}
      </section>

      <section className="home-news">
        <h2>Aktualności</h2>
        {newsLoading && <p className="muted">Ładowanie aktualności…</p>}
        {newsError && <p className="home-error">Nie udało się wczytać aktualności.</p>}
        {news && <NewsList items={news} />}
      </section>
    </div>
  )
}
