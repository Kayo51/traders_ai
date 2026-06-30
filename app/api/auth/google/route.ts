import { NextRequest, NextResponse } from 'next/server'
import { getCurrentBusiness } from '@/lib/onboarding'
import { getAuthUrl } from '@/lib/calendar'

export async function GET(_req: NextRequest) {
  const business = await getCurrentBusiness()
  if (!business) return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL!))
  return NextResponse.redirect(getAuthUrl(business.id))
}
