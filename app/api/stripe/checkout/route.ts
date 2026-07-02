import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLAN_PRICES } from '@/lib/stripe'
import { getCurrentBusiness } from '@/lib/onboarding'

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData()
    const planKey = data.get('planKey') as string

    const priceId = PLAN_PRICES[planKey]
    if (!priceId) {
      return NextResponse.redirect(new URL('/dashboard/account?error=invalid_plan', req.url), 303)
    }

    const business = await getCurrentBusiness()
    if (!business) {
      return NextResponse.redirect(new URL('/sign-in', req.url), 303)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: business.id,
      customer_email: business.ownerEmail,
      ...(business.stripeCustomerId ? { customer: business.stripeCustomerId } : {}),
      metadata: { businessId: business.id, planKey },
      subscription_data: {
        metadata: { businessId: business.id, planKey },
      },
      success_url: `${appUrl}/dashboard/account?success=true`,
      cancel_url: `${appUrl}/dashboard/account`,
    })

    return NextResponse.redirect(session.url!, 303)
  } catch (err) {
    console.error('[stripe/checkout]', err)
    return NextResponse.redirect(new URL('/dashboard/account?error=checkout_failed', req.url), 303)
  }
}
