import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const business = await db.business.findUnique({
    where: { id },
    select: { greetingAudioMp3: true },
  })

  if (!business?.greetingAudioMp3) {
    return new NextResponse('Not found', { status: 404 })
  }

  return new NextResponse(business.greetingAudioMp3, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
