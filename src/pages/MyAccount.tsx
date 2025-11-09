import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import './account.css'

export default function MyAccount() {
  const { user, profile, signOut, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="page account">
        <div className="loading">Ładowanie...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="page account">
      <div className="account-header">
        <h1>Moje konto</h1>
        <button onClick={handleSignOut} className="sign-out-button">
          Wyloguj się
        </button>
      </div>

      <div className="account-content">
        <div className="account-section">
          <h2>Informacje osobiste</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Email</label>
              <div className="info-value">{user.email}</div>
            </div>
            {profile?.full_name && (
              <div className="info-item">
                <label>Imię i nazwisko</label>
                <div className="info-value">{profile.full_name}</div>
              </div>
            )}
            {profile?.username && (
              <div className="info-item">
                <label>Nazwa użytkownika</label>
                <div className="info-value">{profile.username}</div>
              </div>
            )}
            {profile?.phone_number && (
              <div className="info-item">
                <label>Numer telefonu</label>
                <div className="info-value">{profile.phone_number}</div>
              </div>
            )}
            {profile?.league_license_number && (
              <div className="info-item">
                <label>Numer legitymacji ligowej</label>
                <div className="info-value">{profile.league_license_number}</div>
              </div>
            )}
            <div className="info-item">
              <label>Rola</label>
              <div className="info-value">
                {profile?.role === 'admin' ? 'Administrator' : 
                 profile?.role === 'coach' ? 'Trener' : 'Zawodnik'}
              </div>
            </div>
          </div>
        </div>

        <div className="account-section">
          <h2>Statystyki</h2>
          <div className="stats-placeholder">
            <p>Statystyki obecności i meczów będą dostępne wkrótce.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

