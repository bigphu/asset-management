import { combineReducers } from '@reduxjs/toolkit'
import { assetsUiReducer } from '@/features/assets/store'
import { exportProfilesUiReducer } from '@/features/export-profiles/store'
import { uiReducer } from './uiSlice'

/**
 * Every slice here is client/UI state only (filters, sort, open drawers,
 * row selection). Server data (the assets themselves, saved profiles) is
 * owned by TanStack Query — see each feature's `api/` module — and must
 * never be duplicated into Redux.
 */
export const rootReducer = combineReducers({
  ui: uiReducer,
  assetsUi: assetsUiReducer,
  exportProfilesUi: exportProfilesUiReducer,
})

export type RootState = ReturnType<typeof rootReducer>
