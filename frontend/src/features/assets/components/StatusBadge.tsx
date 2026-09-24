import { Badge, type BadgeTone } from '@/components/ui'

/** Tone per status code (seeded in backend/db/init/002_seed.sql); unknown codes stay neutral. */
const TONE_BY_STATUS: Record<string, BadgeTone> = {
  AVAILABLE: 'good',
  ON_LOAN: 'warn',
  RETIRED: 'critical',
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return <Badge tone={TONE_BY_STATUS[status] ?? 'neutral'}>{label}</Badge>
}
