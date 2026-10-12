import type { News } from '../types/database'
import './news-list.css'

type NewsWithAuthor = News & {
  profiles: {
    full_name: string
    username: string
  } | null
}

export default function NewsList({ items }: { items: NewsWithAuthor[] }) {
  if (items.length === 0) {
    return <p className="muted news-empty">Brak aktualności. Sprawdź później!</p>
  }

  return (
    <div className="news-cards">
      {items.map(n => (
        <article key={n.id} className="card news-card">
          <div className="news-card-meta muted">
            {new Date(n.created_at).toLocaleDateString('pl-PL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {n.profiles && <> · {n.profiles.full_name || n.profiles.username}</>}
          </div>
          <h3 className="news-card-title">{n.title}</h3>
          {n.content && <div className="news-card-body">{n.content}</div>}
        </article>
      ))}
    </div>
  )
}
