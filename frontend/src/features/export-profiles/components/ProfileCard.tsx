import { Card, IconButton, Button } from '@/components/ui'
import type { ExportProfile } from '../types'
import styles from './ProfileCard.module.css'

export interface ProfileCardProps {
  profile: ExportProfile
  onEdit: () => void
  onDelete: () => void
}

export function ProfileCard({ profile, onEdit, onDelete }: ProfileCardProps) {
  const includedCount = profile.columns.filter((c) => c.included).length

  return (
    <Card className={styles.card}>
      <div className={styles.icon} aria-hidden="true">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div className={styles.main}>
        <div className={styles.name}>{profile.name}</div>
        <div className={styles.meta}>
          {includedCount} column{includedCount === 1 ? '' : 's'} &middot; dates as{' '}
          {profile.dateFormat}
        </div>
      </div>
      <div className={styles.actions}>
        <Button size="sm" variant="outline" onClick={onEdit}>
          Edit
        </Button>
        <IconButton danger aria-label={`Delete ${profile.name}`} onClick={onDelete}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>
        </IconButton>
      </div>
    </Card>
  )
}
