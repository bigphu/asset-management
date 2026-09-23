import { useEffect, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { IconButton } from '@/components/ui/IconButton'
import styles from './Drawer.module.css'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  /** Wider variant for content-heavy drawers (e.g. the export column editor). */
  wide?: boolean
  children: ReactNode
  footer?: ReactNode
}

/** Controlled slide-over panel with a scrim. Renders unmounted when closed. */
export function Drawer({ open, onClose, title, description, wide, children, footer }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <>
      <div
        className={cn(styles.scrim, open && styles.scrimOpen)}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(styles.drawer, wide && styles.wide, open && styles.open)}
        aria-hidden={!open}
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{title}</h2>
            {description && <p className={styles.description}>{description}</p>}
          </div>
          <IconButton aria-label="Close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </IconButton>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </aside>
    </>
  )
}
