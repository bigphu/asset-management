/**
 * The inventory list's state in the URL query string, so a reload keeps the
 * search, filters, sort and page (S-02) and a filtered view can be shared as
 * a link. ADR-0003 chose offset/limit partly because all of this "fits in the
 * query string"; the parameter names are the API's own (GET /api/assets):
 *
 *   /inventory?search=dell&type=LAPTOP&type=MONITOR&statusNot=RETIRED
 *             &sort=purchaseDate&direction=desc&page=2&pageSize=25
 *
 * Defaults are left out to keep links short. Anything unrecognised or
 * malformed in a hand-edited URL is dropped rather than trusted.
 */

import {
  FILTER_FIELDS,
  SORT_KEYS,
  type AssetSort,
  type FilterCondition,
  type FilterField,
  type SortDirection,
} from '../types'
import type { AssetsUiState } from './assetsUiSlice'
import { PAGE_SIZE_OPTIONS } from './pageSizePreference'

/** List state as the URL carries it; conditions get fresh ids when hydrated. */
export interface ListUrlState {
  search: string
  conditions: Omit<FilterCondition, 'id'>[]
  sort: AssetSort
  page: number
  pageSize?: number
}

const DEFAULT_SORT: AssetSort = { key: 'tag', direction: 'asc' }

/** Same shape the API validates codes against (backend/api/validation.js). */
const CODE = /^[A-Za-z0-9_-]{1,32}$/

const FILTER_PARAMS = new Map<string, { field: FilterField; operator: FilterCondition['operator'] }>(
  FILTER_FIELDS.flatMap((field) => [
    [field, { field, operator: 'is' as const }],
    [`${field}Not`, { field, operator: 'isNot' as const }],
  ]),
)

const LIST_PARAMS = new Set(['search', 'sort', 'direction', 'page', 'pageSize', ...FILTER_PARAMS.keys()])

/**
 * @param preferredPageSize the viewer's saved rows-per-page; only a different
 *        size is written, so links don't impose one needlessly.
 */
export function toListSearch(state: AssetsUiState, preferredPageSize: number): string {
  const params = new URLSearchParams()
  const search = state.filters.search.trim()
  if (search) params.set('search', search)
  // Conditions keep their popover order; rows still being edited have no value yet.
  for (const c of state.filters.conditions) {
    if (c.value) params.append(c.operator === 'isNot' ? `${c.field}Not` : c.field, c.value)
  }
  if (state.sort.key !== DEFAULT_SORT.key || state.sort.direction !== DEFAULT_SORT.direction) {
    params.set('sort', state.sort.key)
    params.set('direction', state.sort.direction)
  }
  if (state.page > 1) params.set('page', String(state.page))
  if (state.pageSize !== preferredPageSize) params.set('pageSize', String(state.pageSize))
  return params.toString()
}

/** Whether the URL says anything about the list at all (vs. a bare /inventory). */
export function hasListParams(params: URLSearchParams): boolean {
  for (const key of params.keys()) if (LIST_PARAMS.has(key)) return true
  return false
}

function positiveInt(raw: string | null): number | undefined {
  if (raw === null || !/^\d+$/.test(raw)) return undefined
  const n = Number(raw)
  return n >= 1 ? n : undefined
}

export function fromListSearch(params: URLSearchParams): ListUrlState {
  const conditions: ListUrlState['conditions'] = []
  const seen = new Set<string>()
  for (const [key, raw] of params) {
    const filter = FILTER_PARAMS.get(key)
    const value = raw.trim().toUpperCase()
    if (!filter || !CODE.test(value)) continue
    const id = `${filter.field}:${filter.operator}:${value}`
    if (seen.has(id)) continue
    seen.add(id)
    conditions.push({ ...filter, value })
  }

  const sortKey = params.get('sort')
  const direction = params.get('direction')
  const sort: AssetSort = {
    key: (SORT_KEYS as readonly string[]).includes(sortKey ?? '')
      ? (sortKey as AssetSort['key'])
      : DEFAULT_SORT.key,
    direction: direction === 'asc' || direction === 'desc' ? (direction as SortDirection) : DEFAULT_SORT.direction,
  }

  const pageSize = positiveInt(params.get('pageSize'))
  return {
    search: (params.get('search') ?? '').slice(0, 100),
    conditions,
    sort,
    // Out-of-range pages are clamped once the total is known (useAssetPage).
    page: positiveInt(params.get('page')) ?? 1,
    pageSize: pageSize && (PAGE_SIZE_OPTIONS as readonly number[]).includes(pageSize) ? pageSize : undefined,
  }
}
