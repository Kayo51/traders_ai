import { redirect } from 'next/navigation'
import { getCurrentBusiness } from '@/lib/onboarding'
import { formatPhoneNumber } from '@/lib/onboarding'
import NumberAssignment from './number-assignment'
import StepProgress from '@/components/onboarding/step-progress'

export default async function NumberPage() {
  const business = await getCurrentBusiness()

  if (!business || !business.subscriptionPlan) {
    redirect('/onboarding/plan')
  }

  return (
    <div className="flex flex-col items-center px-6 py-12">
      <StepProgress current="number" />

      <div className="mt-12 mb-8 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Your AI Receptionist Number
        </h1>
        <p className="mt-3 text-zinc-400">
          We&apos;re assigning a dedicated UK phone number for your business.
        </p>
      </div>

      <NumberAssignment
        initialNumber={
          business.twilioPhoneNumber
            ? formatPhoneNumber(business.twilioPhoneNumber)
            : undefined
        }
      />
    </div>
  )
}
