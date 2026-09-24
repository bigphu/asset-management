import { forwardRef, type InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Input } from '@/components/ui/Input'
import styles from './SearchField.module.css'

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Every search field is icon-only, so it needs a spoken name. */
  'aria-label': string
  /** Applied to the outer field, e.g. to size it inside a flex toolbar. */
  className?: string
}

/** Toolbar search: a 40px outlined field with a leading magnifier. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn(styles.search, className)}>
        <Search size={18} aria-hidden="true" />
        <Input ref={ref} type="text" className={styles.searchInput} {...props} />
      </div>
    )
  },
)

SearchField.displayName = 'SearchField'
