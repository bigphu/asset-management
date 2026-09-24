import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import styles from './Input.module.css'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn(styles.input, className)} {...props} />
  },
)

Input.displayName = 'Input'
