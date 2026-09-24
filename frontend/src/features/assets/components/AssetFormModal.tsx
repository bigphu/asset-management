import { useEffect, useState, type FormEvent } from 'react'
import { Button, FormField, Modal, Input, Select } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { useAssetsQuery, useCreateAssetMutation, useUpdateAssetMutation } from '../api/assets.api'
import { ASSET_STATUSES, ASSET_TYPES, type Asset, type AssetInput } from '../types'
import styles from './AssetFormModal.module.css'

export interface AssetFormModalProps {
  open: boolean
  /** null means "add"; an Asset means "edit" that asset. */
  asset: Asset | null
  onClose: () => void
}

const EMPTY_FORM: AssetInput = {
  tag: '',
  name: '',
  type: ASSET_TYPES[0],
  status: ASSET_STATUSES[0],
  location: '',
  purchaseDate: '',
}

export function AssetFormModal({ open, asset, onClose }: AssetFormModalProps) {
  const [form, setForm] = useState<AssetInput>(EMPTY_FORM)
  const [error, setError] = useState('')

  const { data: assets = [] } = useAssetsQuery()
  const createAsset = useCreateAssetMutation()
  const updateAsset = useUpdateAssetMutation()
  const toast = useToast()

  const isEditing = asset !== null
  const isSaving = createAsset.isPending || updateAsset.isPending

  // The Modal stays mounted (and is hidden via CSS) rather than
  // unmounting when closed, so a `key`-based reset won't work here — this
  // effect is the pragmatic way to snap the form back to a clean state each
  // time it opens.
  useEffect(() => {
    if (!open) return
    setError('')
    setForm(asset ? { ...asset } : EMPTY_FORM)
  }, [open, asset])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const duplicate = assets.some(
      (a) => a.tag.toLowerCase() === form.tag.toLowerCase() && a.id !== asset?.id,
    )
    if (duplicate) {
      setError(`Asset tag "${form.tag}" is already in use. Choose a unique tag.`)
      return
    }

    const onSuccess = () => {
      toast.show(isEditing ? `Saved changes to ${form.tag}.` : `Added ${form.tag} to the inventory.`)
      onClose()
    }

    if (isEditing) {
      updateAsset.mutate({ id: asset.id, input: form }, { onSuccess })
    } else {
      createAsset.mutate(form, { onSuccess })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit asset' : 'Add asset'}
      description={isEditing ? `Update ${asset.tag}.` : 'Add a new item to the inventory.'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="asset-form" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save asset'}
          </Button>
        </>
      }
    >
      <form id="asset-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <FormField label="Asset tag" htmlFor="f-tag" hint="Must be unique across the inventory.">
          <Input
            id="f-tag"
            className={styles.mono}
            placeholder="e.g. LAP-1005"
            required
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
          />
        </FormField>

        <FormField label="Name" htmlFor="f-name">
          <Input
            id="f-name"
            placeholder="e.g. Dell Latitude 5440"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </FormField>

        <div className={styles.row}>
          <FormField label="Type" htmlFor="f-type">
            <Select
              id="f-type"
              required
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as AssetInput['type'] })}
            >
              {ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status" htmlFor="f-status">
            <Select
              id="f-status"
              required
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as AssetInput['status'] })}
            >
              {ASSET_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className={styles.row}>
          <FormField label="Purchase date" htmlFor="f-purchase-date">
            <Input
              id="f-purchase-date"
              type="date"
              required
              value={form.purchaseDate}
              onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
            />
          </FormField>
          <FormField label="Location" htmlFor="f-location">
            <Input
              id="f-location"
              placeholder="e.g. HQ – 2F – Rm 204"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </FormField>
        </div>
      </form>
    </Modal>
  )
}
