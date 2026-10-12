import { useState, useEffect, useMemo, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowRightOnRectangleIcon, PencilSquareIcon, KeyIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { usePlayerStatistics } from '../hooks/usePlayerStatistics'
import { supabase } from '../lib/supabase'
import { POINTS_COLUMN } from '../stats/statConfig'
import StatGroupTiles from '../components/StatGroupTiles'
import NotificationsCard from '../components/NotificationsCard'
import '../components/stats-board.css'
import './account.css'

function initials(name: string | null | undefined) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
}

export default function MyAccount() {
  const { user, profile, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const { data: allPlayerStats, isLoading: statsLoading } = usePlayerStatistics()

  // Statystyki tylko dla tego zawodnika
  const playerStats = useMemo(() => {
    if (!allPlayerStats || !user) return null
    return allPlayerStats.find(stat => stat.player_id === user.id) ?? null
  }, [allPlayerStats, user])

  // Stan dla edycji profilu
  const [showEditProfile, setShowEditProfile] = useState(false)
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

  // Aktualizuj wartości formularza gdy profil się zmienia
  useEffect(() => {
    if (profile?.phone_number) setEditPhone(profile.phone_number)
    if (profile?.username) setEditUsername(profile.username)
  }, [profile])

  useEffect(() => {
    if (!loading && !user) navigate('/login?redirect=%2Faccount')
  }, [user, loading, navigate])

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) console.error('Błąd wylogowania:', error)
    } catch (error) {
      console.error('Błąd wylogowania:', error)
    }
    // Pełne przeładowanie, żeby stan aplikacji na pewno się wyczyścił
    window.location.href = '/'
  }

  const updateProfileMutation = useMutation({
    mutationFn: async ({ phone_number, username }: { phone_number: string; username: string }) => {
      if (!user) throw new Error('Użytkownik nie jest zalogowany')
      const { error } = await supabase
        .from('profiles')
        .update({ phone_number: phone_number || null, username: username || null })
        .eq('id', user.id)
      if (error) throw error
    },
    onSuccess: () => {
      setProfileSuccess('Profil został zaktualizowany.')
      setProfileError(null)
      // Odśwież dane profilu
      window.location.reload()
    },
    onError: (error: Error) => {
      setProfileError(error.message || 'Błąd przy aktualizacji profilu')
      setProfileSuccess(null)
    },
  })

  const handleUpdateProfile = (e: FormEvent) => {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(null)

    if (editUsername && editUsername.trim().length < 3) {
      setProfileError('Ksywka musi mieć co najmniej 3 znaki.')
      return
    }

    updateProfileMutation.mutate({ phone_number: editPhone.trim(), username: editUsername.trim() })
  }

  const cancelEditProfile = () => {
    setShowEditProfile(false)
    setProfileError(null)
    setProfileSuccess(null)
    // Przywróć oryginalne wartości
    setEditPhone(profile?.phone_number || '')
    setEditUsername(profile?.username || '')
  }

  const changePasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
    },
    onSuccess: () => {
      setPasswordSuccess('Hasło zostało zmienione.')
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
    },
  })

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!newPassword || !confirmPassword) {
      setPasswordError('Wszystkie pola są wymagane.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Nowe hasło musi mieć co najmniej 6 znaków.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Nowe hasła nie są identyczne.')
      return
    }

    changePasswordMutation.mutate(newPassword)
  }

  const cancelChangePassword = () => {
    setShowChangePassword(false)
    setPasswordError(null)
    setPasswordSuccess(null)
    setNewPassword('')
    setConfirmPassword('')
  }

  if (loading) {
    return (
      <div className="page account">
        <p className="muted">Ładowanie…</p>
      </div>
    )
  }

  if (!user) return null

  const showStats = profile && (profile.role === 'player' || (profile.role === 'admin' && profile.league_license_number))

  return (
    <div className="page account">
      {/* Nagłówek */}
      <header className="card account-hero">
        <div className="account-avatar display" aria-hidden="true">{initials(profile?.full_name)}</div>
        <div className="account-hero-info">
          <h1>{profile?.full_name || 'Moje konto'}</h1>
          {profile?.username && <p className="muted">„{profile.username}”</p>}
        </div>
        <button type="button" onClick={handleSignOut} className="btn btn-secondary account-signout">
          <ArrowRightOnRectangleIcon aria-hidden="true" />
          Wyloguj
        </button>
      </header>

      {/* Statystyki */}
      {showStats && (
        <section className="account-section">
          <h2>Moje statystyki</h2>
          {statsLoading ? (
            <p className="muted">Ładowanie statystyk…</p>
          ) : playerStats ? (
            <div className="card account-stats">
              <div className="account-kpis">
                <div className="account-kpi">
                  <span className="display">{playerStats.matches_played}</span>
                  <span className="stat-tile-label">Mecze</span>
                </div>
                <div className="account-kpi is-main">
                  <span className="display">{POINTS_COLUMN.value(playerStats)}</span>
                  <span className="stat-tile-label">Punkty</span>
                </div>
              </div>

              <StatGroupTiles stats={playerStats} previous={playerStats.before_last_match} />
            </div>
          ) : (
            <div className="card account-empty">
              <p className="muted">Brak statystyk. Pojawią się po rozegraniu meczów.</p>
            </div>
          )}
        </section>
      )}

      <section className="account-section">
        <h2>Powiadomienia</h2>
        <NotificationsCard />
      </section>

      <div className="account-columns">
        {/* Informacje osobiste */}
        <section className="account-section">
          <div className="account-section-head">
            <h2>Dane</h2>
            {!showEditProfile && (
              <button type="button" onClick={() => setShowEditProfile(true)} className="btn btn-ghost account-edit">
                <PencilSquareIcon aria-hidden="true" />
                Edytuj
              </button>
            )}
          </div>

          <div className="card">
            {!showEditProfile ? (
              <dl className="info-list">
                {profile?.full_name && (
                  <div>
                    <dt>Imię i nazwisko</dt>
                    <dd>{profile.full_name}</dd>
                  </div>
                )}
                <div>
                  <dt>Ksywka</dt>
                  <dd>{profile?.username || <span className="muted">—</span>}</dd>
                </div>
                <div>
                  <dt>Telefon</dt>
                  <dd>{profile?.phone_number || <span className="muted">—</span>}</dd>
                </div>
                {profile?.league_license_number && (
                  <div>
                    <dt>Nr legitymacji ligowej</dt>
                    <dd className="mono">{profile.league_license_number}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <form onSubmit={handleUpdateProfile} className="account-form">
                {profileError && <div className="form-message is-error" role="alert">{profileError}</div>}
                {profileSuccess && <div className="form-message is-success">{profileSuccess}</div>}

                <div className="field">
                  <label htmlFor="edit-username">Ksywka</label>
                  <input
                    id="edit-username"
                    type="text"
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    placeholder="Wpisz ksywkę"
                    minLength={3}
                    disabled={updateProfileMutation.isPending}
                  />
                  <small className="muted">Minimum 3 znaki.</small>
                </div>

                <div className="field">
                  <label htmlFor="edit-phone">Telefon</label>
                  <input
                    id="edit-phone"
                    type="tel"
                    inputMode="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="Wpisz numer telefonu"
                    disabled={updateProfileMutation.isPending}
                  />
                </div>

                <dl className="info-list is-readonly">
                  {profile?.full_name && (
                    <div>
                      <dt>Imię i nazwisko</dt>
                      <dd>{profile.full_name}</dd>
                    </div>
                  )}
                  {profile?.league_license_number && (
                    <div>
                      <dt>Nr legitymacji ligowej</dt>
                      <dd className="mono">{profile.league_license_number}</dd>
                    </div>
                  )}
                  <p className="muted readonly-note">Tych danych nie można edytować.</p>
                </dl>

                <div className="account-actions">
                  <button type="submit" className="btn btn-primary" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? 'Zapisywanie…' : 'Zapisz'}
                  </button>
                  <button type="button" onClick={cancelEditProfile} className="btn btn-secondary" disabled={updateProfileMutation.isPending}>
                    Anuluj
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Bezpieczeństwo */}
        <section className="account-section">
          <div className="account-section-head">
            <h2>Hasło</h2>
          </div>

          <div className="card">
            {!showChangePassword ? (
              <div className="password-intro">
                <p className="muted">Jeśli nadal masz domyślne hasło od admina, zmień je na własne.</p>
                <button type="button" onClick={() => setShowChangePassword(true)} className="btn btn-secondary">
                  <KeyIcon aria-hidden="true" />
                  Zmień hasło
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="account-form">
                {passwordError && <div className="form-message is-error" role="alert">{passwordError}</div>}
                {passwordSuccess && <div className="form-message is-success">{passwordSuccess}</div>}

                <div className="field">
                  <label htmlFor="new-password">Nowe hasło</label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 znaków"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    disabled={changePasswordMutation.isPending}
                  />
                </div>

                <div className="field">
                  <label htmlFor="confirm-password">Powtórz nowe hasło</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Wpisz hasło jeszcze raz"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    disabled={changePasswordMutation.isPending}
                  />
                </div>

                <div className="account-actions">
                  <button type="submit" className="btn btn-primary" disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? 'Zmienianie…' : 'Zmień hasło'}
                  </button>
                  <button type="button" onClick={cancelChangePassword} className="btn btn-secondary" disabled={changePasswordMutation.isPending}>
                    Anuluj
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
