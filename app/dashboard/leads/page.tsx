export const dynamic = 'force-dynamic'

import { getCurrentBusiness } from '@/lib/onboarding'
import db from '@/lib/db'
import { LeadsTable } from './_components/leads-table'
import { KPICards } from '@/components/dashboard/KPICards'
import { VALID_PERIODS, type Period } from '@/lib/dashboardStats'
import type { Prisma, LeadStatus } from '@prisma/client'

const VALID_SORT_FIELDS = ['urgency','callerName','description','postcode','callerPhone','status','createdAt'] as const
type SortField = typeof VALID_SORT_FIELDS[number]

function buildOrderBy(sort: string, dir: 'asc' | 'desc'): Prisma.LeadOrderByWithRelationInput[] {
  if (!VALID_SORT_FIELDS.includes(sort as SortField)) {
    return [{ urgency: 'desc' }, { createdAt: 'desc' }]
  }
  return [{ [sort]: dir }]
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
  const validStatuses: LeadStatus[] = ['NEW','CONTACTED','BOOKED','COMPLETED','LOST']
  const statusFilter = rawStatus && validStatuses.includes(rawStatus as LeadStatus) ? rawStatus as LeadStatus : undefined

  const sortField = params.sort ?? ''
  const sortDir: 'asc' | 'desc' = params.dir === 'asc' ? 'asc' : 'desc'
  const orderBy = sortField ? buildOrderBy(sortField, sortDir) : [{ urgency: 'desc' as const }, { createdAt: 'desc' as const }]

  const leads = business
    ? await db.lead.findMany({
        where: {
          businessId: business.id,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
        orderBy,
      })
    : []

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Leads</h1>
        <p className="mt-1 text-sm text-zinc-500">Customers collected by your AI receptionist.</p>
      </div>
      {business && <KPICards businessId={business.id} period={period} />}
      <LeadsTable
        leads={leads}
        currentSort={sortField}
        currentDir={sortDir}
        currentStatus={statusFilter ?? 'ALL'}
      />
    </div>
  )
}
