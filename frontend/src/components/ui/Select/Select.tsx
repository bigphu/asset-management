import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import styles from './Select.module.css'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select ref={ref} className={cn(styles.select, className)} {...props}>
        {children}
      </select>
    )
  },
)

Select.displayName = 'Select'
