import db from '@/lib/db'

export type Period = 'day' | 'week' | 'month' | 'year'

export const VALID_PERIODS = new Set<Period>(['day', 'week', 'month', 'year'])

export const TREND_LABEL: Record<Period, string> = {
  day:   'yesterday',
  week:  'last week',
  month: 'last month',
  year:  'last year',
}

export const CARD_TITLE: Record<Period, string> = {
  day:   "Today's Calls",
  week:  'Calls This Week',
  month: 'Calls This Month',
  year:  'Calls This Year',
}

function periodStart(period: Period): Date {
  const now = new Date()
  if (period === 'day') {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (period === 'week') {
    const d = new Date(now)
    const day = d.getDay()
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (period === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }
  return new Date(now.getFullYear(), 0, 1)
}

function prevPeriodBounds(period: Period, currentStart: Date): { from: Date; to: Date } {
  const to = currentStart
  const from = new Date(to)
  if (period === 'day')        from.setDate(from.getDate() - 1)
  else if (period === 'week')  from.setDate(from.getDate() - 7)
  else if (period === 'month') from.setMonth(from.getMonth() - 1)
  else                         from.setFullYear(from.getFullYear() - 1)
  return { from, to }
}

export type DashboardStats = {
  calls: number
  prevCalls: number
  leads: number
  contacted: number
  bookings: number
}

export async function getDashboardStats(businessId: string, period: Period): Promise<DashboardStats> {
  const from = periodStart(period)
  const { from: prevFrom, to: prevTo } = prevPeriodBounds(period, from)

  const [calls, prevCalls, leads, contacted, bookings] = await Promise.all([
    db.call.count({ where: { businessId, createdAt: { gte: from } } }),
    db.call.count({ where: { businessId, createdAt: { gte: prevFrom, lt: prevTo } } }),
    db.lead.count({ where: { businessId, createdAt: { gte: from } } }),
    db.lead.count({ where: { businessId, contacted: true, contactedAt: { gte: from } } }),
    db.lead.count({ where: { businessId, status: 'BOOKED', createdAt: { gte: from } } }),
  ])

  return { calls, prevCalls, leads, contacted, bookings }
}
