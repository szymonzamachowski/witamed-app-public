import EventCard from '../components/EventCard'
import NewsList from '../components/NewsList'
import { findNextEvent } from '../mockData'
import { useNews } from '../hooks/useNews'
import './home.css'

export default function Home(){
  const next = findNextEvent()
  const { data: news, isLoading, error } = useNews()

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
              {next ? <EventCard event={next} /> : <p>Brak zaplanowanych wydarzeń.</p>}
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
