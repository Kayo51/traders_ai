'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

const links = [
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/calls', label: 'Calls' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <>
      <nav className="flex flex-col gap-1 px-3">
        {links.map(({ href, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto flex items-center gap-3 border-t border-zinc-800 px-5 py-4">
        <UserButton />
        <span className="text-xs text-zinc-500">Account</span>
      </div>
    </>
  )
}
