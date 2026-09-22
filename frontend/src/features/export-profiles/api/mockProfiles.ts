import type { ExportProfile } from '../types'

/** Stand-in for the real profiles endpoint — see the note in `features/assets/api/mockAssets.ts`. */
export const mockProfiles: ExportProfile[] = [
  {
    id: 'profile-1',
    name: 'Monthly IT report',
    dateFormat: 'DD/MM/YYYY',
    columns: [
      { key: 'tag', label: 'Asset Tag', included: true },
      { key: 'name', label: 'Description', included: true },
      { key: 'type', label: 'Category', included: true },
      { key: 'location', label: 'Location', included: true },
      { key: 'status', label: 'Status', included: false },
      { key: 'purchaseDate', label: 'Purchased On', included: true },
    ],
  },
  {
    id: 'profile-2',
    name: 'Finance handoff',
    dateFormat: 'YYYY-MM-DD',
    columns: [
      { key: 'tag', label: 'Tag', included: true },
      { key: 'purchaseDate', label: 'Acquisition Date', included: true },
      { key: 'name', label: 'Item', included: true },
      { key: 'type', label: 'Type', included: true },
      { key: 'status', label: 'Status', included: false },
      { key: 'location', label: 'Location', included: false },
    ],
  },
]
