import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const SIDEBAR_STORAGE_KEY = 'asset-ledger:sidebar-collapsed'

function loadSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export interface UiState {
  sidebarCollapsed: boolean
}

const initialState: UiState = {
  sidebarCollapsed: loadSidebarCollapsed(),
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload
    },
  },
})

export const { toggleSidebar, setSidebarCollapsed } = uiSlice.actions
export const uiReducer = uiSlice.reducer
export { SIDEBAR_STORAGE_KEY }
