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

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 60_000)
