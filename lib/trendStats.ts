import db from '@/lib/db'

export type TrendPoint = { date: string; calls: number; leads: number }

export async function get30DayTrend(businessId: string): Promise<TrendPoint[]> {
  const now = new Date()
  const from = new Date(now)
  from.setDate(from.getDate() - 29)
  from.setHours(0, 0, 0, 0)

  const [calls, leads] = await Promise.all([
    db.call.findMany({
      where: { businessId, createdAt: { gte: from } },
      select: { createdAt: true },
    }),
    db.lead.findMany({
      where: { businessId, createdAt: { gte: from } },
      select: { createdAt: true },
    }),
  ])

  // Build a map of YYYY-MM-DD → counts
  const map: Record<string, { calls: number; leads: number }> = {}

  for (let i = 0; i < 30; i++) {
    const d = new Date(from)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    map[key] = { calls: 0, leads: 0 }
  }

  for (const c of calls) {
    const key = c.createdAt.toISOString().slice(0, 10)
    if (map[key]) map[key].calls++
  }
  for (const l of leads) {
    const key = l.createdAt.toISOString().slice(0, 10)
    if (map[key]) map[key].leads++
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({
      date,
      ...counts,
    }))
}
