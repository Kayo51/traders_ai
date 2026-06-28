import db from '@/lib/db'
import { LeadStatus } from '@prisma/client'

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  CONTACTED: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  BOOKED: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  COMPLETED: 'bg-green-50 text-green-700 ring-green-600/20',
  LOST: 'bg-zinc-100 text-zinc-500 ring-zinc-500/20',
}

function formatDate(date: Date) {
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function LeadsPage() {
  const businessId = process.env.DEV_BUSINESS_ID
  const leads = businessId
    ? await db.lead.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
      })
    : []

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
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Issue</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Postcode</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {lead.callerName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 max-w-xs truncate">
                    {lead.description ?? lead.jobType ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-600">
                    {lead.postcode ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {lead.callerPhone}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
