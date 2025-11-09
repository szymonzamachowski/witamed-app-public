import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { usePlayerStatistics } from '../hooks/usePlayerStatistics'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import './account.css'

export default function MyAccount() {
  const { user, profile, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const { data: allPlayerStats, isLoading: statsLoading } = usePlayerStatistics()
  
  // Statystyki tylko dla tego zawodnika
  const playerStats = useMemo(() => {
    if (!allPlayerStats || !user) return null
    return allPlayerStats.find(stat => stat.player_id === user.id)
  }, [allPlayerStats, user])
  
  // Stan dla edycji profilu
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editEmail, setEditEmail] = useState(user?.email || '')
  const [editPhone, setEditPhone] = useState(profile?.phone_number || '')
  const [editUsername, setEditUsername] = useState(profile?.username || '')
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  
  // Stan dla zmiany hasła
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  
  // Aktualizuj wartości formularza gdy profile się zmienia
  useEffect(() => {
    if (user?.email) setEditEmail(user.email)
    if (profile?.phone_number) setEditPhone(profile.phone_number)
    if (profile?.username) setEditUsername(profile.username)
  }, [user, profile])

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }
  
  const updateProfileMutation = useMutation({
    mutationFn: async ({ email, phone_number, username }: { email: string; phone_number: string; username: string }) => {
      if (!user) throw new Error('Użytkownik nie jest zalogowany')
      
      // Aktualizuj email w auth.users (jeśli się zmienił)
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email
        })
        
        if (emailError) {
          throw emailError
        }
      }
      
      // Aktualizuj profil w profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone_number: phone_number || null,
          username: username || null
        })
        .eq('id', user.id)
      
      if (profileError) {
        throw profileError
      }
    },
    onSuccess: () => {
      setProfileSuccess('Profil został zaktualizowany pomyślnie!')
      setProfileError(null)
      // Odśwież dane profilu
      window.location.reload()
    },
    onError: (error: Error) => {
      setProfileError(error.message || 'Błąd przy aktualizacji profilu')
      setProfileSuccess(null)
    }
  })
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(null)
    
    if (!editEmail || !editEmail.includes('@')) {
      setProfileError('Podaj prawidłowy adres email')
      return
    }
    
    if (editUsername && editUsername.trim().length < 3) {
      setProfileError('Username musi mieć co najmniej 3 znaki')
      return
    }
    
    updateProfileMutation.mutate({
      email: editEmail.trim(),
      phone_number: editPhone.trim() || '',
      username: editUsername.trim() || ''
    })
  }
  
  const changePasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      // Zaktualizuj hasło - Supabase wymaga, aby użytkownik był zalogowany
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (updateError) {
        throw updateError
      }
    },
    onSuccess: () => {
      setPasswordSuccess('Hasło zostało zmienione pomyślnie!')
      setPasswordError(null)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setShowChangePassword(false)
        setPasswordSuccess(null)
      }, 2000)
    },
    onError: (error: Error) => {
      setPasswordError(error.message || 'Błąd przy zmianie hasła')
      setPasswordSuccess(null)
    }
  })
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)
    
    if (!newPassword || !confirmPassword) {
      setPasswordError('Wszystkie pola są wymagane')
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Nowe hasło musi mieć co najmniej 6 znaków')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Nowe hasła nie są identyczne')
      return
    }
    
    changePasswordMutation.mutate(newPassword)
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
          <div className="section-header">
            <h2>Informacje osobiste</h2>
            {!showEditProfile && (
              <button
                onClick={() => setShowEditProfile(true)}
                className="edit-profile-button"
              >
                Edytuj profil
              </button>
            )}
          </div>
          
          {!showEditProfile ? (
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
                  <label>Nazwa użytkownika (ksywka)</label>
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
          ) : (
            <form onSubmit={handleUpdateProfile} className="edit-profile-form">
              {profileError && (
                <div className="form-error">{profileError}</div>
              )}
              {profileSuccess && (
                <div className="form-success">{profileSuccess}</div>
              )}
              
              <div className="form-group">
                <label htmlFor="edit-email">Email *</label>
                <input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Wprowadź adres email"
                  required
                  disabled={updateProfileMutation.isPending}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-username">Nazwa użytkownika (ksywka)</label>
                <input
                  id="edit-username"
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Wprowadź ksywkę"
                  minLength={3}
                  disabled={updateProfileMutation.isPending}
                />
                <small style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                  Minimum 3 znaki
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-phone">Numer telefonu</label>
                <input
                  id="edit-phone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Wprowadź numer telefonu"
                  disabled={updateProfileMutation.isPending}
                />
              </div>
              
              {profile?.full_name && (
                <div className="info-item" style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                  <label style={{ marginBottom: '0.25rem' }}>Imię i nazwisko</label>
                  <div className="info-value" style={{ fontSize: '0.95rem' }}>{profile.full_name}</div>
                  <small style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }}>
                    To pole nie może być edytowane
                  </small>
                </div>
              )}
              
              {profile?.league_license_number && (
                <div className="info-item" style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                  <label style={{ marginBottom: '0.25rem' }}>Numer legitymacji ligowej</label>
                  <div className="info-value" style={{ fontSize: '0.95rem' }}>{profile.league_license_number}</div>
                  <small style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }}>
                    To pole nie może być edytowane
                  </small>
                </div>
              )}
              
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProfile(false)
                    setProfileError(null)
                    setProfileSuccess(null)
                    // Przywróć oryginalne wartości
                    if (user?.email) setEditEmail(user.email)
                    if (profile?.phone_number) setEditPhone(profile.phone_number)
                    if (profile?.username) setEditUsername(profile.username)
                  }}
                  className="cancel-button"
                  disabled={updateProfileMutation.isPending}
                >
                  Anuluj
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Statystyki zawodnika - tylko jeśli jest zawodnikiem */}
        {profile && (profile.role === 'player' || (profile.role === 'admin' && profile.league_license_number)) && (
          <div className="account-section">
            <h2>Moje statystyki</h2>
            {statsLoading ? (
              <div className="loading">Ładowanie statystyk...</div>
            ) : playerStats ? (
              <div className="player-stats-grid">
                <div className="stats-summary">
                  <div className="stat-card">
                    <div className="stat-label">Rozegrane mecze</div>
                    <div className="stat-value">{playerStats.matches_played}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Punkty</div>
                    <div className="stat-value highlight">{playerStats.total_points}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Asy</div>
                    <div className="stat-value">{playerStats.total_aces}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Bloki</div>
                    <div className="stat-value">{playerStats.total_blocks}</div>
                  </div>
                </div>
                
                <div className="stats-details">
                  <div className="stats-category">
                    <h3>Zagrywka</h3>
                    <div className="stats-row">
                      <span>Total:</span>
                      <span>{playerStats.serve_total}</span>
                    </div>
                    <div className="stats-row">
                      <span>Błędy:</span>
                      <span>{playerStats.serve_errors}</span>
                    </div>
                    <div className="stats-row">
                      <span>Asy:</span>
                      <span>{playerStats.serve_aces}</span>
                    </div>
                    <div className="stats-row">
                      <span>Skuteczność:</span>
                      <span className="percentage">{playerStats.serve_percentage}%</span>
                    </div>
                  </div>
                  
                  <div className="stats-category">
                    <h3>Przyjęcie</h3>
                    <div className="stats-row">
                      <span>Total:</span>
                      <span>{playerStats.reception_total}</span>
                    </div>
                    <div className="stats-row">
                      <span>Pozytywne:</span>
                      <span>{playerStats.reception_positive}</span>
                    </div>
                    <div className="stats-row">
                      <span>Pozostałe:</span>
                      <span>{playerStats.reception_other}</span>
                    </div>
                    <div className="stats-row">
                      <span>Błędy:</span>
                      <span>{playerStats.reception_errors}</span>
                    </div>
                    <div className="stats-row">
                      <span>Skuteczność:</span>
                      <span className="percentage">{playerStats.reception_percentage}%</span>
                    </div>
                  </div>
                  
                  <div className="stats-category">
                    <h3>Atak</h3>
                    <div className="stats-row">
                      <span>Total:</span>
                      <span>{playerStats.attack_total}</span>
                    </div>
                    <div className="stats-row">
                      <span>Punktowe:</span>
                      <span>{playerStats.attack_points}</span>
                    </div>
                    <div className="stats-row">
                      <span>Nieskończone:</span>
                      <span>{playerStats.attack_unfinished}</span>
                    </div>
                    <div className="stats-row">
                      <span>Błędy:</span>
                      <span>{playerStats.attack_errors}</span>
                    </div>
                    <div className="stats-row">
                      <span>Zablokowane:</span>
                      <span>{playerStats.attack_blocked}</span>
                    </div>
                    <div className="stats-row">
                      <span>Skuteczność:</span>
                      <span className="percentage">{playerStats.attack_percentage}%</span>
                    </div>
                  </div>
                  
                  <div className="stats-category">
                    <h3>Blok</h3>
                    <div className="stats-row">
                      <span>Bloki:</span>
                      <span>{playerStats.block_total}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="stats-placeholder">
                <p>Brak statystyk. Statystyki pojawią się po rozegraniu meczów.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Sekcja zmiany hasła */}
        <div className="account-section">
          <h2>Bezpieczeństwo</h2>
          {!showChangePassword ? (
            <div className="password-section">
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
                Zmień hasło do swojego konta. Jeśli używasz domyślnego hasła (HASLO_STARTOWE), zalecamy jego zmianę.
              </p>
              <button
                onClick={() => setShowChangePassword(true)}
                className="change-password-button"
              >
                Zmień hasło
              </button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="change-password-form">
              {passwordError && (
                <div className="form-error">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="form-success">{passwordSuccess}</div>
              )}
              
              <div className="form-group">
                <label htmlFor="new-password">Nowe hasło *</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Wprowadź nowe hasło (min. 6 znaków)"
                  required
                  minLength={6}
                  disabled={changePasswordMutation.isPending}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm-password">Potwierdź nowe hasło *</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Wprowadź nowe hasło ponownie"
                  required
                  minLength={6}
                  disabled={changePasswordMutation.isPending}
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? 'Zmienianie...' : 'Zmień hasło'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false)
                    setPasswordError(null)
                    setPasswordSuccess(null)
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="cancel-button"
                  disabled={changePasswordMutation.isPending}
                >
                  Anuluj
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

