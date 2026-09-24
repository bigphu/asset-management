/**
 * One row of reference data. Type, status and location are stored as codes
 * (`LAPTOP`, `AVAILABLE`, `HQ`) — what the API accepts and filters on — each
 * with a display name. GET /api/reference-data lists the active ones.
 */
export interface ReferenceItem {
  code: string
  name: string
}

export interface ReferenceData {
  types: ReferenceItem[]
  statuses: ReferenceItem[]
  locations: ReferenceItem[]
}

/** Mirrors the fixed relational schema from ADR-0001 — every asset shares these columns. */
export interface Asset {
  id: string
  tag: string
  name: string
  /** Reference-data codes, each followed by its display name. */
  type: string
  typeName: string
  status: string
  statusName: string
  location: string
  locationName: string
  purchaseDate: string // ISO yyyy-mm-dd
  notes: string | null
}

/**
 * Create/update payload. PUT replaces the whole asset (ADR-0004), so an edit
 * sends `notes` back even though the form does not show it. `tag` cannot
 * change after creation.
 */
export interface AssetInput {
  tag: string
  name: string
  type: string
  status: string
  location: string
  purchaseDate: string
  notes: string | null
}

export type SortDirection = 'asc' | 'desc'

export interface AssetSort {
  key: keyof Pick<Asset, 'tag' | 'name' | 'type' | 'status' | 'location' | 'purchaseDate'>
  direction: SortDirection
}

export const FILTER_FIELDS = ['type', 'status', 'location'] as const
export type FilterField = (typeof FILTER_FIELDS)[number]

export type FilterOperator = 'is' | 'isNot'

/** One row of the Filters popover, e.g. "Status is In Use". */
export interface FilterCondition {
  id: string
  field: FilterField
  operator: FilterOperator
  /** '' while the user has not picked a value yet — such a row is ignored. */
  value: string
}

export interface AssetFilters {
  search: string
  conditions: FilterCondition[]
}
