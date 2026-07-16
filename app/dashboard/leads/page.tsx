export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getCurrentBusiness } from '@/lib/onboarding'
import db from '@/lib/db'
import { LeadsTable } from './_components/leads-table'
import { KPICards } from '@/components/dashboard/KPICards'
import { TrendChartAsync } from '@/components/dashboard/TrendChartAsync'
import { MarkLeadsViewed } from './_components/MarkLeadsViewed'
import { VALID_PERIODS, type Period } from '@/lib/dashboardStats'
import type { Prisma, LeadStatus } from '@prisma/client'

const VALID_SORT_FIELDS = ['urgency','callerName','description','postcode','callerPhone','status','createdAt'] as const
type SortField = typeof VALID_SORT_FIELDS[number]

const LEADS_PAGE_SIZE = 100

function buildOrderBy(sort: string, dir: 'asc' | 'desc'): Prisma.LeadOrderByWithRelationInput[] {
  if (!VALID_SORT_FIELDS.includes(sort as SortField)) {
    return [{ urgency: 'desc' }, { createdAt: 'desc' }]
  }
  return [{ [sort]: dir }]
}

function KPICardsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="h-3 w-20 rounded bg-zinc-100 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-zinc-200 bg-white animate-pulse" />
        ))}
      </div>
    </div>
  )
}

function TrendSkeleton() {
  return <div className="h-48 rounded-xl border border-zinc-200 bg-white animate-pulse" />
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const business = await getCurrentBusiness()

  const rawPeriod = params.kpi_period
  const period: Period = VALID_PERIODS.has(rawPeriod as Period) ? (rawPeriod as Period) : 'day'

  const rawStatus = params.status?.toUpperCase()
  const validStatuses: LeadStatus[] = ['NEW', 'CONTACTED', 'QUOTED', 'BOOKED', 'COMPLETED', 'LOST']
  const statusFilter = rawStatus && validStatuses.includes(rawStatus as LeadStatus) ? rawStatus as LeadStatus : undefined

  const sortField = params.sort ?? ''
  const sortDir: 'asc' | 'desc' = params.dir === 'asc' ? 'asc' : 'desc'
  const orderBy = sortField ? buildOrderBy(sortField, sortDir) : [{ urgency: 'desc' as const }, { createdAt: 'desc' as const }]

  const leads = business
    ? await db.lead.findMany({
        where: { businessId: business.id, ...(statusFilter ? { status: statusFilter } : {}) },
        orderBy,
        take: LEADS_PAGE_SIZE,
      })
    : []

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <MarkLeadsViewed />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Leads</h1>
          <p className="mt-1 text-sm text-zinc-500">Customers collected by your AI receptionist.</p>
        </div>
        <a
          href="/api/leads/export"
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </a>
      </div>

      {business && (
        <Suspense fallback={<KPICardsSkeleton />}>
          <KPICards businessId={business.id} period={period} />
        </Suspense>
      )}

      {business && (
        <Suspense fallback={<TrendSkeleton />}>
          <TrendChartAsync businessId={business.id} />
        </Suspense>
      )}

      <LeadsTable
        leads={leads}
        currentSort={sortField}
        currentDir={sortDir}
        currentStatus={statusFilter ?? 'ALL'}
      />
    </div>
  )
}
