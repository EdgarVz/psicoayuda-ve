import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rateLimit } from './rate-limit'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('rateLimit', () => {
  it('allows first request from an IP', async () => {
    const result = await rateLimit('192.168.1.1', 3, 10_000)
    expect(result.success).toBe(true)
  })

  it('blocks request after limit is reached', async () => {
    const ip = '192.168.1.2'

    const r1 = await rateLimit(ip, 2, 10_000)
    expect(r1.success).toBe(true)

    const r2 = await rateLimit(ip, 2, 10_000)
    expect(r2.success).toBe(true)

    const r3 = await rateLimit(ip, 2, 10_000)
    expect(r3.success).toBe(false)
  })

  it('treats different IPs independently', async () => {
    const r1 = await rateLimit('10.0.0.1', 1, 10_000)
    expect(r1.success).toBe(true)

    const r1b = await rateLimit('10.0.0.1', 1, 10_000)
    expect(r1b.success).toBe(false)

    const r2 = await rateLimit('10.0.0.2', 1, 10_000)
    expect(r2.success).toBe(true)
  })
})