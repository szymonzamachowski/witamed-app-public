import type { Event } from '../types'
import { Link } from 'react-router-dom'

export default function EventCard({ event }: { event: Event }){
  if(!event) return null
  return (
    <article className="event-card">
      <h3>{event.title}</h3>
      <div className="meta">{new Date(event.date).toLocaleString()} • {event.location}</div>
      {event.description && <p>{event.description}</p>}

      {/* Button to open calendar view for this event */}
      <div className="event-actions">
        <Link to="/calendar" className="event-calendar-btn" title="Zobacz terminarz">Zobacz terminarz</Link>
      </div>
    </article>
  )
}
