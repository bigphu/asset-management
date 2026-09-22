import { clsx, type ClassValue } from 'clsx'

/** Conditionally join class names. Thin re-export so call sites import from one place. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
