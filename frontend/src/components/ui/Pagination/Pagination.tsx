import { cn } from '@/utils/cn'
import { pageSlots } from './pageSlots'
import styles from './Pagination.module.css'

export interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.pageBtn}
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        &larr;
      </button>
      {pageSlots(page, pageCount).map((slot) =>
        typeof slot === 'number' ? (
          <button
            key={slot}
            type="button"
            className={cn(styles.pageBtn, styles.tabular, slot === page && styles.active)}
            onClick={() => onPageChange(slot)}
            aria-label={`Page ${slot}`}
            aria-current={slot === page ? 'page' : undefined}
          >
            {slot}
          </button>
        ) : (
          <span key={slot} className={styles.gap} aria-hidden="true">
            …
          </span>
        ),
      )}
      <button
        type="button"
        className={styles.pageBtn}
        disabled={page === pageCount}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        &rarr;
      </button>
    </nav>
  )
}
