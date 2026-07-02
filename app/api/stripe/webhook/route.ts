import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe, priceIdToPlanKey, PLAN_DB } from '@/lib/stripe'
import db from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[stripe/webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const businessId = session.client_reference_id ?? (session.metadata?.businessId as string | undefined)
        if (!businessId || !session.subscription || !session.customer) break

        const planKey = session.metadata?.planKey as 'ESSENTIAL' | 'PROFESSIONAL' | undefined
        const planData = planKey ? PLAN_DB[planKey] : null

        await db.business.update({
          where: { id: businessId },
          data: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            ...(planData
              ? { subscriptionPlan: planData.subscriptionPlan, plan: planData.plan }
              : {}),
          },
        })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const businessId = sub.metadata?.businessId as string | undefined
        if (!businessId) break

        const priceId = sub.items.data[0]?.price.id
        const planKey = priceId ? priceIdToPlanKey(priceId) : null
        const planData = planKey ? PLAN_DB[planKey] : null

        if (sub.status !== 'active' && sub.status !== 'trialing') {
          await db.business.update({
            where: { id: businessId },
            data: { subscriptionPlan: 'STARTER', plan: 'FREE' },
          })
        } else if (planData) {
          await db.business.update({
            where: { id: businessId },
            data: {
              stripeSubscriptionId: sub.id,
              subscriptionPlan: planData.subscriptionPlan,
              plan: planData.plan,
            },
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const businessId = sub.metadata?.businessId as string | undefined
        if (!businessId) break

        await db.business.update({
          where: { id: businessId },
          data: {
            subscriptionPlan: 'STARTER',
            plan: 'FREE',
            stripeSubscriptionId: null,
          },
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        if (!customerId) break

        const biz = await db.business.findFirst({ where: { stripeCustomerId: customerId } })
        if (biz) {
          console.warn(`[stripe/webhook] payment failed for business ${biz.id}`)
        }
        break
      }
    }
  } catch (err) {
    console.error('[stripe/webhook] handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
