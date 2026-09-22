import { Button, PageHeader } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { useAppDispatch, useAppSelector } from '@/app/store'
import {
  useCreateProfileMutation,
  useDeleteProfileMutation,
  useProfilesQuery,
} from '../api/profiles.api'
import { closeProfileDrawer, openEditProfile, openNewProfile } from '../store/exportProfilesUiSlice'
import type { ExportProfile } from '../types'
import { ProfileFormDrawer } from '../components/ProfileFormDrawer'
import { ProfileList } from '../components/ProfileList'

export function ExportProfilesPage() {
  const dispatch = useAppDispatch()
  const editingProfileId = useAppSelector((state) => state.exportProfilesUi.editingProfileId)

  const { data: profiles = [], isLoading } = useProfilesQuery()
  const deleteProfile = useDeleteProfileMutation()
  const createProfile = useCreateProfileMutation()
  const toast = useToast()

  function handleDelete(profile: ExportProfile) {
    deleteProfile.mutate(profile.id, {
      onSuccess: () =>
        toast.show(`Deleted profile "${profile.name}".`, {
          undo: {
            onUndo: () =>
              createProfile.mutate({
                name: profile.name,
                dateFormat: profile.dateFormat,
                columns: profile.columns,
              }),
          },
        }),
    })
  }

  return (
    <>
      <PageHeader
        title="Export profiles"
        subtitle="Save a column layout, header labels and date format once, then reuse it every time you export."
        actions={
          <Button variant="primary" onClick={() => dispatch(openNewProfile())}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New profile
          </Button>
        }
      />

      <ProfileList
        profiles={profiles}
        isLoading={isLoading}
        onEdit={(profile) => dispatch(openEditProfile(profile.id))}
        onDelete={handleDelete}
      />

      <ProfileFormDrawer
        editingProfileId={editingProfileId}
        onClose={() => dispatch(closeProfileDrawer())}
      />
    </>
  )
}
