import { redirect } from 'next/navigation'
import { getCurrentBusiness } from '@/lib/onboarding'
import { formatPhoneNumber } from '@/lib/onboarding'
import TestCallClient from './test-call-client'

export default async function TestPage() {
  const business = await getCurrentBusiness()

  if (!business) redirect('/onboarding/plan')
  if (!business.onboardingCompleted) redirect('/onboarding/complete')

  const phone = business.twilioPhoneNumber
    ? formatPhoneNumber(business.twilioPhoneNumber)
    : null

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Test Your Receptionist
          </h1>
          <p className="mt-3 text-zinc-400">
            Experience exactly what your customers will hear when they call.
          </p>
        </div>

        <TestCallClient phone={phone} receptionistName={business.receptionistName ?? 'Your Receptionist'} />
      </div>
    </div>
  )
}
