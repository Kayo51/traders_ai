import { redirect } from 'next/navigation'
import { getCurrentBusiness } from '@/lib/onboarding'
import { formatPhoneNumber } from '@/lib/onboarding'
import StepProgress from '@/components/onboarding/step-progress'
import SetupForm from './setup-form'

export default async function SetupPage() {
  const business = await getCurrentBusiness()

  if (!business) redirect('/onboarding/plan')
  if (!business.twilioPhoneNumber) redirect('/onboarding/number')

  return (
    <div className="flex flex-col items-center px-6 py-12">
      <StepProgress current="setup" />

      <div className="mt-12 mb-8 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Configure your receptionist
        </h1>
        <p className="mt-3 text-zinc-400">
          Customise how your AI answers calls and represents your business.
        </p>
      </div>

      <SetupForm
        plan={business.subscriptionPlan ?? 'ESSENTIAL'}
        defaults={{
          businessName: business.name === 'My Business' ? '' : business.name,
          businessType: business.businessType ?? '',
          businessPhone: business.businessPhone ?? '',
          openingHoursText: business.openingHoursText ?? '',
          emergencyService: business.emergencyService,
          receptionistName: business.receptionistName ?? '',
          receptionistVoice: business.receptionistVoice ?? 'EMMA',
          receptionistGender: business.receptionistGender ?? 'FEMALE',
          receptionistAccent: business.receptionistAccent ?? 'BRITISH',
          receptionistTone: business.receptionistTone ?? 'FRIENDLY',
          greetingMessage: business.settings?.greetingMessage ?? '',
        }}
      />
    </div>
  )
}
