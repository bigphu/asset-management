import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import styles from './Checkbox.module.css'

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement>

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input ref={ref} type="checkbox" className={cn(styles.checkbox, className)} {...props} />
    )
  },
)

Checkbox.displayName = 'Checkbox'
