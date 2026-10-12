import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { safeRedirect } from '../utils/safeRedirect'
import { useAuth } from '../hooks/useAuth'
import './auth.css'

export default function Login() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { user, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = safeRedirect(searchParams.get('redirect'))

  // Zalogowany użytkownik nie ma tu czego szukać
  useEffect(() => {
    if (!loading && user && !submitting) navigate(redirectTo, { replace: true })
  }, [loading, user, submitting, navigate, redirectTo])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error } = await signIn(login, password, rememberMe)

    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Nieprawidłowy login lub hasło.' : error.message)
      setSubmitting(false)
    } else {
      navigate(redirectTo)
    }
  }

  return (
    <div className="page auth-page">
      <div className="card auth-card">
        <div className="auth-brand">
          <span className="auth-logo"><img src="/photos/logo.png" alt="" /></span>
          <div>
            <h1>Logowanie</h1>
            <p className="muted">Zaloguj się do konta Witamed</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="login">Login</label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              required
              placeholder="np. kowalski"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={submitting}
            />
            <small className="muted">Loginem jest Twoje nazwisko.</small>
          </div>

          <div className="auth-field">
            <label htmlFor="password">Hasło</label>
            <div className="password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={submitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeSlashIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
              </button>
            </div>
          </div>

          <label htmlFor="rememberMe" className="auth-check">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              disabled={submitting}
            />
            <span>Zapamiętaj mnie</span>
          </label>

          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting || !login || !password}>
            {submitting ? 'Logowanie…' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  )
}
