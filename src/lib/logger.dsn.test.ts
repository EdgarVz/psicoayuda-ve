import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/env', () => ({
  env: {
    SENTRY_DSN: 'https://key@sentry.io/project',
    SUPABASE_SERVICE_ROLE_KEY: 'test',
    RESEND_API_KEY: 're_test_key',
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  },
}))

vi.mock('@sentry/nextjs', () => ({ captureMessage: vi.fn() }))

describe('logger with SENTRY_DSN set', () => {
  it('calls Sentry.captureMessage', async () => {
    const { captureMessage } = await import('@sentry/nextjs')
    const { logger } = await import('./logger')

    logger.info('hello sentry')

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(captureMessage).toHaveBeenCalledWith('hello sentry', {
      level: 'info',
      extra: undefined,
    })
  })
})
