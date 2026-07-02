import { NextRequest } from 'next/server'
import db from '@/lib/db'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const secret = bearer ?? req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const businesses = await db.businessSettings.findMany({
    where: { dataRetentionDays: { not: null } },
    select: { businessId: true, dataRetentionDays: true },
  })

  let totalLeads = 0
  let totalCalls = 0
  let totalConversations = 0

  for (const { businessId, dataRetentionDays } of businesses) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - dataRetentionDays!)

    // Conversations contain caller transcripts — delete first (foreign key safe via cascade from Call)
    const convResult = await db.conversation.deleteMany({
      where: { businessId, createdAt: { lt: cutoff } },
    })

    // Leads hold the most sensitive personal data: name, phone, postcode, description
    const leadResult = await db.lead.deleteMany({
      where: { businessId, createdAt: { lt: cutoff } },
    })

    // Calls hold the caller phone number and Twilio SID
    const callResult = await db.call.deleteMany({
      where: { businessId, createdAt: { lt: cutoff } },
    })

    totalConversations += convResult.count
    totalLeads += leadResult.count
    totalCalls += callResult.count
  }

  console.log(`[purge-data] leads=${totalLeads} calls=${totalCalls} conversations=${totalConversations}`)

  return Response.json({
    purged: { leads: totalLeads, calls: totalCalls, conversations: totalConversations },
    businessesChecked: businesses.length,
    at: new Date().toISOString(),
  })
}
