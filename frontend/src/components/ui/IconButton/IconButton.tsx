import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import styles from './IconButton.module.css'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visually marks the action as destructive (e.g. delete). */
  danger?: boolean
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ danger, className, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(styles.iconButton, danger && styles.danger, className)}
        {...props}
      />
    )
  },
)

IconButton.displayName = 'IconButton'
