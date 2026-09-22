export type ExportDateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'

/** The asset fields a profile can include — matches ADR-0012's closed parameter set. */
export type ExportableField = 'tag' | 'name' | 'type' | 'status' | 'location' | 'purchaseDate'

export interface ExportColumn {
  key: ExportableField
  /** User-renamed header label for this column in the exported file. */
  label: string
  included: boolean
}

/** A saved, reusable export profile — see ADR-0013 (per-user database record). */
export interface ExportProfile {
  id: string
  name: string
  dateFormat: ExportDateFormat
  columns: ExportColumn[]
}

export type ExportProfileInput = Omit<ExportProfile, 'id'>

export const DEFAULT_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'tag', label: 'Tag', included: true },
  { key: 'name', label: 'Name', included: true },
  { key: 'type', label: 'Type', included: true },
  { key: 'status', label: 'Status', included: true },
  { key: 'location', label: 'Location', included: true },
  { key: 'purchaseDate', label: 'Purchase Date', included: true },
]
