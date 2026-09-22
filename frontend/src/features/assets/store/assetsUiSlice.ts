import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AssetFilters, AssetSort } from '../types'

export interface AssetsUiState {
  filters: AssetFilters
  sort: AssetSort
  page: number
  pageSize: number
}

const initialState: AssetsUiState = {
  filters: { search: '', type: '', status: '', location: '' },
  sort: { key: 'tag', direction: 'asc' },
  page: 1,
  pageSize: 10,
}

const assetsUiSlice = createSlice({
  name: 'assetsUi',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload
      state.page = 1
    },
    setTypeFilter(state, action: PayloadAction<AssetFilters['type']>) {
      state.filters.type = action.payload
      state.page = 1
    },
    setStatusFilter(state, action: PayloadAction<AssetFilters['status']>) {
      state.filters.status = action.payload
      state.page = 1
    },
    setLocationFilter(state, action: PayloadAction<string>) {
      state.filters.location = action.payload
      state.page = 1
    },
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
  setTypeFilter,
  setStatusFilter,
  setLocationFilter,
  clearFilters,
  setSort,
  setPage,
  setPageSize,
} = assetsUiSlice.actions
export const assetsUiReducer = assetsUiSlice.reducer
