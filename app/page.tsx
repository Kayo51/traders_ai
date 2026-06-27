'use client'
import { SignInButton, SignUpButton, UserButton, Show } from '@clerk/nextjs'

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <header className="w-full border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
            TradeFlow AI
          </span>
          <div className="flex items-center gap-3">
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                  Sign up
                </button>
              </SignUpButton>
            </Show>
          </div>
        </div>
      </header>

      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Your AI receptionist for plumbers
        </h1>
        <p className="max-w-md text-lg text-zinc-500 dark:text-zinc-400">
          TradeFlow AI answers your calls, collects customer details, and sends
          you an SMS — so you never miss a lead.
        </p>
        <Show when="signed-out">
          <SignUpButton mode="modal">
            <button className="mt-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
              Get started free
            </button>
          </SignUpButton>
        </Show>
      </main>
    </div>
  )
}
