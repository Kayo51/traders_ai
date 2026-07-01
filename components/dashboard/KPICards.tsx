import { Suspense } from 'react'
import { getDashboardStats, TREND_LABEL, CARD_TITLE, type Period } from '@/lib/dashboardStats'
import { KPICard } from './KPICard'
import { KPIPeriodFilter } from './KPIPeriodFilter'

export async function KPICards({ businessId, period }: { businessId: string; period: Period }) {
  const s = await getDashboardStats(businessId, period)

  const callTrend = s.prevCalls > 0
    ? {
        pct: Math.abs(Math.round(((s.calls - s.prevCalls) / s.prevCalls) * 100)),
        up: s.calls >= s.prevCalls,
        label: TREND_LABEL[period],
      }
    : undefined

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Overview</span>
        <Suspense>
          <KPIPeriodFilter current={period} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          index={0}
          title={CARD_TITLE[period]}
          value={s.calls}
          icon="phone"
          accent="blue"
          trend={callTrend}
        />
        <KPICard
          index={1}
          title="New Leads"
          value={s.leads}
          icon="sparkles"
          accent={s.leads >= 10 ? 'amber' : 'blue'}
          badge={s.leads >= 5 ? 'High Activity' : undefined}
        />
        <KPICard
          index={2}
          title="Contacted"
          value={s.contacted}
          icon="message-circle"
          accent={s.contacted > 0 && s.leads > 0 && s.contacted >= s.leads ? 'green' : 'blue'}
          progress={s.leads > 0 ? { done: s.contacted, total: s.leads } : undefined}
        />
        <KPICard
          index={3}
          title="Bookings"
          value={s.bookings}
          icon="calendar"
          accent={s.bookings > 0 ? 'green' : 'blue'}
          revenue={s.bookings > 0 ? `£${(s.bookings * 400).toLocaleString('en-GB')}` : undefined}
        />
      </div>
    </div>
  )
}
