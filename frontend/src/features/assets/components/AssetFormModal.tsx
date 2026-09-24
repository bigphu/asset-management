import { useEffect, useState, type FormEvent } from 'react'
import { Button, FormField, Modal, Input, Select } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { describeError } from '@/lib/apiClient'
import {
  useAssetsQuery,
  useCreateAssetMutation,
  useReferenceDataQuery,
  useUpdateAssetMutation,
} from '../api/assets.api'
import type { Asset, AssetInput, ReferenceItem } from '../types'
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
  type: '',
  status: '',
  location: '',
  purchaseDate: '',
  notes: null,
}

/** The editable fields of an asset — the API rejects unknown fields such as `id` or `typeName`. */
function toInput(asset: Asset): AssetInput {
  const { tag, name, type, status, location, purchaseDate, notes } = asset
  return { tag, name, type, status, location, purchaseDate, notes }
}

function ReferenceOptions({ items }: { items: ReferenceItem[] | undefined }) {
  return (
    <>
      <option value="" disabled>
        {items ? 'Select…' : 'Loading…'}
      </option>
      {items?.map((item) => (
        <option key={item.code} value={item.code}>
          {item.name}
        </option>
      ))}
    </>
  )
}

export function AssetFormModal({ open, asset, onClose }: AssetFormModalProps) {
  const [form, setForm] = useState<AssetInput>(EMPTY_FORM)
  const [error, setError] = useState('')

  const { data: assets = [] } = useAssetsQuery()
  const { data: referenceData } = useReferenceDataQuery()
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
    setForm(asset ? toInput(asset) : EMPTY_FORM)
  }, [open, asset])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    // Fast feedback from the loaded list; the server's unique constraint is
    // the real check (and also covers tags held by deleted assets).
    const duplicate = assets.some(
      (a) => a.tag.toLowerCase() === form.tag.trim().toLowerCase() && a.id !== asset?.id,
    )
    if (duplicate) {
      setError(`Asset tag "${form.tag}" is already in use. Choose a unique tag.`)
      return
    }

    setError('')
    const onSuccess = () => {
      toast.show(isEditing ? `Saved changes to ${form.tag}.` : `Added ${form.tag} to the inventory.`)
      onClose()
    }
    const onError = (err: Error) => setError(describeError(err))

    if (isEditing) {
      updateAsset.mutate({ id: asset.id, input: form }, { onSuccess, onError })
    } else {
      createAsset.mutate(form, { onSuccess, onError })
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
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <FormField
          label="Asset tag"
          htmlFor="f-tag"
          hint={
            isEditing
              ? "A tag can't be changed once the asset exists."
              : 'Must be unique across the inventory, and cannot be changed later.'
          }
        >
          <Input
            id="f-tag"
            className={styles.mono}
            placeholder="e.g. LAP-1005"
            required
            readOnly={isEditing}
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
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <ReferenceOptions items={referenceData?.types} />
            </Select>
          </FormField>
          <FormField label="Status" htmlFor="f-status">
            <Select
              id="f-status"
              required
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <ReferenceOptions items={referenceData?.statuses} />
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
            <Select
              id="f-location"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            >
              <ReferenceOptions items={referenceData?.locations} />
            </Select>
          </FormField>
        </div>
      </form>
    </Modal>
  )
}
