import { events } from '../mockData'
import { useState } from 'react'

export default function Attendance(){
  const [answers, setAnswers] = useState<Record<string,string>>({})

  function toggle(id: string){
    setAnswers(prev => ({ ...prev, [id]: prev[id] === 'yes' ? 'no' : 'yes' }))
  }

  return (
    <div className="page attendance">
      <h2>Obecność</h2>
      <p>Zaznacz czy dasz radę przyjść na wydarzenie.</p>
      <ul>
        {events.map(e => (
          <li key={e.id}>
            <div className="row">
              <div>
                <strong>{e.title}</strong>
                <div className="meta">{new Date(e.date).toLocaleString()}</div>
              </div>
              <div>
                <button onClick={() => toggle(e.id)} className={answers[e.id] === 'yes' ? 'primary':''}>
                  {answers[e.id] === 'yes' ? 'Obecny' : 'Zaznacz obecność'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
