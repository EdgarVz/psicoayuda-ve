import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withRateLimit } from './rate-limit'

describe('withRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('calls action when under limit', async () => {
    const action = vi.fn().mockResolvedValue('ok')
    const wrapped = withRateLimit(action, { limit: 3, windowMs: 60000, keyFn: () => 'ip-1' })
    const result = await wrapped()
    expect(result).toBe('ok')
    expect(action).toHaveBeenCalledOnce()
  })

  it('blocks when over limit', async () => {
    const action = vi.fn().mockResolvedValue('ok')
    const wrapped = withRateLimit(action, { limit: 2, windowMs: 60000, keyFn: () => 'ip-2' })
    await wrapped()
    await wrapped()
    const result = await wrapped()
    expect(result).toEqual({ error: expect.stringContaining('Demasiadas solicitudes') })
    expect(action).toHaveBeenCalledTimes(2)
  })

  it('resets after window expires', async () => {
    const action = vi.fn().mockResolvedValue('ok')
    const wrapped = withRateLimit(action, { limit: 1, windowMs: 60000, keyFn: () => 'ip-3' })
    await wrapped()
    const blocked = await wrapped()
    expect(blocked).toEqual({ error: expect.stringContaining('Demasiadas solicitudes') })
    vi.advanceTimersByTime(60001)
    const result = await wrapped()
    expect(result).toBe('ok')
    expect(action).toHaveBeenCalledTimes(2)
  })

  it('passes arguments to action', async () => {
    const action = vi.fn().mockResolvedValue('ok')
    const wrapped = withRateLimit(action, { limit: 5, windowMs: 60000, keyFn: (...args) => args[0] })
    await wrapped('arg1', 'arg2')
    expect(action).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('returns remaining seconds in error message', async () => {
    const action = vi.fn().mockResolvedValue('ok')
    const wrapped = withRateLimit(action, { limit: 1, windowMs: 60000, keyFn: () => 'ip-4' })
    await wrapped()
    const result = await wrapped()
    expect(result).toEqual({ error: expect.stringContaining('60') })
  })
})
