import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './Menu.module.css'

export interface MenuItem {
  label: string
  onSelect: () => void
  danger?: boolean
}

export interface MenuProps {
  trigger: ReactNode
  items: MenuItem[]
  /** Accessible label for the trigger button. */
  triggerLabel: string
}

/** Self-contained overflow menu (the row "⋯" kebab). Owns its own open state. */
export function Menu({ trigger, items, triggerLabel }: MenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={triggerLabel}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {trigger}
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={cn(styles.item, item.danger && styles.danger)}
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
