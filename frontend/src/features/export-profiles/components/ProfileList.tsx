import { EmptyState } from '@/components/ui'
import type { ExportProfile } from '../types'
import { ProfileCard } from './ProfileCard'
import styles from './ProfileList.module.css'

export interface ProfileListProps {
  profiles: ExportProfile[]
  isLoading: boolean
  onEdit: (profile: ExportProfile) => void
  onDelete: (profile: ExportProfile) => void
}

export function ProfileList({ profiles, isLoading, onEdit, onDelete }: ProfileListProps) {
  if (isLoading) {
    return <EmptyState title="Loading profiles…" />
  }

  if (profiles.length === 0) {
    return (
      <EmptyState
        title="No saved profiles yet"
        description="Save a column layout from the export drawer, or start a new one here."
      />
    )
  }

  return (
    <div className={styles.list}>
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          onEdit={() => onEdit(profile)}
          onDelete={() => onDelete(profile)}
        />
      ))}
    </div>
  )
}
