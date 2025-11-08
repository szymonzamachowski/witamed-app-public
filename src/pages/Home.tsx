import EventCard from '../components/EventCard'
import NewsList from '../components/NewsList'
import { findNextEvent, news } from '../mockData'
import './home.css'

export default function Home(){
  const next = findNextEvent()

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
        <NewsList items={news} />
      </main>
    </div>
  )
}
