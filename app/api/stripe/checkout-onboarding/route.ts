import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLAN_PRICES } from '@/lib/stripe'
import { getCurrentBusiness } from '@/lib/onboarding'

export async function POST(req: NextRequest) {
  try {
    const business = await getCurrentBusiness()
    if (!business) {
      return NextResponse.redirect(new URL('/sign-in', req.url), 303)
    }

    const planKey = business.subscriptionPlan as string
    const priceId = PLAN_PRICES[planKey]
    if (!priceId) {
      return NextResponse.redirect(new URL('/onboarding/plan', req.url), 303)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: business.id,
      // Stripe rejects both customer + customer_email together
      ...(business.stripeCustomerId
        ? { customer: business.stripeCustomerId }
        : { customer_email: business.ownerEmail }),
      metadata: { businessId: business.id, planKey },
      subscription_data: {
        metadata: { businessId: business.id, planKey },
      },
      success_url: `${appUrl}/onboarding/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/onboarding/payment`,
    })

    return NextResponse.redirect(session.url!, 303)
  } catch (err) {
    console.error('[checkout-onboarding]', err)
    return NextResponse.redirect(new URL('/onboarding/payment?error=1', req.url), 303)
  }
}
