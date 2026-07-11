import { type NextRequest, NextResponse } from 'next/server'

const publicPaths = ['/', '/psicologos', '/psicologo/', '/login', '/registro-psicologo', '/como-funciona', '/auth/callback']

interface CspDirective {
  directive: string
  sources: string[]
}

const cspDirectives: CspDirective[] = [
  { directive: 'default-src', sources: ["'self'"] },
  { directive: 'script-src', sources: ["'self'", '${nonce}', 'https://js.sentry-cdn.com'] },
  { directive: 'style-src', sources: ["'self'", "'unsafe-inline'"] },
  { directive: 'img-src', sources: ["'self'", 'data:', 'blob:', 'https://*.supabase.co'] },
  { directive: 'font-src', sources: ["'self'"] },
  { directive: 'connect-src', sources: ["'self'", 'https://*.supabase.co', 'https://*.ingest.sentry.io'] },
  { directive: 'frame-ancestors', sources: ["'none'"] },
]

export function buildCspString(directives: CspDirective[], nonce: string): string {
  return directives
    .map(({ directive, sources }) => {
      const resolved = sources.map(s => s.replace('${nonce}', `'nonce-${nonce}'`))
      return `${directive} ${resolved.join(' ')}`
    })
    .join('; ')
}

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(p => {
    if (p === '/') return pathname === '/'
    return pathname === p || pathname.startsWith(p)
  })
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const nonce = crypto.randomUUID()
  const csp = buildCspString(cspDirectives, nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const authCookie = request.cookies.get('auth_logged_in')
  const isLoggedIn = authCookie?.value === 'true'
  requestHeaders.set('x-user-authenticated', isLoggedIn ? 'true' : 'false')

  if (!isPublicPath(pathname) && !isLoggedIn) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/solicitar') || pathname.startsWith('/solicitud')) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (pathname.startsWith('/admin')) {
    const mod = await import('@/lib/supabase/server')
    const supabase = await mod.createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!adminRole) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
