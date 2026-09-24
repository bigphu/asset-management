import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import styles from './AppLayout.module.css'

/** Persistent app chrome (sidebar) around whichever route is active. */
export function AppLayout() {
  return (
    <div className={styles.app}>
      <Sidebar />
      {/* .content owns the scroll and the padding; .inner caps the measure, so
          the cap applies to the page content without clipping the scrollbar. */}
      <main className={styles.content}>
        <div className={styles.inner}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
