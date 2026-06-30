import { getCurrentBusiness } from '@/lib/onboarding'
import db from '@/lib/db'
import { CallsTable } from './_components/calls-table'
import type { Prisma, CallStatus } from '@prisma/client'

const VALID_SORT_FIELDS = ['callerPhone','leadName','urgency','durationSeconds','status','createdAt'] as const
type SortField = typeof VALID_SORT_FIELDS[number]

function buildOrderBy(sort: string, dir: 'asc' | 'desc'): Prisma.CallOrderByWithRelationInput[] {
  if (sort === 'leadName') return [{ lead: { callerName: dir } }]
  if (sort === 'urgency')  return [{ lead: { urgency: dir } }]
  const directFields = ['callerPhone','durationSeconds','status','createdAt']
  if (directFields.includes(sort)) return [{ [sort]: dir }]
  return [{ createdAt: 'desc' }]
}

export default async function CallsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const business = await getCurrentBusiness()

  const rawStatus = params.status?.toUpperCase()
  const validStatuses: CallStatus[] = ['IN_PROGRESS','COMPLETED','FAILED','NO_ANSWER','VOICEMAIL']
  const statusFilter = rawStatus && validStatuses.includes(rawStatus as CallStatus) ? rawStatus as CallStatus : undefined

  const sortField = params.sort ?? ''
  const sortDir: 'asc' | 'desc' = params.dir === 'asc' ? 'asc' : 'desc'
  const orderBy = sortField ? buildOrderBy(sortField, sortDir) : [{ createdAt: 'desc' as const }]

  const calls = business
    ? await db.call.findMany({
        where: {
          businessId: business.id,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
        orderBy,
        include: { lead: true },
      })
    : []

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Calls</h1>
        <p className="mt-1 text-sm text-zinc-500">All inbound calls handled by your AI receptionist.</p>
      </div>
      <CallsTable
        calls={calls}
        currentSort={sortField}
        currentDir={sortDir}
        currentStatus={statusFilter ?? 'ALL'}
      />
    </div>
  )
}
