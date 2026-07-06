import Link from 'next/link'
import type { ReactNode } from 'react'

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[700px] w-[700px] rounded-full bg-blue-600/6 blur-[150px]" />
        <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/6 blur-[130px]" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 border-b border-white/[0.05] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-white hover:text-zinc-300 transition-colors">
            JobBell
          </Link>
          <span className="text-xs text-zinc-600">Setup your account</span>
        </div>
      </header>

      {/* Page */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  )
}
