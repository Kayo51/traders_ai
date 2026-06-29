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
    if (!business.subscriptionPlan) {
      redirect('/onboarding/plan')
    }
    redirect('/onboarding/number')
  }

  if (!business.receptionistName) {
    redirect('/onboarding/setup')
  }

  redirect('/onboarding/complete')
}
