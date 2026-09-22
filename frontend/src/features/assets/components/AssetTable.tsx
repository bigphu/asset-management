import { Checkbox, EmptyState, Menu, Pagination, Table } from '@/components/ui'
import { formatDateDisplay } from '@/utils/formatDate'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { clearFilters, setPage, setSort } from '../store/assetsUiSlice'
import type { Asset, AssetSort } from '../types'
import { StatusBadge } from './StatusBadge'
import styles from './AssetTable.module.css'

const ASSET_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
  </svg>
)

const COLUMNS: { key: AssetSort['key']; label: string }[] = [
  { key: 'tag', label: 'Asset' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'location', label: 'Location' },
  { key: 'purchaseDate', label: 'Purchased' },
]

export interface AssetTableProps {
  pageItems: Asset[]
  total: number
  page: number
  pageSize: number
  pageCount: number
  isLoading: boolean
  isError: boolean
  onEdit: (asset: Asset) => void
  onDelete: (asset: Asset) => void
}

export function AssetTable({
  pageItems,
  total,
  page,
  pageSize,
  pageCount,
  isLoading,
  isError,
  onEdit,
  onDelete,
}: AssetTableProps) {
  const dispatch = useAppDispatch()
  const sort = useAppSelector((state) => state.assetsUi.sort)

  return (
    <>
      <Table.Container>
        <Table.Root>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell style={{ textAlign: 'right', width: 38 }}>
                <Checkbox aria-label="Select all assets" disabled={pageItems.length === 0} />
              </Table.HeaderCell>
              {COLUMNS.map((col) => (
                <Table.HeaderCell
                  key={col.key}
                  sortable
                  sortActive={sort.key === col.key}
                  sortDirection={sort.direction}
                  onClick={() => dispatch(setSort(col.key))}
                >
                  {col.label}
                </Table.HeaderCell>
              ))}
              <Table.HeaderCell aria-label="Actions" />
            </Table.Row>
          </Table.Head>
          <tbody>
            {isLoading ? (
              <Table.Row>
                <Table.Cell colSpan={7}>
                  <EmptyState title="Loading assets…" />
                </Table.Cell>
              </Table.Row>
            ) : isError ? (
              <Table.Row>
                <Table.Cell colSpan={7}>
                  <EmptyState
                    title="Couldn't load the inventory"
                    description="Something went wrong fetching assets. Try again shortly."
                  />
                </Table.Cell>
              </Table.Row>
            ) : total === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={7}>
                  <EmptyState
                    title="No assets match your filters"
                    description="Try widening the type, status or location filter, or clear the search."
                    action={
                      <button
                        type="button"
                        className={styles.clearFiltersBtn}
                        onClick={() => dispatch(clearFilters())}
                      >
                        Clear filters
                      </button>
                    }
                  />
                </Table.Cell>
              </Table.Row>
            ) : (
              pageItems.map((asset) => (
                <Table.Row key={asset.id}>
                  <Table.Cell style={{ textAlign: 'right', width: 38 }}>
                    <Checkbox aria-label={`Select ${asset.tag}`} />
                  </Table.Cell>
                  <Table.Cell>
                    <div className={styles.assetCell}>
                      <span className={styles.assetIcon}>{ASSET_ICON}</span>
                      <div>
                        <div className={styles.assetName}>{asset.name}</div>
                        <div className={styles.assetTag}>{asset.tag}</div>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className={styles.typeBadge}>{asset.type}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge status={asset.status} />
                  </Table.Cell>
                  <Table.Cell>{asset.location}</Table.Cell>
                  <Table.Cell className={styles.tabular}>
                    {formatDateDisplay(asset.purchaseDate)}
                  </Table.Cell>
                  <Table.Cell style={{ textAlign: 'right' }}>
                    <Menu
                      triggerLabel={`More actions for ${asset.tag}`}
                      trigger={
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="5" cy="12" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="19" cy="12" r="1.8" />
                        </svg>
                      }
                      items={[
                        { label: 'Edit', onSelect: () => onEdit(asset) },
                        { label: 'Delete', danger: true, onSelect: () => onDelete(asset) },
                      ]}
                    />
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </tbody>
        </Table.Root>
      </Table.Container>

      <div className={styles.footer}>
        <span className={styles.tabular}>
          {total === 0
            ? 'No assets found'
            : (() => {
                const start = (page - 1) * pageSize + 1
                const end = start + pageItems.length - 1
                return `Showing ${start}–${end} of ${total} asset${total === 1 ? '' : 's'}`
              })()}
        </span>
        <Pagination page={page} pageCount={pageCount} onPageChange={(p) => dispatch(setPage(p))} />
      </div>
    </>
  )
}
