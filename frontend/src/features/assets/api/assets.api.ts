import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Asset, AssetInput } from '../types'
import { mockAssets } from './mockAssets'

// ---------------------------------------------------------------------------
// Mock "backend". Replace the bodies of the five functions below with
// `apiClient` calls once the real endpoint exists — the query/mutation hooks
// underneath don't need to change.
// ---------------------------------------------------------------------------

const deletedTags = new Set<string>()

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

async function fetchAssets(): Promise<Asset[]> {
  return delay(mockAssets.filter((a) => !deletedTags.has(a.tag)))
}

async function createAsset(input: AssetInput): Promise<Asset> {
  const created: Asset = { id: input.tag, ...input }
  mockAssets.push(created)
  return delay(created)
}

async function updateAsset(id: string, input: AssetInput): Promise<Asset> {
  const index = mockAssets.findIndex((a) => a.id === id)
  const updated: Asset = { id: input.tag, ...input }
  if (index !== -1) mockAssets[index] = updated
  return delay(updated)
}

async function deleteAsset(tag: string): Promise<void> {
  deletedTags.add(tag)
  return delay(undefined)
}

async function restoreAsset(tag: string): Promise<void> {
  deletedTags.delete(tag)
  return delay(undefined)
}

// ---------------------------------------------------------------------------
// Query keys — one factory so every hook and invalidation call agrees on shape.
// ---------------------------------------------------------------------------

export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
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
    mutationFn: (tag: string) => deleteAsset(tag),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
  })
}

export function useRestoreAssetMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tag: string) => restoreAsset(tag),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
  })
}
