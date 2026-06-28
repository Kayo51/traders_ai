import Nav from './_components/nav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-zinc-800 bg-zinc-900">
        <div className="flex h-14 items-center px-5 border-b border-zinc-800">
          <a href="/" className="text-sm font-semibold tracking-tight text-white hover:text-zinc-300 transition-colors">
            TradeFlow AI
          </a>
        </div>
        <div className="flex flex-1 flex-col py-4 overflow-y-auto">
          <Nav />
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
