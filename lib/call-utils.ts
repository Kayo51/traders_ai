import db from '@/lib/db'

export async function markCallCompleted(twilioCallSid: string): Promise<void> {
  await db.call.updateMany({
    where: { twilioCallSid },
    data: { status: 'COMPLETED' },
  }).catch(err => console.error('[call] status update failed:', err))
}
