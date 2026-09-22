import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector, toggleSidebar } from '@/app/store'
import { cn } from '@/utils/cn'
import styles from './Sidebar.module.css'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/inventory',
    label: 'Inventory',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    to: '/export-profiles',
    label: 'Export profiles',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed)
  const dispatch = useAppDispatch()

  return (
    <aside className={cn(styles.sidebar, collapsed && styles.collapsed)}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 28 28">
              <rect x="0" y="0" width="28" height="28" rx="7" fill="#3e6ff5" />
              <rect x="6" y="6" width="16" height="16" rx="2" fill="none" stroke="#ffffff" strokeWidth="1.6" />
              <line x1="6" y1="12.3" x2="22" y2="12.3" stroke="#ffffff" strokeWidth="1.3" />
              <line x1="6" y1="17.6" x2="22" y2="17.6" stroke="#ffffff" strokeWidth="1.3" />
              <line x1="12.6" y1="6" x2="12.6" y2="22" stroke="#ffffff" strokeWidth="1.3" />
            </svg>
          </span>
          <span className={styles.brandWord}>
            Asset<span className={styles.brandWordAccent}>Ledger</span>
          </span>
        </div>
        <button
          type="button"
          className={styles.collapseBtn}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => dispatch(toggleSidebar())}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(styles.collapseIcon, collapsed && styles.collapseIconFlipped)}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className={({ isActive }) => cn(styles.navItem, isActive && styles.navItemActive)}
          >
            {item.icon}
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>Signed in as Phu &middot; Asset Manager</div>
    </aside>
  )
}
