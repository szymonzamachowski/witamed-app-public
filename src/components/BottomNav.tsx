import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'
import './bottom-nav.css'

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Nawigacja">
      {NAV_ITEMS.map(({ to, label, end, Icon }) => (
        <NavLink key={to} to={to} end={end} className="bottom-nav-item">
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
