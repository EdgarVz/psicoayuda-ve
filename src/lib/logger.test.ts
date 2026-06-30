import { describe, it, expect, vi } from 'vitest'

vi.mock('@sentry/nextjs', () => ({ captureMessage: vi.fn() }))

describe('logger', () => {
  it('info does not throw', async () => {
    const { logger } = await import('./logger')
    expect(() => logger.info('test')).not.toThrow()
  })

  it('warn does not throw', async () => {
    const { logger } = await import('./logger')
    expect(() => logger.warn('test')).not.toThrow()
  })

  it('error calls console.error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { logger } = await import('./logger')
    logger.error('test error', new Error('boom'))
    expect(spy).toHaveBeenCalledWith('test error', expect.any(Error), undefined)
  })

  it('does not invoke Sentry when SENTRY_DSN is undefined', async () => {
    const { captureMessage } = await import('@sentry/nextjs')
    const { logger } = await import('./logger')
    logger.info('miss')
    logger.warn('miss')
    logger.error('miss')
    expect(captureMessage).not.toHaveBeenCalled()
  })
})
