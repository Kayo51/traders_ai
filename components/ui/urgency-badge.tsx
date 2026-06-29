import type { Urgency } from '@prisma/client'

const CONFIG: Record<Urgency, { label: string; dot: string; text: string; bg: string; ring: string }> = {
  LOW:         { label: 'Low',         dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  ring: 'ring-green-600/20' },
  MODERATE:    { label: 'Moderate',    dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', ring: 'ring-yellow-600/20' },
  HIGH:        { label: 'High',        dot: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', ring: 'ring-orange-600/20' },
  VERY_URGENT: { label: 'Very Urgent', dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',    ring: 'ring-red-600/20' },
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const c = CONFIG[urgency]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${c.bg} ${c.text} ${c.ring}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

export function urgencyLabel(urgency: Urgency): string {
  return CONFIG[urgency].label
}

// For SMS/email text representation
export const URGENCY_EMOJI: Record<Urgency, string> = {
  LOW:         '🟢 Low',
  MODERATE:    '🟡 Moderate',
  HIGH:        '🟠 High',
  VERY_URGENT: '🔴 Very Urgent',
}
