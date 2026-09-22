export const ASSET_TYPES = [
  'Laptop',
  'Desktop',
  'Monitor',
  'Tablet',
  'Phone',
  'Printer',
  'Server',
  'Router',
  'Projector',
  'Desk',
  'Chair',
  'Vehicle',
] as const
export type AssetType = (typeof ASSET_TYPES)[number]

export const ASSET_STATUSES = ['In Use', 'In Storage', 'Under Repair', 'Retired'] as const
export type AssetStatus = (typeof ASSET_STATUSES)[number]

/** Mirrors the fixed relational schema from ADR-0001 — every asset shares these columns. */
export interface Asset {
  id: string
  tag: string
  name: string
  type: AssetType
  status: AssetStatus
  location: string
  purchaseDate: string // ISO yyyy-mm-dd
}

/** Payload for create/update — `id` is assigned server-side, `tag` doubles as the id today. */
export type AssetInput = Omit<Asset, 'id'>

export type SortDirection = 'asc' | 'desc'

export interface AssetSort {
  key: keyof Pick<Asset, 'tag' | 'name' | 'type' | 'status' | 'location' | 'purchaseDate'>
  direction: SortDirection
}

export interface AssetFilters {
  search: string
  type: AssetType | ''
  status: AssetStatus | ''
  location: string
}
