import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import styles from './Badge.module.css'

export type BadgeTone = 'good' | 'warn' | 'critical' | 'neutral'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  /** Fully rounded "pill" shape (status badges) vs a small rounded-rect (category tags). */
  shape?: 'pill' | 'rect'
}

export function Badge({ tone = 'neutral', shape = 'pill', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(styles.badge, styles[tone], styles[shape], className)}
      {...props}
    />
  )
}
