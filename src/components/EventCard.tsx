import type { Event, Match } from '../types/database'
import { Link } from 'react-router-dom'

type EventCardProps = Event | (Match & { type: 'match'; title: string })

export default function EventCard({ event }: { event: EventCardProps }){
  if(!event) return null
  
  // Sprawdź czy to mecz czy wydarzenie
  const isMatch = 'opponent' in event && 'type' in event && event.type === 'match'
  const title = isMatch ? event.title : event.title
  const description = isMatch ? undefined : event.description
  const date = event.date
  const location = event.location

  return (
    <article className="event-card">
      <h3>{title}</h3>
      <div className="meta">{new Date(date).toLocaleString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Warsaw'
      })} • {location}</div>
      {description && <p>{description}</p>}
      {isMatch && 'opponent' in event && (
        <p style={{ marginTop: '0.5rem', color: 'rgba(255, 255, 255, 0.8)' }}>
          Przeciwnik: <strong>{event.opponent}</strong>
        </p>
      )}

      {/* Button to open calendar view for this event */}
      <div className="event-actions">
        <Link to="/calendar" className="event-calendar-btn" title="Zobacz terminarz">Zobacz terminarz</Link>
      </div>
    </article>
  )
}
