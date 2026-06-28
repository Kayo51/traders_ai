import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/test',
  '/api/debug',
  '/api/receptionist/(.*)',
  '/api/twilio/(.*)',
  '/api/webhooks/(.*)',
])

export const proxy = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const cookies = req.cookies.getAll().map(c => c.name).join(', ')
  console.log(`[proxy] ${req.nextUrl.pathname} | userId=${userId ?? 'null'} | cookies=${cookies || 'none'}`)
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
}
