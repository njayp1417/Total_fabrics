import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span>Add</span>
      </NavLink>

      <NavLink to="/sales" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 3v4M8 3v4M2 11h20"/>
        </svg>
        <span>Sales</span>
      </NavLink>

      <NavLink to="/credit" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <path d="M2 10h20"/>
        </svg>
        <span>Credit</span>
      </NavLink>
    </nav>
  )
}
