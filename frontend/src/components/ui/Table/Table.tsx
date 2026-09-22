import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import styles from './Table.module.css'

function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.container, className)} {...props} />
}

function Root({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cn(styles.table, className)} {...props} />
}

function Head({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn(styles.thead, className)} {...props} />
}

function Body(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />
}

function Row({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn(styles.row, className)} {...props} />
}

export interface HeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean
  sortActive?: boolean
  sortDirection?: 'asc' | 'desc'
}

function HeaderCell({
  sortable,
  sortActive,
  sortDirection = 'asc',
  className,
  children,
  ...props
}: HeaderCellProps) {
  return (
    <th
      className={cn(styles.th, sortable && styles.sortable, sortActive && styles.sortActive, className)}
      {...props}
    >
      {children}
      {sortable && (
        <span className={styles.sortArrow}>{sortDirection === 'asc' ? '▲' : '▼'}</span>
      )}
    </th>
  )
}

function Cell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn(styles.td, className)} {...props} />
}

/** Compound Table primitive: `<Table.Container><Table.Root>...`. */
export const Table = {
  Container,
  Root,
  Head,
  Body,
  Row,
  HeaderCell,
  Cell,
}
