'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-black/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-white hover:text-zinc-300 transition-colors">
          TradeSpeak
        </Link>

        <div className="flex items-center gap-4">
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 px-4 py-1.5 text-sm font-medium text-zinc-300 hover:border-white/20 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors">
                Get started
              </button>
            </SignUpButton>
          </Show>
        </div>
      </div>
    </motion.nav>
  )
}
