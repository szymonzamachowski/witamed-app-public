import type { News } from '../types/database'

type NewsWithAuthor = News & {
  profiles: {
    full_name: string
    username: string
  } | null
}

export default function NewsList({ items }: { items: NewsWithAuthor[] }){
  if (items.length === 0) {
    return (
      <section className="news-section container">
        <h2 className="news-title">Aktualności</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '2rem' }}>
          Brak aktualności. Sprawdź później!
        </p>
      </section>
    )
  }

  return (
    <section className="news-section container">
      <h2 className="news-title">Aktualności</h2>

      <div className="news-cards">
        {items.map(n => (
          <div key={n.id} className="news-card">
            <div className="news-card-header">
              <strong className="news-card-title">{n.title}</strong>
              <div className="news-card-date">
                {new Date(n.created_at).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {n.profiles && (
                  <span style={{ 
                    fontSize: '0.85em', 
                    opacity: 0.7, 
                    marginLeft: '0.5rem' 
                  }}>
                    • {n.profiles.full_name || n.profiles.username}
                  </span>
                )}
              </div>
            </div>
            {n.content && <div className="news-card-body">{n.content}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}
