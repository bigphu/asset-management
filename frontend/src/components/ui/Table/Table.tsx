import type {
  HTMLAttributes,
  MouseEventHandler,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react'
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

export interface HeaderCellProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'onClick'> {
  /** On a sortable header this lands on the inner button, so it is typed for any element. */
  onClick?: MouseEventHandler<HTMLElement>
  sortable?: boolean
  sortActive?: boolean
  sortDirection?: 'asc' | 'desc'
}

/**
 * A sortable header puts its label in a real button, so sorting is reachable
 * by Tab and Enter/Space, and reports its state through `aria-sort` on the
 * `<th>`. `onClick` goes to that button.
 */
function HeaderCell({
  sortable,
  sortActive,
  sortDirection = 'asc',
  className,
  children,
  onClick,
  ...props
}: HeaderCellProps) {
  const ariaSort = !sortable
    ? undefined
    : sortActive
      ? sortDirection === 'asc'
        ? 'ascending'
        : 'descending'
      : 'none'

  return (
    <th
      className={cn(styles.th, sortable && styles.sortable, sortActive && styles.sortActive, className)}
      aria-sort={ariaSort}
      onClick={sortable ? undefined : onClick}
      {...props}
    >
      {sortable ? (
        <button type="button" className={styles.sortButton} onClick={onClick}>
          {children}
          <span className={styles.sortArrow} aria-hidden="true">
            {sortDirection === 'asc' ? '▲' : '▼'}
          </span>
        </button>
      ) : (
        children
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
