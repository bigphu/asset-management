import { Button, Input, Select } from '@/components/ui'
import { useAppDispatch, useAppSelector } from '@/app/store'
import {
  setSearch,
  setTypeFilter,
  setStatusFilter,
  setLocationFilter,
} from '../store/assetsUiSlice'
import { ASSET_STATUSES, ASSET_TYPES } from '../types'
import styles from './AssetToolbar.module.css'

export interface AssetToolbarProps {
  locations: string[]
  onAddAsset: () => void
  onExport: () => void
}

export function AssetToolbar({ locations, onAddAsset, onExport }: AssetToolbarProps) {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.assetsUi.filters)

  return (
    <div className={styles.toolbar}>
      <Button variant="primary" onClick={onAddAsset}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        New asset
      </Button>
      <Button variant="ghost-accent" onClick={onExport}>
        Export to Excel
      </Button>

      <div className={styles.spacer} />

      <div className={styles.search}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <Input
          type="text"
          placeholder="Search…"
          aria-label="Search assets by tag or name"
          value={filters.search}
          onChange={(e) => dispatch(setSearch(e.target.value))}
          className={styles.searchInput}
        />
      </div>

      <Select
        aria-label="Filter by type"
        value={filters.type}
        onChange={(e) => dispatch(setTypeFilter(e.target.value as typeof filters.type))}
      >
        <option value="">All types</option>
        {ASSET_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by status"
        value={filters.status}
        onChange={(e) => dispatch(setStatusFilter(e.target.value as typeof filters.status))}
      >
        <option value="">All statuses</option>
        {ASSET_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by location"
        value={filters.location}
        onChange={(e) => dispatch(setLocationFilter(e.target.value))}
      >
        <option value="">All locations</option>
        {locations.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </Select>
    </div>
  )
}
