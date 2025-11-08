import { matches } from '../mockData'

export default function Matches(){
  return (
    <div className="page matches">
      <h2>Mecze</h2>
      {matches.length === 0 && <p>Brak meczów.</p>}
      <ul>
        {matches.map(m => (
          <li key={m.id} className="match-item">
            <h3>{m.title}</h3>
            <div className="meta">{new Date(m.date).toLocaleString()} • {m.location}</div>
            {m.videoUrl ? (
              <div className="video">
                <video controls src={m.videoUrl} style={{maxWidth:'100%'}} />
              </div>
            ) : (
              <div className="video-placeholder">Brak wideo</div>
            )}
            {m.stats && (
              <pre className="stats">{JSON.stringify(m.stats, null, 2)}</pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
