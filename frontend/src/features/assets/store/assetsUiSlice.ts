import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import { FILTER_FIELDS, type AssetFilters, type AssetSort, type FilterCondition } from '../types'
import { loadPageSize } from './pageSizePreference'

export interface AssetsUiState {
  filters: AssetFilters
  sort: AssetSort
  page: number
  pageSize: number
}

const initialState: AssetsUiState = {
  filters: { search: '', conditions: [] },
  sort: { key: 'tag', direction: 'asc' },
  page: 1,
  // The viewer's last rows-per-page choice; saved by the table's selector.
  pageSize: loadPageSize(),
}

const assetsUiSlice = createSlice({
  name: 'assetsUi',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload
      state.page = 1
    },
    addFilter: {
      reducer(state, action: PayloadAction<{ id: string }>) {
        // Start on the first field not already in use, so repeated clicks
        // walk through type → status → location before doubling up.
        const used = new Set(state.filters.conditions.map((c) => c.field))
        const field = FILTER_FIELDS.find((f) => !used.has(f)) ?? FILTER_FIELDS[0]
        state.filters.conditions.push({ id: action.payload.id, field, operator: 'is', value: '' })
        // No page reset: an empty value filters nothing yet.
      },
      prepare() {
        return { payload: { id: nanoid() } }
      },
    },
    updateFilter(
      state,
      action: PayloadAction<{ id: string; changes: Partial<Omit<FilterCondition, 'id'>> }>,
    ) {
      const condition = state.filters.conditions.find((c) => c.id === action.payload.id)
      if (!condition) return
      const { changes } = action.payload
      // A value only makes sense for the field it was picked under.
      if (changes.field && changes.field !== condition.field) condition.value = ''
      Object.assign(condition, changes)
      state.page = 1
    },
    removeFilter(state, action: PayloadAction<string>) {
      state.filters.conditions = state.filters.conditions.filter((c) => c.id !== action.payload)
      state.page = 1
    },
    /** Drops every condition but keeps the search text. */
    clearConditions(state) {
      state.filters.conditions = []
      state.page = 1
    },
    /** Drops conditions and search alike. */
    clearFilters(state) {
      state.filters = initialState.filters
      state.page = 1
    },
    setSort(state, action: PayloadAction<AssetSort['key']>) {
      if (state.sort.key === action.payload) {
        state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc'
      } else {
        state.sort = { key: action.payload, direction: 'asc' }
      }
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload
      state.page = 1
    },
  },
})

export const {
  setSearch,
  addFilter,
  updateFilter,
  removeFilter,
  clearConditions,
  clearFilters,
  setSort,
  setPage,
  setPageSize,
} = assetsUiSlice.actions
export const assetsUiReducer = assetsUiSlice.reducer
