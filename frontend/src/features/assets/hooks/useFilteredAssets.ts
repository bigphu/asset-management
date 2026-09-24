import { useMemo } from 'react'
import { useAppSelector } from '@/app/store'
import { useAssetsQuery } from '../api/assets.api'
import type { Asset, AssetFilters, AssetSort, FilterCondition } from '../types'

export interface FilteredAssetsResult {
  isLoading: boolean
  isError: boolean
  /** Every asset matching the current filters — the rows an export will contain (ADR-0008). */
  filtered: Asset[]
  /** Just the current page of `filtered`. */
  pageItems: Asset[]
  total: number
  pageCount: number
}

/**
 * The popover's conditions in the API's filter form, for the server-side
 * export. The API applies the same rules as `matchesConditions` below: `is`
 * values of one field OR together (`type=A&type=B`), each `is not` excludes
 * (`typeNot=C`), and different fields AND together.
 */
export function toApiFilters(filters: AssetFilters): Record<string, string | string[]> {
  const out: Record<string, string[]> = {}
  for (const c of filters.conditions) {
    if (!c.value) continue
    const key = c.operator === 'isNot' ? `${c.field}Not` : c.field
    ;(out[key] ??= []).push(c.value)
  }
  const search = filters.search.trim()
  return search ? { ...out, search } : out
}

/** What each sortable column orders by: codes sort by their display name, as on screen and on the server. */
const SORT_VALUE: Record<AssetSort['key'], (a: Asset) => string> = {
  tag: (a) => a.tag,
  name: (a) => a.name,
  type: (a) => a.typeName,
  status: (a) => a.statusName,
  location: (a) => a.locationName,
  purchaseDate: (a) => a.purchaseDate,
}

/**
 * Rows without a value are still being edited and are skipped. Across fields
 * the conditions AND together; within one field the "is" rows OR together
 * (Status is In Use + Status is Under Repair = either), because ANDing two
 * different values of one column could never match anything. "is not" rows
 * always AND, so each one excludes its value.
 */
export function matchesConditions(asset: Asset, conditions: FilterCondition[]): boolean {
  const anyOf = new Map<FilterCondition['field'], Set<string>>()
  for (const c of conditions) {
    if (!c.value) continue
    if (c.operator === 'isNot') {
      if (asset[c.field] === c.value) return false
    } else {
      const values = anyOf.get(c.field) ?? new Set<string>()
      values.add(c.value)
      anyOf.set(c.field, values)
    }
  }
  for (const [field, values] of anyOf) {
    if (!values.has(asset[field])) return false
  }
  return true
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

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    const list = assets.filter((a) => {
      if (!matchesConditions(a, filters.conditions)) return false
      if (
        search &&
        !a.tag.toLowerCase().includes(search) &&
        !a.name.toLowerCase().includes(search)
      ) {
        return false
      }
      return true
    })

    // Locale-aware, like the server's collation: display names are Vietnamese,
    // and a code-unit `<` would misplace accented letters. The sort is stable
    // and the server returns tag order, so ties stay in tag order — as in the
    // export.
    const dir = sort.direction === 'asc' ? 1 : -1
    const value = SORT_VALUE[sort.key]
    return [...list].sort((a, b) => dir * value(a).localeCompare(value(b)))
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
  }
}
