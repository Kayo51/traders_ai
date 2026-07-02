export default function DashboardLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-zinc-400" />
      </div>
    </div>
  )
}
