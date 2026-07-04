import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockResendInstance = { key: '' }

vi.mock('resend', () => ({
  Resend: vi.fn(function (key: string) {
    mockResendInstance.key = key
    return mockResendInstance
  }),
}))

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const mockEnv = {
  env: {
    SUPABASE_SERVICE_ROLE_KEY: 'test',
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    RESEND_API_KEY: 're_test_key',
  },
}

vi.mock('@/lib/env', () => mockEnv)

beforeEach(() => {
  vi.clearAllMocks()
  mockEnv.env.RESEND_API_KEY = 're_test_key'
})

describe('getResendClient', () => {
  it('returns null when RESEND_API_KEY is missing', async () => {
    mockEnv.env.RESEND_API_KEY = undefined as never

    const { getResendClient } = await import('./resend')
    const client = await getResendClient()
    expect(client).toBeNull()
  })

  it('returns a client instance when RESEND_API_KEY is set', async () => {
    const { getResendClient } = await import('./resend')
    const client = await getResendClient()

    expect(client).toEqual(mockResendInstance)
    expect(mockResendInstance.key).toBe('re_test_key')
  })
})
