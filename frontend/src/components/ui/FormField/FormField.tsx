import type { ReactNode } from 'react'
import styles from './FormField.module.css'

export interface FormFieldProps {
  label: string
  htmlFor: string
  hint?: string
  children: ReactNode
}

/** Label + control + optional hint, laid out consistently for every form field. */
export function FormField({ label, htmlFor, hint, children }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
      </label>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}
