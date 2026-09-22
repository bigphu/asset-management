import { Badge, type BadgeTone } from '@/components/ui'
import type { AssetStatus } from '../types'

const TONE_BY_STATUS: Record<AssetStatus, BadgeTone> = {
  'In Use': 'good',
  'In Storage': 'neutral',
  'Under Repair': 'warn',
  Retired: 'critical',
}

export function StatusBadge({ status }: { status: AssetStatus }) {
  return <Badge tone={TONE_BY_STATUS[status]}>{status}</Badge>
}
