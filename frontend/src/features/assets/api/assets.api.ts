import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, type Page } from '@/lib/apiClient'
import type { Asset, AssetInput, ReferenceData } from '../types'

// ---------------------------------------------------------------------------
// Backend calls. Contract: backend/api/routes/assets.js, browsable at /api/docs.
// ---------------------------------------------------------------------------

/** The API's maximum page size (backend/api/dto/assets.dto.js). */
const MAX_PAGE_SIZE = 500

/**
 * Loads every asset, following pages. The table filters, sorts and pages on
 * the client (`useFilteredAssets`), which suits hundreds of rows; if the
 * inventory grows well past that, move paging server-side (ADR-0003) by
 * sending the filters as query params and keying the query on them.
 */
async function fetchAssets(): Promise<Asset[]> {
  const items: Asset[] = []
  for (let page = 1; ; page++) {
    const res = await apiClient.get<Page<Asset>>('/assets', { page, pageSize: MAX_PAGE_SIZE })
    items.push(...res.items)
    if (res.items.length === 0 || items.length >= res.total) return items
  }
}

const createAsset = (input: AssetInput) => apiClient.post<Asset>('/assets', input)

const updateAsset = (id: string, input: AssetInput) =>
  apiClient.put<Asset>(`/assets/${encodeURIComponent(id)}`, input)

/** Soft delete (ADR-0002) — reversible with `restoreAsset`. */
const deleteAsset = (id: string) => apiClient.delete(`/assets/${encodeURIComponent(id)}`)

const restoreAsset = (id: string) => apiClient.post<Asset>(`/assets/${encodeURIComponent(id)}/restore`)

const fetchReferenceData = () => apiClient.get<ReferenceData>('/reference-data')

// ---------------------------------------------------------------------------
// Query keys — one factory so every hook and invalidation call agrees on shape.
// ---------------------------------------------------------------------------

export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  referenceData: () => ['reference-data'] as const,
}

// ---------------------------------------------------------------------------
// Public hooks — this is what feature components import.
// ---------------------------------------------------------------------------

export function useAssetsQuery() {
  return useQuery({
    queryKey: assetKeys.lists(),
    queryFn: fetchAssets,
  })
}

/** Codes and display names for the type/status/location pickers; changes rarely. */
export function useReferenceDataQuery() {
  return useQuery({
    queryKey: assetKeys.referenceData(),
    queryFn: fetchReferenceData,
    staleTime: 5 * 60_000,
  })
}

export function useCreateAssetMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AssetInput) => createAsset(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
  })
}

export function useUpdateAssetMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AssetInput }) => updateAsset(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
  })
}

export function useDeleteAssetMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAsset(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
  })
}

export function useRestoreAssetMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => restoreAsset(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
  })
}
