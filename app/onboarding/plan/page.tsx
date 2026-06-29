import StepProgress from '@/components/onboarding/step-progress'
import PlanSelector from './plan-selector'

export default function PlanPage() {
  return (
    <div className="flex flex-col items-center px-6 py-12">
      <StepProgress current="plan" />

      <div className="mt-12 mb-8 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Choose your plan
        </h1>
        <p className="mt-3 text-zinc-400">
          Start capturing leads from day one. No contracts. Cancel anytime.
        </p>
      </div>

      <PlanSelector />
    </div>
  )
}
