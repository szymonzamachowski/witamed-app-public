import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AdminMatchManager from '../components/AdminMatchManager'
import AdminMatchStats from '../components/AdminMatchStats'
import AdminAddPlayers from '../components/AdminAddPlayers'
import AdminEventsManager from '../components/AdminEventsManager'
import AdminNewsManager from '../components/AdminNewsManager'
import './admin.css'

export default function AdminPanel() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  // Debug - sprawdź wartości
  useEffect(() => {
    console.log('AdminPanel - user:', user?.id, 'profile:', profile?.role, 'loading:', loading)
  }, [user, profile, loading])

  // Sprawdź czy użytkownik jest administratorem
  useEffect(() => {
    // Czekaj aż loading się skończy
    if (!loading) {
      // Jeśli nie ma użytkownika, przekieruj
      if (!user) {
        navigate('/')
        return
      }
      
      // Jeśli profile jest załadowane i użytkownik nie jest adminem, przekieruj
      if (profile !== null && profile?.role !== 'admin') {
        navigate('/')
      }
    }
  }, [user, profile, loading, navigate])

  // Pokazuj loading dopóki się ładuje lub dopóki profile się nie załaduje
  if (loading || (user && profile === null)) {
    return (
      <div className="page admin">
        <div className="loading">Ładowanie...</div>
      </div>
    )
  }

  // Jeśli nie ma użytkownika lub nie jest adminem, nie pokazuj nic (useEffect przekieruje)
  if (!user || profile?.role !== 'admin') {
    return null
  }

  return (
    <div className="page admin">
      <div className="admin-header">
        <h1>Panel Administratora</h1>
        <p>Zarządzaj treścią aplikacji</p>
      </div>

      <div className="admin-content">
        <section className="admin-section">
          <AdminNewsManager />
        </section>

        <section className="admin-section">
          <AdminEventsManager />
        </section>

        <section className="admin-section">
          <AdminMatchManager />
        </section>

        <section className="admin-section">
          <AdminMatchStats currentUserId={user.id} />
        </section>

        <section className="admin-section">
          <AdminAddPlayers />
        </section>
      </div>
    </div>
  )
}

