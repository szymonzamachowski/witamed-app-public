import type { NewsItem } from '../types'

export default function NewsList({ items }: { items: NewsItem[] }){
  return (
    <section className="news-section container">
      <h2 className="news-title">Aktualności</h2>

      <div className="news-cards">
        {items.map(n => (
          <div key={n.id} className="news-card">
            <div className="news-card-header">
              <strong className="news-card-title">{n.title}</strong>
              <div className="news-card-date">{new Date(n.date).toLocaleDateString()}</div>
            </div>
            {n.content && <div className="news-card-body">{n.content}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}
