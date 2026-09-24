import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './Toast.module.css'

export interface ToastOptions {
  /** Label + handler for an inline undo action, e.g. after a delete. */
  undo?: { label?: string; onUndo: () => void }
  /** Milliseconds before auto-dismiss. */
  duration?: number
}

interface ToastState {
  id: number
  message: string
  undo?: ToastOptions['undo']
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/**
 * Toast state intentionally lives in React Context, not Redux: a toast can
 * carry an `onUndo` callback, and callbacks aren't serializable — putting
 * them in the Redux store would fight the tooling (and DevTools) that make
 * Redux worth using in the first place. Redux stays for state that's plain
 * data (filters, selection, drawer flags); this stays for ephemeral,
 * callback-carrying UI feedback.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const show = useCallback((message: string, options?: ToastOptions) => {
    clearTimeout(timerRef.current)
    setToast({ id: Date.now(), message, undo: options?.undo })
    timerRef.current = setTimeout(() => setToast(null), options?.duration ?? 6000)
  }, [])

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className={cn(styles.wrap, toast && styles.show)}>
        {toast && (
          <div className={styles.toast}>
            <span>{toast.message}</span>
            {toast.undo && (
              <button
                type="button"
                className={styles.undo}
                onClick={() => {
                  toast.undo?.onUndo()
                  dismiss()
                }}
              >
                {toast.undo.label ?? 'Undo'}
              </button>
            )}
            <button type="button" className={styles.close} aria-label="Dismiss" onClick={dismiss}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
