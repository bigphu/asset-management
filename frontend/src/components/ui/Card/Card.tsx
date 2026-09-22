import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import styles from './Card.module.css'

export type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return <div className={cn(styles.card, className)} {...props} />
}
