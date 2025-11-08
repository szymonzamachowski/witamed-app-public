import { events } from '../mockData'

export default function CalendarPage(){
  return (
    <div className="page calendar">
      <h2>Kalendarz</h2>
      <p>Lista wydarzeń według daty:</p>
      <ul>
        {events.sort((a,b)=> new Date(a.date).getTime()-new Date(b.date).getTime()).map(e=> (
          <li key={e.id}>
            <strong>{new Date(e.date).toLocaleDateString()}</strong> — {e.title} ({e.type})
          </li>
        ))}
      </ul>
    </div>
  )
}
