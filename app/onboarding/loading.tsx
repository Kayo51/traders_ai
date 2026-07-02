export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-500" />
          <div className="absolute inset-1 rounded-full bg-blue-500/10" />
        </div>
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    </div>
  )
}
