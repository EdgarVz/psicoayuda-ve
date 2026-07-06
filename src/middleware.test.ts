import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockNext, mockRedirect } = vi.hoisted(() => ({
  mockNext: vi.fn(),
  mockRedirect: vi.fn(),
}))

vi.mock('next/server', () => ({
  NextResponse: {
    next: mockNext,
    redirect: mockRedirect,
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(),
}))

import { proxy } from './proxy'
import { createServerSupabase } from '@/lib/supabase/server'

function createRequest(pathname: string, isLoggedIn = false) {
  const url = new URL(`https://example.com${pathname}`)
  return {
    nextUrl: url,
    url: url.href,
    cookies: {
      get: vi.fn().mockReturnValue(isLoggedIn ? { value: 'true' } : undefined),
    },
    headers: new Headers(),
  }
}

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /login for /dashboard without auth cookie', async () => {
    const req = createRequest('/dashboard')
    const expectedUrl = new URL('/login', 'https://example.com/dashboard')
    expectedUrl.searchParams.set('redirect', '/dashboard')
    const mockResponse = { status: 307 }
    mockRedirect.mockReturnValue(mockResponse)

    const result = await proxy(req as never)

    expect(mockRedirect).toHaveBeenCalledWith(expectedUrl)
    expect(result).toBe(mockResponse)
  })

  it('redirects to /login for /admin without auth cookie', async () => {
    const req = createRequest('/admin')
    vi.mocked(createServerSupabase).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never)

    const result = await proxy(req as never)

    expect(mockRedirect).toHaveBeenCalledWith(new URL('/login', req.url))
    expect(result).toBeDefined()
  })

  it('sets CSP header on response', async () => {
    const req = createRequest('/psicologos')
    const headers = new Headers()
    mockNext.mockReturnValue({ headers })

    const result = await proxy(req as never)

    const csp = headers.get('Content-Security-Policy')
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("script-src 'self'")
    expect(csp).toContain("style-src 'self'")
    expect(result).toBeDefined()
  })

  it('passes through /psicologos without auth cookie', async () => {
    const req = createRequest('/psicologos')
    const headers = new Headers()
    mockNext.mockReturnValue({ headers })

    await proxy(req as never)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalled()
  })

  it('passes through /como-funciona without auth cookie', async () => {
    const req = createRequest('/como-funciona')
    const headers = new Headers()
    mockNext.mockReturnValue({ headers })

    await proxy(req as never)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalled()
  })
})
