import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AdminMatchManager from '../components/AdminMatchManager'
import AdminMatchStats from '../components/AdminMatchStats'
import AdminAddPlayers from '../components/AdminAddPlayers'
import AdminEventsManager from '../components/AdminEventsManager'
import AdminNewsManager from '../components/AdminNewsManager'
import './admin.css'

type SectionId = 'news' | 'events' | 'matches' | 'stats' | 'players'

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'news', label: 'Aktualności' },
  { id: 'events', label: 'Wydarzenia' },
  { id: 'matches', label: 'Mecze' },
  { id: 'stats', label: 'Statystyki meczu' },
  { id: 'players', label: 'Zawodnicy' },
]

const isSection = (value: string | null): value is SectionId => SECTIONS.some(s => s.id === value)

export default function AdminPanel() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const sectionParam = searchParams.get('section')
  const section: SectionId = isSection(sectionParam) ? sectionParam : 'news'

  // Tylko dla adminów
  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/')
      return
    }
    if (profile !== null && profile?.role !== 'admin') navigate('/')
  }, [user, profile, loading, navigate])

  // Czekaj aż profil się załaduje
  if (loading || (user && profile === null)) {
    return (
      <div className="page admin">
        <p className="muted">Ładowanie…</p>
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') return null

  return (
    <div className="page admin">
      <header className="admin-header">
        <h1>Panel Admina</h1>
        <p className="muted">Zarządzaj aktualnościami, terminarzem, meczami i statystykami.</p>
      </header>

      <nav className="admin-tabs" role="tablist" aria-label="Sekcje panelu">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={section === s.id}
            className={section === s.id ? 'active' : ''}
            onClick={() => setSearchParams({ section: s.id })}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* Wszystkie sekcje zostają zamontowane (tylko ukryte), żeby przełączenie zakładki
          nie kasowało niezapisanych danych, np. wpisywanych statystyk meczu */}
      {SECTIONS.map(s => (
        <section key={s.id} className="card admin-section" role="tabpanel" hidden={section !== s.id}>
          {s.id === 'news' && <AdminNewsManager />}
          {s.id === 'events' && <AdminEventsManager />}
          {s.id === 'matches' && <AdminMatchManager />}
          {s.id === 'stats' && <AdminMatchStats currentUserId={user.id} />}
          {s.id === 'players' && <AdminAddPlayers />}
        </section>
      ))}
    </div>
  )
}
