import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder')

export const PLAN_PRICES: Record<string, string | undefined> = {
  ESSENTIAL:           process.env.STRIPE_PRICE_ESSENTIAL,
  ESSENTIAL_ANNUAL:    process.env.STRIPE_PRICE_ESSENTIAL_ANNUAL,
  PROFESSIONAL:        process.env.STRIPE_PRICE_PROFESSIONAL,
  PROFESSIONAL_ANNUAL: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL,
  ENTERPRISE:          process.env.STRIPE_PRICE_ENTERPRISE,
  ENTERPRISE_ANNUAL:   process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL,
}

export type PlanKey = 'ESSENTIAL' | 'PROFESSIONAL' | 'ENTERPRISE'

export const PLAN_DB: Record<PlanKey, { subscriptionPlan: 'ESSENTIAL' | 'PROFESSIONAL' | 'ENTERPRISE'; plan: 'PRO' | 'ENTERPRISE' }> = {
  ESSENTIAL:    { subscriptionPlan: 'ESSENTIAL',    plan: 'PRO' },
  PROFESSIONAL: { subscriptionPlan: 'PROFESSIONAL', plan: 'ENTERPRISE' },
  ENTERPRISE:   { subscriptionPlan: 'ENTERPRISE',   plan: 'ENTERPRISE' },
}

export function priceIdToPlanKey(priceId: string): PlanKey | null {
  if (priceId === process.env.STRIPE_PRICE_ESSENTIAL    || priceId === process.env.STRIPE_PRICE_ESSENTIAL_ANNUAL)    return 'ESSENTIAL'
  if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL || priceId === process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL) return 'PROFESSIONAL'
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE   || priceId === process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL)   return 'ENTERPRISE'
  return null
}
