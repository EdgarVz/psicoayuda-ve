import { describe, it, expect } from 'vitest'

describe('env mock', () => {
  it('has required server env vars', async () => {
    const { env } = await import('@/lib/env')
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBeTypeOf('string')
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toMatch(/^https:\/\//)
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeTypeOf('string')
  })

  it('has optional env vars with fallback', async () => {
    const { env } = await import('@/lib/env')
    expect(env.NEXT_PUBLIC_SITE_URL).toBeTypeOf('string')
  })

  it('has SENTRY_DSN as optional', async () => {
    const { env } = await import('@/lib/env')
    expect(env.SENTRY_DSN).toBeUndefined()
  })
})
