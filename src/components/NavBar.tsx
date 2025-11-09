import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'
import './nav.css'

export default function NavBar() {
  const { user, profile, loading } = useAuth()

  // Debug - sprawdź wartości
  useEffect(() => {
    console.log('NavBar - user:', user?.id, 'profile:', profile?.role, 'loading:', loading, 'isAdmin:', profile?.role === 'admin')
  }, [user, profile, loading])

  return (
    <nav className="nav">
      <NavLink to="/" end className="brand">
        <img src="/photos/logo.png" alt="team logo" className="nav-logo" />
        <div className="team-name">
          <span className="team-main">Witamed</span>
          <span className="team-sub">Murarska</span>
        </div>
      </NavLink>
      <div className="links">
        <NavLink to="/" end className={(p: {isActive: boolean})=> p.isActive? 'active':''}>Główna</NavLink>
        <NavLink to="/matches" className={(p: {isActive: boolean})=> p.isActive? 'active':''}>Mecze</NavLink>
        <NavLink to="/attendance" className={(p: {isActive: boolean})=> p.isActive? 'active':''}>Obecność</NavLink>
        <NavLink to="/calendar" className={(p: {isActive: boolean})=> p.isActive? 'active':''}>Terminarz</NavLink>
        <NavLink to="/statistics" className={(p: {isActive: boolean})=> p.isActive? 'active':''}>Statystyki</NavLink>
        {!loading && (
          user ? (
            <>
              {/* Pokazuj link do panelu admina jeśli profile jest załadowane i użytkownik jest adminem */}
              {profile && profile.role === 'admin' && (
                <NavLink to="/admin" className={(p: {isActive: boolean})=> p.isActive? 'active':''}>
                  Panel Admina
                </NavLink>
              )}
              <NavLink to="/account" className={(p: {isActive: boolean})=> p.isActive? 'active':''}>
                Moje konto
              </NavLink>
            </>
          ) : (
            <NavLink to="/login" className={(p: {isActive: boolean})=> p.isActive? 'active':''}>
              Logowanie
            </NavLink>
          )
        )}
      </div>
    </nav>
  )
}
