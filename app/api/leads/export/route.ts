import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import db from '@/lib/db'

function esc(v: string | null | undefined): string {
  if (v == null) return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { memberships: { where: { role: 'OWNER' }, include: { business: true }, take: 1 } },
  })
  const business = user?.memberships[0]?.business
  if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const leads = await db.lead.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: 'desc' },
  })

  const headers = [
    'Name', 'Phone', 'Postcode', 'Address', 'Job Type',
    'Description', 'Urgency', 'Status', 'Follow-ups Sent', 'Received',
  ]

  const rows = leads.map(l => [
    esc(l.callerName),
    esc(l.callerPhone),
    esc(l.postcode),
    esc(l.address),
    esc(l.jobType),
    esc(l.description),
    esc(l.urgency),
    esc(l.status),
    String(l.followUpCount),
    l.createdAt.toISOString(),
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  })
}
