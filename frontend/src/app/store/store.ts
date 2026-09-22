import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from './rootReducer'
import { SIDEBAR_STORAGE_KEY } from './uiSlice'

export const store = configureStore({
  reducer: rootReducer,
})

export type AppDispatch = typeof store.dispatch

// Persist the one piece of UI state that should survive a reload. This is a
// deliberately small, dependency-free stand-in for redux-persist — reach for
// that package instead if more slices need persisting later.
let lastSidebarCollapsed = store.getState().ui.sidebarCollapsed
store.subscribe(() => {
  const { sidebarCollapsed } = store.getState().ui
  if (sidebarCollapsed === lastSidebarCollapsed) return
  lastSidebarCollapsed = sidebarCollapsed
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed ? '1' : '0')
  } catch {
    // storage unavailable; collapse state just won't persist
  }
})
