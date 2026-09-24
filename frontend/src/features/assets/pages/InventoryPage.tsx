import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { describeError } from '@/lib/apiClient'
import { useAppSelector } from '@/app/store'
// Cross-feature import through export-profiles' public barrel only — see
// that feature's index.ts. Never reach into '@/features/export-profiles/...'.
import { ExportModal, type ExportScope } from '@/features/export-profiles'
import { useDeleteAssetMutation, useRestoreAssetMutation } from '../api/assets.api'
import { toApiFilters, useFilteredAssets } from '../hooks/useFilteredAssets'
import type { Asset } from '../types'
import { AssetFormModal } from '../components/AssetFormModal'
import { AssetTable } from '../components/AssetTable'
import { AssetToolbar } from '../components/AssetToolbar'

export function InventoryPage() {
  const { pageSize, filters, sort } = useAppSelector((state) => state.assetsUi)
  const { isLoading, isError, pageItems, total, pageCount } = useFilteredAssets()

  // The export re-runs the list's query on the server (ADR-0008), so it gets
  // the same filters and sort the table is showing.
  const exportScope = useMemo<ExportScope>(
    () => ({ filters: toApiFilters(filters), sort }),
    [filters, sort],
  )

  const deleteAsset = useDeleteAssetMutation()
  const restoreAsset = useRestoreAssetMutation()
  const toast = useToast()

  const [formAsset, setFormAsset] = useState<Asset | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  const page = useAppSelector((state) => Math.min(state.assetsUi.page, pageCount))

  function handleAdd() {
    setFormAsset(null)
    setFormOpen(true)
  }

  function handleEdit(asset: Asset) {
    setFormAsset(asset)
    setFormOpen(true)
  }

  function handleDelete(asset: Asset) {
    const onError = (error: Error) => toast.show(describeError(error))
    deleteAsset.mutate(asset.id, {
      onSuccess: () =>
        toast.show(`Deleted ${asset.tag}.`, {
          undo: { onUndo: () => restoreAsset.mutate(asset.id, { onError }) },
        }),
      onError,
    })
  }

  return (
    <>
      {/* Actions live in the toolbar, next to search and filters — the
          Cloudflare-dashboard pattern — so the header is title only. */}
      <PageHeader
        title="Inventory"
        subtitle="Everything the company owns, where it lives, and what condition it's in."
      />

      <AssetToolbar onExport={() => setExportOpen(true)} onAdd={handleAdd} />

      <AssetTable
        pageItems={pageItems}
        total={total}
        page={page}
        pageSize={pageSize}
        pageCount={pageCount}
        isLoading={isLoading}
        isError={isError}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AssetFormModal open={formOpen} asset={formAsset} onClose={() => setFormOpen(false)} />
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        scopeCount={total}
        scope={exportScope}
      />
    </>
  )
}
