import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getCurrentBusiness } from '@/lib/onboarding'
import db from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const business = await getCurrentBusiness()
    if (!business) {
      return NextResponse.redirect(new URL('/sign-in', req.url), 303)
    }

    const biz = await db.business.findUnique({ where: { id: business.id } })
    if (!biz?.stripeCustomerId) {
      return NextResponse.redirect(new URL('/dashboard/account', req.url), 303)
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: biz.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/account`,
    })

    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    console.error('[stripe/portal]', err)
    return NextResponse.redirect(new URL('/dashboard/account?error=portal_failed', req.url), 303)
  }
}
