import { useMemo } from 'react'
import { useAppSelector } from '@/app/store'
import { useAssetsQuery } from '../api/assets.api'
import type { Asset } from '../types'

export interface FilteredAssetsResult {
  isLoading: boolean
  isError: boolean
  /** Every asset matching the current filters — this is what export (ADR-0008) should use. */
  filtered: Asset[]
  /** Just the current page of `filtered`. */
  pageItems: Asset[]
  total: number
  pageCount: number
  locations: string[]
}

/**
 * Server data (TanStack Query) crossed with client filter/sort/page state
 * (Redux `assetsUi`) to produce what the table actually renders. Feature
 * components should read this instead of combining the two themselves.
 */
export function useFilteredAssets(): FilteredAssetsResult {
  const { data, isLoading, isError } = useAssetsQuery()
  const { filters, sort, page, pageSize } = useAppSelector((state) => state.assetsUi)

  const assets = useMemo(() => data ?? [], [data])

  const locations = useMemo(
    () => Array.from(new Set(assets.map((a) => a.location))).sort(),
    [assets],
  )

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    const list = assets.filter((a) => {
      if (filters.type && a.type !== filters.type) return false
      if (filters.status && a.status !== filters.status) return false
      if (filters.location && a.location !== filters.location) return false
      if (
        search &&
        !a.tag.toLowerCase().includes(search) &&
        !a.name.toLowerCase().includes(search)
      ) {
        return false
      }
      return true
    })

    const dir = sort.direction === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      const va = a[sort.key]
      const vb = b[sort.key]
      if (va < vb) return -1 * dir
      if (va > vb) return 1 * dir
      return 0
    })
  }, [assets, filters, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const start = (safePage - 1) * pageSize
  const pageItems = filtered.slice(start, start + pageSize)

  return {
    isLoading,
    isError,
    filtered,
    pageItems,
    total: filtered.length,
    pageCount,
    locations,
  }
}
