import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './nav.css'

export default function NavBar() {
  const { user, profile, loading } = useAuth()

  return (
    <nav className="nav">
      <div className="brand">
        <img src="/photos/logo.png" alt="team logo" className="nav-logo" />
        <div className="team-name">
          <span className="team-main">Witamed</span>
          <span className="team-sub">Murarska</span>
        </div>
      </div>
      <div className="links">
        <NavLink to="/" end className={(p: {isActive: boolean})=> p.isActive? 'active':''}>Główna</NavLink>
        <NavLink to="/matches" className={(p: {isActive: boolean})=> p.isActive? 'active':''}>Mecze</NavLink>
        <NavLink to="/attendance" className={(p: {isActive: boolean})=> p.isActive? 'active':''}>Obecność</NavLink>
        <NavLink to="/calendar" className={(p: {isActive: boolean})=> p.isActive? 'active':''}>Kalendarz</NavLink>
        {!loading && (
          user ? (
            <NavLink to="/account" className={(p: {isActive: boolean})=> p.isActive? 'active':''}>
              Moje konto
            </NavLink>
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
