import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'ghost-accent'
export type ButtonSize = 'md' | 'sm'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'outline', size = 'md', className, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(styles.button, styles[variant], styles[size], className)}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
