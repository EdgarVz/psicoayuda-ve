import { describe, it, expect, vi, beforeEach } from 'vitest'

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

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabase: vi.fn(() => ({
    from: mockFrom,
    auth: { admin: { getUserById: vi.fn() } },
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/features/notifications/actions', () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
}))

describe('admin actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
      order: vi.fn().mockReturnThis(),
    })
  })

  it('verifyPsychologist returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { verifyPsychologist } = await import('./actions')
    const result = await verifyPsychologist('some-id')
    expect(result).toEqual({ error: 'Debes iniciar sesión' })
  })

  it('verifyPsychologist returns error when not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
      order: vi.fn().mockReturnThis(),
    })
    const { verifyPsychologist } = await import('./actions')
    const result = await verifyPsychologist('some-id')
    expect(result).toEqual({ error: 'No autorizado' })
  })

  it('verifyPsychologist succeeds for admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // First call: admin roles check
        return {
          select: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'admin-1' } }),
          order: vi.fn().mockReturnThis(),
        }
      }
      // Second call: update psychologist_profiles
      return {
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
        single: vi.fn().mockResolvedValue({ data: null }),
        order: vi.fn().mockReturnThis(),
      }
    })

    const { verifyPsychologist } = await import('./actions')
    const result = await verifyPsychologist('psy-id')
    expect(result).toEqual({})
  })

  it('rejectPsychologist returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { rejectPsychologist } = await import('./actions')
    const result = await rejectPsychologist('some-id')
    expect(result).toEqual({ error: 'Debes iniciar sesión' })
  })
})
