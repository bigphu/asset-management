import { useEffect, useLayoutEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { hydrateList } from '../store/assetsUiSlice'
import { fromListSearch, hasListParams, toListSearch } from '../store/listUrl'
import { loadPageSize } from '../store/pageSizePreference'

/**
 * Keeps the inventory list state (Redux `assetsUi`) and the URL in step, so
 * a reload or a shared link restores the same view (S-02). Redux stays the
 * working state; the URL mirrors it:
 *
 * - On arrival, a URL with list parameters (reload, shared link, history)
 *   wins and hydrates the state. A bare `/inventory` (the sidebar link)
 *   keeps the state from earlier in the session and writes it into the URL.
 * - After that, every state change is written back with `replace`, so paging
 *   and typing don't pile up history entries.
 *
 * Returns false until the arrival step has run. Callers render nothing until
 * then, so the first request already uses the URL's filters. The step runs in
 * a layout effect, before paint, so there is no visible blank frame.
 */
export function useListUrlSync(): boolean {
  const dispatch = useAppDispatch()
  const list = useAppSelector((state) => state.assetsUi)
  const [searchParams, setSearchParams] = useSearchParams()
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    if (hasListParams(searchParams)) dispatch(hydrateList(fromListSearch(searchParams)))
    setReady(true)
    // Arrival only; later URL changes are this hook's own writes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ready) return
    const next = toListSearch(list, loadPageSize())
    // Also restores the parameters if the URL is reset while the page is
    // open, e.g. by clicking the sidebar's Inventory link.
    if (next !== searchParams.toString()) setSearchParams(next, { replace: true })
  }, [ready, list, searchParams, setSearchParams])

  return ready
}
