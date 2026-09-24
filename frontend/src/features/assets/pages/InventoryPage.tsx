import { useState } from 'react'
import { PageHeader } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { useAppSelector } from '@/app/store'
// Cross-feature import through export-profiles' public barrel only — see
// that feature's index.ts. Never reach into '@/features/export-profiles/...'.
import { ExportModal } from '@/features/export-profiles'
import { useDeleteAssetMutation, useRestoreAssetMutation } from '../api/assets.api'
import { useFilteredAssets } from '../hooks/useFilteredAssets'
import type { Asset } from '../types'
import { AssetFormModal } from '../components/AssetFormModal'
import { AssetTable } from '../components/AssetTable'
import { AssetToolbar } from '../components/AssetToolbar'

export function InventoryPage() {
  const { pageSize } = useAppSelector((state) => state.assetsUi)
  const { isLoading, isError, pageItems, total, pageCount, locations } = useFilteredAssets()

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
    deleteAsset.mutate(asset.tag, {
      onSuccess: () =>
        toast.show(`Deleted ${asset.tag}.`, {
          undo: { onUndo: () => restoreAsset.mutate(asset.tag) },
        }),
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

      <AssetToolbar
        locations={locations}
        onExport={() => setExportOpen(true)}
        onAdd={handleAdd}
      />

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
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} scopeCount={total} />
    </>
  )
}
