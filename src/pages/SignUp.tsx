import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import './auth.css'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [leagueLicenseNumber, setLeagueLicenseNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne')
      return
    }

    if (password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków')
      return
    }

    setLoading(true)

    // Rejestracja użytkownika
    const { data: authData, error: authError } = await signUp(
      email,
      password,
      {
        username: username || email.split('@')[0],
        full_name: fullName,
        phone_number: phoneNumber,
        league_license_number: leagueLicenseNumber,
        role: 'player'
      }
    )

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Utworzenie profilu
    if (authData?.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: username || email.split('@')[0],
            full_name: fullName,
            phone_number: phoneNumber,
            league_license_number: leagueLicenseNumber,
            role: 'player'
          })

        if (profileError) {
          console.error('Błąd przy tworzeniu profilu:', profileError)
          // Nie przerywamy - użytkownik może się zalogować
        }
      } catch (err) {
        console.error('Błąd:', err)
      }
    }

    navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Rejestracja</h1>
          <p>Utwórz nowe konto zawodnika</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="twoj@email.pl"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 6 znaków"
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Potwierdź hasło</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Imię i nazwisko</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Jan Kowalski"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Nazwa użytkownika (opcjonalne)</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jan_kowalski"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Numer telefonu (opcjonalne)</label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+48 123 456 789"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="leagueLicenseNumber">Numer legitymacji ligowej (opcjonalne)</label>
            <input
              id="leagueLicenseNumber"
              type="text"
              value={leagueLicenseNumber}
              onChange={(e) => setLeagueLicenseNumber(e.target.value)}
              placeholder="12345"
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Masz już konto? <Link to="/login">Zaloguj się</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

