import { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { useDebouncedValue } from '@/utils/useDebouncedValue'
import { useAssetsQuery } from '../api/assets.api'
import { setPage } from '../store/assetsUiSlice'
import type { ApiAssetFilters, Asset, AssetFilters, AssetListParams } from '../types'

/**
 * The popover's conditions in API form. The server applies the rules the
 * popover describes: `is` values of one field OR together (`type=A&type=B`),
 * each `is not` excludes (`typeNot=C`), different fields AND together.
 * Rows without a value are still being edited and are skipped.
 */
export function toApiFilters(filters: AssetFilters): ApiAssetFilters {
  const out: Record<string, string[]> = {}
  for (const c of filters.conditions) {
    if (!c.value) continue
    const key = c.operator === 'isNot' ? `${c.field}Not` : c.field
    ;(out[key] ??= []).push(c.value)
  }
  const search = filters.search.trim()
  return search ? { ...out, search } : out
}

export interface AssetPageResult {
  /** Rows of the current page, as the server filtered, sorted and sliced them. */
  items: Asset[]
  /** Matches across all pages — also the row count an export will contain (ADR-0008). */
  total: number
  /** 1-based position of the first shown row, from the page the server returned — so
   *  "Showing 11–20" never runs ahead of the rows while the next page loads. */
  firstRow: number
  /** The requested page; moves at once so the pager responds before the rows arrive. */
  page: number
  pageSize: number
  pageCount: number
  /** The filters the shown rows were fetched with; the export must reuse exactly these. */
  apiFilters: ApiAssetFilters
  /** First load, with nothing to show yet. */
  isLoading: boolean
  /** A newer page is loading while the previous one stays on screen. */
  isFetching: boolean
  isError: boolean
}

/**
 * Redux list state (`assetsUi`) turned into one server-side page (ADR-0003):
 * the server filters, sorts and pages; this hook only builds the query and
 * keeps the page number in range. Search is debounced so typing doesn't
 * send a request per keystroke.
 */
export function useAssetPage(): AssetPageResult {
  const dispatch = useAppDispatch()
  const { filters, sort, page, pageSize } = useAppSelector((state) => state.assetsUi)
  const search = useDebouncedValue(filters.search)

  const apiFilters = useMemo(
    () => toApiFilters({ ...filters, search }),
    [filters.conditions, search], // eslint-disable-line react-hooks/exhaustive-deps -- raw search is debounced
  )

  const params: AssetListParams = {
    ...apiFilters,
    page,
    pageSize,
    sort: sort.key,
    direction: sort.direction,
  }
  const { data, isLoading, isFetching, isError } = useAssetsQuery(params)

  const total = data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  // A delete or a narrower filter can leave the current page past the end;
  // step back to the last page that has rows.
  useEffect(() => {
    if (data && page > pageCount) dispatch(setPage(pageCount))
  }, [data, page, pageCount, dispatch])

  return {
    items: data?.items ?? [],
    total,
    firstRow: data ? (data.page - 1) * data.pageSize + 1 : 0,
    page: Math.min(page, pageCount),
    pageSize,
    pageCount,
    apiFilters,
    isLoading,
    isFetching,
    isError,
  }
}
