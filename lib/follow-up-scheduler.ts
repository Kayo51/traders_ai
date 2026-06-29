import type { Lead, BusinessSettings } from '@prisma/client'

export function getDelays(settings: BusinessSettings): number[] {
  try {
    const parsed = JSON.parse(settings.followUpDelays as string)
    if (Array.isArray(parsed)) return parsed.map(Number)
  } catch {}
  return [5, 24, 36, 48]
}

export function calcNextFollowUpAt(
  lead: Lead,
  settings: BusinessSettings
): Date | null {
  const delays = getDelays(settings)
  const maxMs = settings.followUpMaxDays * 24 * 60 * 60 * 1000
  const created = lead.createdAt.getTime()
  const now = Date.now()

  // Which fixed delay slot comes next?
  const nextFixedIndex = delays.findIndex(
    h => created + h * 3600000 > now
  )

  if (nextFixedIndex !== -1) {
    const next = new Date(created + delays[nextFixedIndex] * 3600000)
    if (next.getTime() - created > maxMs) return null
    return next
  }

  // All fixed delays done — every 24h from last follow-up
  const lastSent = lead.lastFollowUpAt?.getTime() ?? now
  const next = new Date(lastSent + 24 * 3600000)
  if (next.getTime() - created > maxMs) return null
  return next
}
