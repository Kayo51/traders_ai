'use client'
import { motion } from 'framer-motion'

const STEPS = [
  { label: 'Choose Plan', key: 'plan' },
  { label: 'Your Number', key: 'number' },
  { label: 'Setup', key: 'setup' },
  { label: 'Complete', key: 'complete' },
]

type Props = { current: 'plan' | 'number' | 'setup' | 'complete' }

export default function StepProgress({ current }: Props) {
  const currentIndex = STEPS.findIndex(s => s.key === current)

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const done = i < currentIndex
          const active = i === currentIndex

          return (
            <div key={step.key} className="flex flex-1 items-center">
              {/* Circle */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  animate={{
                    backgroundColor: done
                      ? 'rgb(59,130,246)'
                      : active
                      ? 'rgb(99,102,241)'
                      : 'rgb(39,39,42)',
                    borderColor: done
                      ? 'rgb(59,130,246)'
                      : active
                      ? 'rgb(99,102,241)'
                      : 'rgb(63,63,70)',
                    scale: active ? 1.15 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2"
                >
                  {done ? (
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={`text-xs font-semibold ${active ? 'text-white' : 'text-zinc-500'}`}>
                      {i + 1}
                    </span>
                  )}
                </motion.div>
                <span className={`mt-1.5 hidden text-[10px] font-medium sm:block ${active ? 'text-white' : done ? 'text-blue-400' : 'text-zinc-600'}`}>
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-2 h-px bg-zinc-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                    animate={{ scaleX: done ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: 'left' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
