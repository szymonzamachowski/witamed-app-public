import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import './nav.css'

export default function NavBar() {
  const { user, profile, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Debug - sprawdź wartości
  useEffect(() => {
    console.log('NavBar - user:', user?.id, 'profile:', profile?.role, 'loading:', loading, 'isAdmin:', profile?.role === 'admin')
  }, [user, profile, loading])

  // Zamknij menu po kliknięciu w link
  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="nav">
      <NavLink to="/" end className="brand" onClick={handleLinkClick}>
        <img src="/photos/logo.png" alt="team logo" className="nav-logo" />
        <div className="team-name">
          <span className="team-main">Witamed</span>
          <span className="team-sub">Murarska</span>
        </div>
      </NavLink>
      
      {/* Hamburger button */}
      <button 
        className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <NavLink to="/" end className={(p: {isActive: boolean})=> p.isActive? 'active':''} onClick={handleLinkClick}>Główna</NavLink>
        <NavLink to="/matches" className={(p: {isActive: boolean})=> p.isActive? 'active':''} onClick={handleLinkClick}>Mecze</NavLink>
        <NavLink to="/attendance" className={(p: {isActive: boolean})=> p.isActive? 'active':''} onClick={handleLinkClick}>Obecność</NavLink>
        <NavLink to="/calendar" className={(p: {isActive: boolean})=> p.isActive? 'active':''} onClick={handleLinkClick}>Terminarz</NavLink>
        <NavLink to="/statistics" className={(p: {isActive: boolean})=> p.isActive? 'active':''} onClick={handleLinkClick}>Statystyki</NavLink>
        {!loading && (
          user ? (
        <>
          {/* Pokazuj link do panelu admina jeśli profile jest załadowane i użytkownik jest adminem */}
          {profile && profile.role === 'admin' && (
            <NavLink to="/admin" className={(p: {isActive: boolean})=> p.isActive? 'active':''} onClick={handleLinkClick}>
              Panel Admina
            </NavLink>
          )}
          <NavLink to="/account" className={(p: {isActive: boolean})=> p.isActive? 'active':''} onClick={handleLinkClick}>
            Moje konto
          </NavLink>
        </>
          ) : (
            <NavLink to="/login" className={(p: {isActive: boolean})=> p.isActive? 'active':''} onClick={handleLinkClick}>
              Logowanie
            </NavLink>
          )
        )}
      </div>
    </nav>
  )
}
