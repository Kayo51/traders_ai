import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder')

export const PLAN_PRICES: Record<string, string | undefined> = {
  ESSENTIAL:    process.env.STRIPE_PRICE_ESSENTIAL,
  PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL,
}

export type PlanKey = 'ESSENTIAL' | 'PROFESSIONAL'

export const PLAN_DB: Record<PlanKey, { subscriptionPlan: 'ESSENTIAL' | 'PROFESSIONAL'; plan: 'PRO' | 'ENTERPRISE' }> = {
  ESSENTIAL:    { subscriptionPlan: 'ESSENTIAL',    plan: 'PRO' },
  PROFESSIONAL: { subscriptionPlan: 'PROFESSIONAL', plan: 'ENTERPRISE' },
}

export function priceIdToPlanKey(priceId: string): PlanKey | null {
  if (priceId === process.env.STRIPE_PRICE_ESSENTIAL)    return 'ESSENTIAL'
  if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL) return 'PROFESSIONAL'
  return null
}
