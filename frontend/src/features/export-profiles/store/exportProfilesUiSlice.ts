import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface ExportProfilesUiState {
  /** null = drawer closed, 'new' = creating, an id = editing that profile. */
  editingProfileId: string | 'new' | null
}

const initialState: ExportProfilesUiState = {
  editingProfileId: null,
}

const exportProfilesUiSlice = createSlice({
  name: 'exportProfilesUi',
  initialState,
  reducers: {
    openNewProfile(state) {
      state.editingProfileId = 'new'
    },
    openEditProfile(state, action: PayloadAction<string>) {
      state.editingProfileId = action.payload
    },
    closeProfileDrawer(state) {
      state.editingProfileId = null
    },
  },
})

export const { openNewProfile, openEditProfile, closeProfileDrawer } =
  exportProfilesUiSlice.actions
export const exportProfilesUiReducer = exportProfilesUiSlice.reducer
