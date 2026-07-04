import { logger } from '@/lib/logger'

const store = new Map<string, { count: number; resetAt: number }>()

export async function rateLimit(ip: string, limit = 10, windowMs = 10_000): Promise<{ success: boolean }> {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return { success: true }
  }

  if (entry.count >= limit) {
    return { success: false }
  }

  entry.count++
  return { success: true }
}

export function getRemainingSeconds(key: string): number {
  const entry = store.get(key)
  if (!entry) return 0
  const remaining = Math.ceil((entry.resetAt - Date.now()) / 1000)
  return Math.max(0, remaining)
}

export function withRateLimit<TArgs extends unknown[], TReturn>(
  action: (...args: TArgs) => TReturn,
  options: { limit: number; windowMs: number; keyFn: (...args: TArgs) => string | Promise<string> },
): (...args: TArgs) => Promise<TReturn | { error: string }> {
  return async (...args: TArgs) => {
    const key = await options.keyFn(...args)
    const result = await rateLimit(key, options.limit, options.windowMs)
    if (!result.success) {
      const remaining = getRemainingSeconds(key)
      logger.warn(`Rate limit exceeded for key: ${key}`)
      return { error: `Demasiadas solicitudes. Intenta de nuevo en ${remaining} segundos.` } as { error: string }
    }
    return action(...args) as TReturn
  }
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 60_000)
