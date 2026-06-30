import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendMagicLink, signOut } from './actions'

vi.mock('@/lib/env', () => ({
  env: {
    SUPABASE_SERVICE_ROLE_KEY: 'test-key',
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    RESEND_API_KEY: undefined,
    SENTRY_DSN: undefined,
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

import { createServerSupabase } from '@/lib/supabase/server'
import { headers } from 'next/headers'

function mockSupabase() {
  const mockSignInWithOtp = vi.fn()
  const mockSignOut = vi.fn()

  vi.mocked(createServerSupabase).mockResolvedValue({
    auth: {
      signInWithOtp: mockSignInWithOtp,
      signOut: mockSignOut,
    },
  } as never)

  vi.mocked(headers).mockResolvedValue({
    get: vi.fn().mockReturnValue('http://localhost:3000'),
  } as never)

  return { mockSignInWithOtp, mockSignOut }
}

describe('sendMagicLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success for valid email', async () => {
    const { mockSignInWithOtp } = mockSupabase()
    mockSignInWithOtp.mockResolvedValue({ error: null })

    const result = await sendMagicLink({ email: 'test@example.com' })

    expect(result).toEqual({ success: true })
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: { emailRedirectTo: 'http://localhost:3000/dashboard' },
    })
  })

  it('returns error for invalid email', async () => {
    mockSupabase()

    const result = await sendMagicLink({ email: 'not-an-email' })

    expect(result).toHaveProperty('error')
  })

  it('returns error when Supabase fails', async () => {
    const { mockSignInWithOtp } = mockSupabase()
    mockSignInWithOtp.mockResolvedValue({ error: new Error('Rate limit exceeded') })

    const result = await sendMagicLink({ email: 'test@example.com' })

    expect(result).toEqual({ error: 'Error al enviar el enlace. Intenta de nuevo.' })
  })
})

describe('signOut', () => {
  it('calls supabase.auth.signOut', async () => {
    const { mockSignOut } = mockSupabase()
    mockSignOut.mockResolvedValue({ error: null })

    await signOut()

    expect(mockSignOut).toHaveBeenCalledOnce()
  })
})