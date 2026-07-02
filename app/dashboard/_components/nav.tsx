'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerk, useUser } from '@clerk/nextjs'

const MAIN_LINKS = [
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/calls', label: 'Calls' },
]

function GearIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
}

export default function Nav({ newLeadCount = 0 }: { newLeadCount?: number }) {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { user } = useUser()

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Account'
  const email = user?.primaryEmailAddress?.emailAddress ?? ''
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  function handleSignOut() {
    signOut({ redirectUrl: '/' })
  }

  const settingsActive = pathname.startsWith('/dashboard/settings')
  const accountActive  = pathname.startsWith('/dashboard/account')

  return (
    <div className="flex flex-1 flex-col">
      {/* Main nav */}
      <nav className="flex flex-col gap-1 px-3">
        {MAIN_LINKS.map(({ href, label }) => {
          const active = pathname.startsWith(href)
          const isLeads = href === '/dashboard/leads'
          const showBadge = isLeads && newLeadCount > 0 && !active
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              {label}
              {showBadge && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white leading-none">
                  {newLeadCount > 99 ? '99+' : newLeadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom area */}
      <div className="mt-auto">
        {/* Settings icon */}
        <div className="border-t border-zinc-800 px-3 py-3">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              settingsActive
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <GearIcon />
            Settings
          </Link>
        </div>

        {/* Actions */}
        <div className="border-t border-zinc-800 px-3 py-2 flex flex-col gap-1">
          <Link
            href="/dashboard/account"
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              accountActive
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            Manage account
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400 text-left"
          >
            <SignOutIcon />
            Sign out
          </button>
        </div>

        {/* Account button */}
        <div className="border-t border-zinc-800 px-4 py-3 flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white leading-tight">{name}</p>
            <p className="truncate text-[11px] text-zinc-500 leading-tight mt-0.5">{email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
