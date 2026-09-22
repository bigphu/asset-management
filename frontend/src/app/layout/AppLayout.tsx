import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import styles from './AppLayout.module.css'

/** Persistent app chrome (sidebar) around whichever route is active. */
export function AppLayout() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
