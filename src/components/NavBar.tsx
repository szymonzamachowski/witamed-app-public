import { NavLink, Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import ThemeToggle from './ThemeToggle'
import { NAV_ITEMS } from './navItems'
import './nav.css'

export default function NavBar() {
  const { user, profile, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // Zamknij menu profilu po zmianie strony
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Zamknij menu profilu po kliknięciu poza nim
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const isAdmin = profile?.role === 'admin'

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand" aria-label="Witamed - strona główna">
          <span className="brand-logo"><img src="/photos/logo.png" alt="" /></span>
          <span className="brand-name display">Witamed</span>
        </Link>

        <nav className="topbar-links" aria-label="Główna nawigacja">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-actions">
          <ThemeToggle />

          {loading ? (
            <span className="icon-button" aria-hidden="true" />
          ) : user ? (
            <div className="profile-menu" ref={menuRef}>
              <button
                type="button"
                className={`icon-button ${menuOpen ? 'is-open' : ''}`}
                onClick={() => setMenuOpen(open => !open)}
                aria-label="Menu konta"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <UserCircleIcon aria-hidden="true" />
              </button>
              {menuOpen && (
                <div className="profile-dropdown" role="menu">
                  {profile?.full_name && <div className="profile-dropdown-name">{profile.full_name}</div>}
                  <NavLink to="/account" role="menuitem">Moje konto</NavLink>
                  <NavLink to="/zeszly-sezon" role="menuitem">Zeszły sezon</NavLink>
                  {isAdmin && <NavLink to="/admin" role="menuitem">Panel Admina</NavLink>}
                  <NavLink to="/instalacja" role="menuitem">Aplikacja na telefon</NavLink>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="icon-button" aria-label="Logowanie" title="Logowanie">
              <UserCircleIcon aria-hidden="true" />
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}
