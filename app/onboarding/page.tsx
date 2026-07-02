import { redirect } from 'next/navigation'
import { getCurrentBusiness } from '@/lib/onboarding'

export default async function OnboardingRoot() {
  const business = await getCurrentBusiness()

  if (!business) {
    redirect('/onboarding/plan')
  }

  if (business.onboardingCompleted) {
    redirect('/dashboard')
  }

  if (!business.twilioPhoneNumber) {
    redirect('/onboarding/number')
  }

  if (!business.receptionistName) {
    redirect('/onboarding/setup')
  }

  const hasActiveTrial = business.trialEndsAt && business.trialEndsAt > new Date()
  if (!business.stripeSubscriptionId && !hasActiveTrial) {
    redirect('/onboarding/payment')
  }

  redirect('/onboarding/complete')
}
