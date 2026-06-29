import { getCurrentBusiness } from '@/lib/onboarding'
import db from '@/lib/db'
import type { Lead } from '@prisma/client'
import { LeadRow } from './_components/lead-row'

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function subDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - n)
  return d
}

function groupLeads(leads: Lead[]): { label: string; leads: Lead[] }[] {
  const now = new Date()
  const todayStart = startOfDay(now)
  const yesterdayStart = subDays(todayStart, 1)
  const twoDaysAgoStart = subDays(todayStart, 2)
  const sevenDaysAgoStart = subDays(todayStart, 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const groups: { label: string; leads: Lead[] }[] = [
    { label: 'Today', leads: [] },
    { label: 'Yesterday', leads: [] },
    { label: 'Last 48 Hours', leads: [] },
    { label: 'Last 7 Days', leads: [] },
    { label: 'This Month', leads: [] },
    { label: 'Older Leads', leads: [] },
  ]

  for (const lead of leads) {
    const t = lead.createdAt.getTime()
    if (t >= todayStart.getTime()) groups[0].leads.push(lead)
    else if (t >= yesterdayStart.getTime()) groups[1].leads.push(lead)
    else if (t >= twoDaysAgoStart.getTime()) groups[2].leads.push(lead)
    else if (t >= sevenDaysAgoStart.getTime()) groups[3].leads.push(lead)
    else if (t >= monthStart.getTime()) groups[4].leads.push(lead)
    else groups[5].leads.push(lead)
  }

  return groups.filter(g => g.leads.length > 0)
}

export default async function LeadsPage() {
  const business = await getCurrentBusiness()
  const leads = business
    ? await db.lead.findMany({
        where: { businessId: business.id },
        orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
      })
    : []

  const grouped = groupLeads(leads)

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Leads</h1>
        <p className="mt-1 text-sm text-zinc-500">Customers collected by your AI receptionist.</p>
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <p className="text-sm font-medium text-zinc-900">No leads yet</p>
          <p className="mt-1 text-sm text-zinc-500">Leads will appear here once your AI answers a call.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map(group => (
            <div key={group.label}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">{group.label}</h2>
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50">
                      <th className="px-4 py-3 text-left font-medium text-zinc-500">Urgency</th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-500">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-500">Issue</th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-500">Postcode</th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-500">Phone</th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-500">Action</th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-500">Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {group.leads.map(lead => (
                      <LeadRow
                        key={lead.id}
                        id={lead.id}
                        callerName={lead.callerName}
                        callerPhone={lead.callerPhone}
                        description={lead.description}
                        jobType={lead.jobType}
                        postcode={lead.postcode}
                        urgency={lead.urgency}
                        status={lead.status}
                        contacted={lead.contacted}
                        contactedAt={lead.contactedAt}
                        followUpCount={lead.followUpCount}
                        followUpStopped={lead.followUpStopped}
                        nextFollowUpAt={lead.nextFollowUpAt}
                        createdAt={lead.createdAt}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
